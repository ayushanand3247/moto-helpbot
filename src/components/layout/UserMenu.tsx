import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  role: string;
};

export function UserMenu({ name, role }: Props) {
  return (
    <div className="ml-auto flex items-center gap-4">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-zinc-100">{name}</p>
        <p className="text-xs text-zinc-500">{role}</p>
      </div>

      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Logout
        </Button>
      </form>
    </div>
  );
}
