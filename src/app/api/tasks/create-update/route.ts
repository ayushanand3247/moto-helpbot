import { NextResponse } from "next/server";

import { createTaskUpdate } from "@/actions/create-task-update";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createTaskUpdate(body);

    if (!result || !result.success) {
      return NextResponse.json({ success: false, message: result?.message || "Failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, update_id: result.update_id });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Invalid" }, { status: 400 });
  }
}
