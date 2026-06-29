import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";

type Props = {
  name: string;
  role: string;
};

export function UserMenu({ name, role }: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* User info */}
      <div className="text-right">
        <p className="text-xs font-medium text-foreground/90 leading-none">
          {name}
        </p>
        <p className="text-[0.6rem] font-mono tracking-wider uppercase text-muted-foreground/70 mt-0.5">
          {role}
        </p>
      </div>

      {/* Avatar placeholder — precision circle */}
      <div className="size-7 rounded-full bg-moto-cyan/10 border border-moto-cyan/20 flex items-center justify-center">
        <span className="text-[0.6rem] font-semibold text-moto-cyan uppercase">
          {name?.charAt(0) ?? "?"}
        </span>
      </div>

      {/* Logout — precision control */}
      <form action={logout}>
        <button
          type="submit"
          className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-moto-red hover:bg-moto-red/10 transition-colors duration-150"
        >
          <LogOut className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
