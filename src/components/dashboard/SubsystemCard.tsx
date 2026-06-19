import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  subsystem: string;
};

export function SubsystemCard({
  subsystem,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subsystem</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold">
          {subsystem}
        </p>
      </CardContent>
    </Card>
  );
}