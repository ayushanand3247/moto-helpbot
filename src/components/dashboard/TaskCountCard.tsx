import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  count: number;
};

export function TaskCountCard({
  count,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Tasks</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold">
          {count}
        </p>
      </CardContent>
    </Card>
  );
}