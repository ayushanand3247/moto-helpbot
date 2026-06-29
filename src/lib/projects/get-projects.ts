import { createClient } from "@/lib/supabase/server";

export type ProjectWithProgress = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  target_date: string | null;
  created_by: string | null;
  created_at: string | null;
  total_tasks: number;
  completed_tasks: number;
};

export async function getProjects(): Promise<ProjectWithProgress[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
      milestones (
        tasks ( status )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((project: any) => {
    const tasks: { status: string | null }[] = project.milestones?.flatMap(
      (m: any) => m.tasks || []
    ) || [];

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      target_date: project.target_date,
      created_by: project.created_by,
      created_at: project.created_at,
      total_tasks: tasks.length,
      completed_tasks: tasks.filter((t) => t.status === "APPROVED").length,
    };
  });
}
