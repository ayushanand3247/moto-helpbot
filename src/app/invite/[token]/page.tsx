import { adminClient } from "@/lib/supabase/admin";
import { InviteRegistrationForm } from "@/components/auth/InviteRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const { data: invitation } = await adminClient
    .from("invitations")
    .select(`
      *,
      subsystems (
        name
      )
    `)
    .eq("token", token)
    .single();

  let errorTitle = "";
  let errorDescription = "";

  if (!invitation) {
    errorTitle = "Invitation Not Found";
    errorDescription = "The invitation link is invalid or does not exist. Please check the URL or request a new invite.";
  } else if (invitation.accepted_at) {
    errorTitle = "Invitation Already Accepted";
    errorDescription = `The invitation for ${invitation.email} has already been accepted. If this was you, please proceed to login.`;
  } else if (new Date(invitation.expires_at) < new Date()) {
    errorTitle = "Invitation Expired";
    errorDescription = "This invitation link has expired. Invitations are only valid for 7 days. Please ask your administrator to send a new invite.";
  }

  if (errorTitle) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/5">
              <ShieldAlert className="size-5 text-red-400" />
            </div>
            <CardTitle className="text-xl tracking-tight">{errorTitle}</CardTitle>
            <CardDescription>Verification Failed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-sm leading-relaxed text-zinc-400">{errorDescription}</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/login">
                  <ArrowLeft className="size-4" /> Go to Login
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="size-4" /> Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <InviteRegistrationForm
        token={token}
        email={invitation.email}
        fullName={invitation.full_name}
        position={invitation.position}
        subsystemName={invitation.subsystems ? (invitation.subsystems as { name: string }).name : null}
      />
    </div>
  );
}
