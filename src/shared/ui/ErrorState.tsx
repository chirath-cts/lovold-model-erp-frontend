interface ErrorStateProps {
  message?: string;
  title?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "The requested data could not be loaded.",
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-[#ffdad6] bg-[#fff2ef] px-4 py-4 text-[#93000a] shadow-sm">
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-sm font-medium">{message}</div>
    </div>
  );
}
