export type ProfileWithSubsystem = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "BOARD" | "MEMBER";
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