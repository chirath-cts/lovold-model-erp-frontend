interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-slate-200 bg-white">
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
