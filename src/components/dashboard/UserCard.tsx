import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  name: string;
};

export function UserCard({ name }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold">
          {name}
        </p>
      </CardContent>
    </Card>
  );
}