import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

type Props = {
  name: string;
};

export function UserCard({ name }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User</CardTitle>
          <User className="size-3.5 text-moto-cyan/50" />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-xl font-semibold text-foreground tracking-tight">
          {name}
        </p>
      </CardContent>
    </Card>
  );
}
