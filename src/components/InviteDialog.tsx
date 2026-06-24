"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", role: "MEMBER", position: "", subsystem_id: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // check profile role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "ADMIN") throw new Error("Forbidden");

      // ensure email not used
      const { data: existing } = await supabase.from("profiles").select("id").eq("email", form.email).maybeSingle();
      if (existing) throw new Error("Email already in use");

      const token = crypto.randomUUID();
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from("invitations").insert([
        {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          subsystem_id: form.subsystem_id || null,
          position: form.position || null,
          invited_by: user.id,
          token,
          expires_at,
        },
      ]);

      if (error) throw error;

      await supabase.from("activity_logs").insert([
        { action: "USER_INVITED", actor_id: user.id, entity_type: "invitation", entity_id: token, metadata: { email: form.email } },
      ]);

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/invite?token=${token}`;
      setMessage(`Invitation created. Share link: ${inviteUrl}`);
      setForm({ full_name: "", email: "", role: "MEMBER", position: "", subsystem_id: "" });
    } catch (err: any) {
      setMessage(err.message || "Error");
    }
    setLoading(false);
  }

  return (
    <div>
      <button onClick={() => setOpen(true)} className="btn">Invite User</button>

      {open && (
        <div className="dialog">
          <form onSubmit={submit}>
            <h3 className="text-lg font-bold mb-2">Invite User</h3>
            <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="MEMBER">MEMBER</option>
              <option value="BOARD">BOARD</option>
            </select>
            <input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <input placeholder="Subsystem ID" value={form.subsystem_id} onChange={(e) => setForm({ ...form, subsystem_id: e.target.value })} />

            <div className="mt-2">
              <button type="submit" disabled={loading} className="btn btn-primary">Send Invite</button>
              <button type="button" onClick={() => setOpen(false)} className="btn ml-2">Cancel</button>
            </div>

            {message && <div className="mt-2">{message}</div>}
          </form>
        </div>
      )}
    </div>
  );
}
