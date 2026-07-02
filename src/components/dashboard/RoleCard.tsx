import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  role: string;
};

const roleVariant: Record<string, "default" | "warning" | "secondary"> = {
  ADMIN: "default",
  BOARD: "warning",
  MANAGER: "warning",
  MEMBER: "secondary",
};

export function RoleCard({ role }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Role</CardTitle>
          <ShieldCheck className="size-3.5 text-moto-cyan/50" />
        </div>
      </CardHeader>

      <CardContent>
        <Badge variant={roleVariant[role] ?? "secondary"}>
          {role}
        </Badge>
      </CardContent>
    </Card>
  );
}
