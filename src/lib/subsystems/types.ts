export interface SubsystemDetail {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface SubsystemMember {
  id: string;
  full_name: string;
  email: string;
  position: string | null;
  role: string;
  assignedTaskCount: number;
}

export interface SubsystemTask {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  deadline: string | null;
  subsystem_id: string | null;
  profiles: { id: string; full_name: string }[] | null;
  subsystems: { id: string; name: string }[] | null;
}
