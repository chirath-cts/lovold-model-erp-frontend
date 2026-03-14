import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

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
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select {...field} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00526C] focus:outline-none">
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
    </label>
  );
}

export function NumberField<TFieldValues extends FieldValues>({ control, name, label }: BaseProps<TFieldValues>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
            {...field}
            type="number"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00526C] focus:outline-none"
            onChange={(event) => field.onChange(Number(event.target.value))}
          />
        )}
      />
    </label>
  );
}

export function TextField<TFieldValues extends FieldValues>({ control, name, label }: BaseProps<TFieldValues>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
            {...field}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00526C] focus:outline-none"
          />
        )}
      />
    </label>
  );
}

export function DateField<TFieldValues extends FieldValues>({ control, name, label }: BaseProps<TFieldValues>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
            {...field}
            type="date"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00526C] focus:outline-none"
          />
        )}
      />
    </label>
  );
}
