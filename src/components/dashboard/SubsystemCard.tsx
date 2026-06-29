import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cog } from "lucide-react";

type Props = {
  subsystem: string;
};

export function SubsystemCard({
  subsystem,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subsystem</CardTitle>
          <Cog className="size-3.5 text-moto-cyan/50" />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-base font-medium text-foreground/90 tracking-tight">
          {subsystem}
        </p>
      </CardContent>
    </Card>
  );
}
