import { logout } from "@/actions/auth";

type Props = {
  name: string;
  role: string;
};

export function UserMenu({ name, role }: Props) {
  return (
    <div>
      <p>{name}</p>
      <p>{role}</p>

      <form action={logout}>
        <button type="submit">
          Logout
        </button>
      </form>
    </div>
  );
}