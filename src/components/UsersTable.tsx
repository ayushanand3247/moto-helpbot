"use client";

import React from "react";

export default function UsersTable({ users }: { users: any[] }) {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Subsystem</th>
          <th>Position</th>
          <th>Joined</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b">
            <td>{u.avatar_url ? <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}</td>
            <td>{u.full_name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>{u.subsystems?.title || u.subsystem_id || "-"}</td>
            <td>{u.position || "-"}</td>
            <td>{u.joined_year || "-"}</td>
            <td>{u.is_active ? "Active" : "Inactive"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
