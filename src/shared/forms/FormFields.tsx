import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField as MuiTextField,
} from "@mui/material";

interface BaseProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
}

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps<TFieldValues extends FieldValues> extends BaseProps<TFieldValues> {
  options: Option[];
}

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
}: SelectFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth size="small">
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}

export function NumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: BaseProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MuiTextField
          {...field}
          fullWidth
          size="small"
          type="number"
          label={label}
          onChange={(event) => field.onChange(Number(event.target.value))}
        />
      )}
    />
  );
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: BaseProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <MuiTextField {...field} fullWidth size="small" label={label} />}
    />
  );
}

export function DateField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: BaseProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MuiTextField
          {...field}
          fullWidth
          size="small"
          label={label}
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
}
