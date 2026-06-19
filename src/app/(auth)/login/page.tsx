import { login } from "@/actions/auth";

export default function LoginPage() {
  return (
    <form action={login}>
      <input
        type="email"
        name="email"
        placeholder="Email"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
      />

      <button type="submit">
        Sign In
      </button>
    </form>
  );
}