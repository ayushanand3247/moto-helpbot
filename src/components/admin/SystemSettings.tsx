"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SettingsGroup = {
  title: string;
  fields: { key: string; label: string; type: "text" | "select" | "number"; options?: string[]; defaultValue: string }[];
};

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "General",
    fields: [
      { key: "team_name", label: "Team Name", type: "text", defaultValue: "MotoManipal" },
      { key: "timezone", label: "Timezone", type: "select", options: ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"], defaultValue: "Asia/Kolkata" },
      { key: "default_theme", label: "Default Theme", type: "select", options: ["dark", "light"], defaultValue: "dark" },
    ],
  },
  {
    title: "Projects & Tasks",
    fields: [
      { key: "default_project_status", label: "Default Project Status", type: "select", options: ["PLANNING", "ACTIVE"], defaultValue: "PLANNING" },
      { key: "default_task_priority", label: "Default Task Priority", type: "select", options: ["LOW", "MEDIUM", "HIGH"], defaultValue: "MEDIUM" },
    ],
  },
  {
    title: "Files & Uploads",
    fields: [
      { key: "max_upload_mb", label: "Max Upload Size (MB)", type: "number", defaultValue: "10" },
      { key: "allowed_types", label: "Allowed Attachment Types", type: "text", defaultValue: "pdf,doc,docx,xls,xlsx,png,jpg,zip" },
    ],
  },
];

// Local state for settings (persisted to localStorage as placeholder)
function getStored(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(`admin_setting_${key}`) ?? fallback;
}

export function SystemSettings() {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SETTINGS_GROUPS.forEach((g) =>
      g.fields.forEach((f) => { init[f.key] = f.defaultValue; })
    );
    return init;
  });
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useState(() => {
    SETTINGS_GROUPS.forEach((g) =>
      g.fields.forEach((f) => {
        const stored = getStored(f.key, f.defaultValue);
        if (stored !== f.defaultValue) {
          setValues((prev) => ({ ...prev, [f.key]: stored }));
        }
      })
    );
  });

  const handleSave = () => {
    Object.entries(values).forEach(([k, v]) => localStorage.setItem(`admin_setting_${k}`, v));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">System Settings</h2>

      <div className="space-y-4">
        {SETTINGS_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="!text-xs !text-muted-foreground !uppercase !tracking-wider">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.fields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="w-48 text-xs text-muted-foreground shrink-0">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      value={values[field.key] ?? field.defaultValue}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none flex-1"
                    >
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.key] ?? field.defaultValue}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none flex-1"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="h-7 rounded-sm bg-moto-cyan/20 px-3 font-mono text-[10px] uppercase text-moto-cyan hover:bg-moto-cyan/30">
          Save Settings
        </button>
        {saved && <span className="font-mono text-[10px] text-[#22c55e]">Settings saved</span>}
      </div>
    </div>
  );
}
