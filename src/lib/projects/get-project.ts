import { adminClient } from "@/lib/supabase/admin";

export type ProjectDetailWithProgress = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  target_date: string | null;
  created_by: string | null;
  created_at: string | null;
  subsystem_id: string | null;
  total_tasks: number;
  completed_tasks: number;
};

export async function getProject(id: string): Promise<ProjectDetailWithProgress> {
  // Use admin client to avoid RLS issues in server components
  const supabase = adminClient;

  // Fetch project first (single row — safe to use .single())
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      description,
      status,
      start_date,
      target_date,
      created_by,
      created_at,
      subsystem_id
    `)
    .eq("id", id)
    .single();

  if (projectError) {
    // If not found, return a dummy that will trigger notFound() in the page
    if (projectError.code === "PGRST116") {
      throw new Error("PROJECT_NOT_FOUND");
    }
    throw new Error(projectError.message);
  }

  // Fetch tasks for this project via milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select(`
      tasks ( status )
    `)
    .eq("project_id", id);

  const tasks: { status: string | null }[] = (milestones || []).flatMap(
    (m: any) => m.tasks || []
  );

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    start_date: project.start_date,
    target_date: project.target_date,
    created_by: project.created_by,
    created_at: project.created_at,
    subsystem_id: project.subsystem_id,
    total_tasks: tasks.length,
    completed_tasks: tasks.filter((t) => t.status === "APPROVED").length,
  };
}
