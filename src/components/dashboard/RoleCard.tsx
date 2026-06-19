import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  role: string;
};

export function RoleCard({ role }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold">
          {role}
        </p>
      </CardContent>
    </Card>
  );
}