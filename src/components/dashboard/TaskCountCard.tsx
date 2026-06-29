import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks } from "lucide-react";

type Props = {
  count: number;
};

export function TaskCountCard({
  count,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Tasks</CardTitle>
          <ListChecks className="size-3.5 text-moto-cyan/50" />
        </div>
      </CardHeader>

      <CardContent>
        <p className="moto-number text-2xl font-bold text-moto-cyan tracking-tighter">
          {count}
        </p>
      </CardContent>
    </Card>
  );
}
