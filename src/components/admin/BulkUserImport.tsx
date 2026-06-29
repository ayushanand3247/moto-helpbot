"use client";

import { useState } from "react";
import { bulkCreateUsers, type BulkUserInput, type BulkUserResult } from "@/actions/admin/bulk-create-users";
import { Check, AlertCircle, Eye, EyeOff, Copy, CheckCheck } from "lucide-react";

type Subsystem = { id: string; name: string; [key: string]: unknown };

type Props = { subsystems: Subsystem[] };

export function BulkUserImport({ subsystems }: Props) {
  const [rawInput, setRawInput] = useState("");
  const [parsed, setParsed] = useState<BulkUserInput[]>([]);
  const [results, setResults] = useState<BulkUserResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const parseInput = () => {
    setError("");
    setResults(null);

    const lines = rawInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError("Paste at least one line. Format: Full Name, Email, Subsystem");
      return;
    }

    const parsed: BulkUserInput[] = [];
    const errors: string[] = [];

    lines.forEach((line, i) => {
      // Support comma, tab, or pipe separated
      const parts = line.split(/[,|\t]/).map((p) => p.trim());

      if (parts.length < 2) {
        errors.push(`Line ${i + 1}: needs at least name and email`);
        return;
      }

      const full_name = parts[0];
      const email = parts[1];
      const subsystem_name = parts[2] || "";

      if (!email.includes("@")) {
        errors.push(`Line ${i + 1}: invalid email "${email}"`);
        return;
      }

      parsed.push({ full_name, email, subsystem_name });
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    setParsed(parsed);
  };

  const handleCreate = async () => {
    if (parsed.length === 0) return;
    setLoading(true);
    setResults(null);

    const { results } = await bulkCreateUsers(parsed);
    setResults(results);
    setLoading(false);
  };

  const successCount = results?.filter((r) => r.status === "success").length ?? 0;
  const failCount = results?.filter((r) => r.status === "error").length ?? 0;

  const copyAllCredentials = () => {
    if (!results) return;
    const lines = results
      .filter((r) => r.status === "success")
      .map((r) => `${r.full_name}\t${r.email}\t${r.password}`);
    const text = "Name\tEmail\tPassword\n" + lines.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Bulk User Import
        </h2>
        <p className="text-xs text-muted-foreground/70">
          Paste your team data below. Format: <code className="text-[10px] bg-[#0a0a0e] px-1 py-0.5 rounded border border-[#222228]">Full Name, Email, Subsystem</code> (one per line). Comma, tab, or pipe separated.
        </p>
      </div>

      {/* Available subsystems hint */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] text-muted-foreground/60">Available subsystems:</span>
        {subsystems.map((s) => (
          <span key={s.id} className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-[#222228] bg-[#0a0a0e] text-muted-foreground/70">
            {s.name}
          </span>
        ))}
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <textarea
          value={rawInput}
          onChange={(e) => {
            setRawInput(e.target.value);
            setParsed([]);
            setResults(null);
            setError("");
          }}
          placeholder={`Ayush Kumar, ayush@example.com, Machine Learning\nRahul Singh, rahul@example.com, Structures\nAnanya Sharma, ananya@example.com, EPT (Electrical, Powertrain & Telemetry)`}
          rows={8}
          className="w-full rounded-sm border border-[#222228] bg-[#0a0a0e] px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:border-moto-cyan/40 resize-none"
        />

        {error && (
          <div className="rounded-sm border border-[#e8241a]/30 bg-[#e8241a]/5 px-3 py-2">
            <p className="text-[10px] text-[#e8241a] whitespace-pre-line">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={parseInput}
          disabled={!rawInput.trim()}
          className="h-7 rounded-sm border border-[#2a2a32] px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-[#b8b8c4] transition-colors hover:border-[#6a6a78] hover:text-foreground disabled:opacity-40"
        >
          Preview ({rawInput.split("\n").filter((l) => l.trim()).length} lines)
        </button>

        {parsed.length > 0 && !results && (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="h-7 rounded-sm bg-moto-cyan/20 px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-moto-cyan transition-colors hover:bg-moto-cyan/30 disabled:opacity-40"
          >
            {loading ? "Creating…" : `Create ${parsed.length} Users`}
          </button>
        )}
      </div>

      {/* Preview table */}
      {parsed.length > 0 && !results && (
        <div className="rounded-sm border border-[#1e1e24] overflow-hidden">
          <div className="bg-[#070709] px-3 py-2 border-b border-[#1e1e24]">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">
              Preview — {parsed.length} user{parsed.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {parsed.map((u, i) => {
              const subExists = subsystems.some(
                (s) => s.name.toLowerCase() === u.subsystem_name.toLowerCase().trim()
              );
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5 border-b border-[#1a1a20] last:border-0 text-xs">
                  <span className="text-muted-foreground/40 font-mono text-[10px] w-5">{i + 1}</span>
                  <span className="text-foreground flex-1 truncate">{u.full_name}</span>
                  <span className="text-muted-foreground flex-1 truncate">{u.email}</span>
                  <span className={`text-[10px] truncate max-w-[140px] ${subExists ? "text-muted-foreground/70" : "text-[#e8241a]"}`}>
                    {u.subsystem_name || <em className="text-[#e8241a]">{"none"}</em>}
                    {!subExists && u.subsystem_name && " ⚠"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Check className="size-3 text-[#22c55e]" />
              <span className="text-xs text-[#22c55e]">{successCount} created</span>
            </div>
            {failCount > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-3 text-[#e8241a]" />
                <span className="text-xs text-[#e8241a]">{failCount} failed</span>
              </div>
            )}
            <div className="flex-1" />
            <button
              onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-1 h-6 px-2 rounded-sm border border-[#2a2a32] text-[10px] text-[#8a8a98] hover:text-[#b8b8c4]"
            >
              {showPasswords ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
            <button
              onClick={copyAllCredentials}
              className="flex items-center gap-1 h-6 px-2 rounded-sm border border-[#2a2a32] text-[10px] text-[#8a8a98] hover:text-[#b8b8c4]"
            >
              {copied ? <CheckCheck className="size-3 text-[#22c55e]" /> : <Copy className="size-3" />}
              {copied ? "Copied!" : "Copy all"}
            </button>
          </div>

          {/* Results table */}
          <div className="rounded-sm border border-[#1e1e24] overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-3 py-2 border-b border-[#1a1a20] last:border-0 text-xs ${
                    r.status === "error" ? "bg-[#e8241a]/5" : ""
                  }`}
                >
                  <span className="text-foreground truncate">{r.full_name}</span>
                  <span className="text-muted-foreground truncate">{r.email}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    {showPasswords ? r.password : "••••••••"}
                  </span>
                  {r.status === "success" ? (
                    <Check className="size-3.5 text-[#22c55e]" />
                  ) : (
                    <div title={r.error}>
                      <AlertCircle className="size-3.5 text-[#e8241a]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Download hint */}
          {successCount > 0 && (
            <p className="text-[10px] text-muted-foreground/50">
              Click &quot;Copy all&quot; to copy a tab-separated list you can paste into Excel/Google Sheets to share credentials with your team.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
