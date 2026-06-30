"use client";

export function FeedbackLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-feedback"))}
      className={className || "text-sm text-slate-500 transition-colors hover:text-brand-700"}
    >
      Sugerencias y reportes
    </button>
  );
}
