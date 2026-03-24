interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-[#ffdad6] bg-[#fff2ef] px-4 py-3 text-sm font-semibold text-[#93000a] shadow-sm">
      {message}
    </div>
  );
}
