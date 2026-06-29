export type ProfileWithSubsystem = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "TEAM_MANAGER" | "CAPTAIN" | "SUBSYSTEM_LEAD" | "MEMBER";
  position: string | null;
  phone: string | null;
  skills: string[] | null;

  subsystems:
    | {
        id: string;
        name: string;
      }
    | null;
};