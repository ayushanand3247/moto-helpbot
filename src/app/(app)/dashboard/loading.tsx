export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[#e8241a]/30 border-t-[#e8241a]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6a6a78]">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
