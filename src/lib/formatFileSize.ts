export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return "0 B";
  const b = Number(bytes || 0);
  if (b === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1).replace(/\.0$/, "")} ${sizes[i]}`;
}
