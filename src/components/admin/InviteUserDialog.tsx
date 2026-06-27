"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createInvitation } from "@/actions/admin/create-invitation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subsystem = {
  id: string;
  name: string;
};

type InviteUserDialogProps = {
  subsystems: Subsystem[];
};

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  full_name: z.string().min(2, "Full name is required"),
  role: z.enum(["MEMBER", "BOARD", "ADMIN"]),
  subsystem_id: z.string().uuid("Select a subsystem"),
  position: z.string().min(2, "Position is required"),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function InviteUserDialog({ subsystems }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "MEMBER",
      subsystem_id: "",
      position: "",
    },
  });

  async function onSubmit(values: InviteValues) {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("full_name", values.full_name);
    formData.append("role", values.role);
    formData.append("subsystem_id", values.subsystem_id);
    formData.append("position", values.position);

    const result = await createInvitation(null, formData);
    if (result?.error) {
      form.setError("root", { message: result.error });
      return;
    }

    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Invite User</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-zinc-800 bg-zinc-900 shadow-2xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="tracking-tight">Invite Team Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {form.formState.errors.root?.message ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="member@motomanipal.in" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ayush Anand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MEMBER">MEMBER</SelectItem>
                        <SelectItem value="BOARD">BOARD</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subsystem_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsystem</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subsystem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subsystems.map((subsystem) => (
                          <SelectItem key={subsystem.id} value={subsystem.id}>
                            {subsystem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position / Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Powertrain Lead" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

