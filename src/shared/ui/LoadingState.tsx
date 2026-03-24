interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3 text-sm text-[#40484e]">
        <svg
          className="h-5 w-5 animate-spin text-[#003a4d]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" />
          <path d="M22 12a10 10 0 0 1-10 10" />
        </svg>
        <span>{label}</span>
      </div>
    </div>
  );
}
