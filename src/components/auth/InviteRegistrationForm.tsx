"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, KeyRound, Mail, ShieldCheck, User } from "lucide-react";

import { registerUser } from "@/actions/auth/register-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registrationSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegistrationValues = z.infer<typeof registrationSchema>;

type InviteRegistrationFormProps = {
  token: string;
  email: string;
  fullName: string;
  position: string | null;
  subsystemName: string | null;
};

export function InviteRegistrationForm({
  token,
  email,
  fullName: initialFullName,
  position,
  subsystemName,
}: InviteRegistrationFormProps) {
  const [message, setMessage] = useState("");
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: initialFullName,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegistrationValues) {
    setMessage("");

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", values.password);
    formData.append("fullName", values.fullName);

    try {
      const result = await registerUser(null, formData);
      if (result?.error) {
        setMessage(result.error);
      }
    } catch (error) {
      if (error instanceof Error && (error.message === "NEXT_REDIRECT" || error.message.startsWith("NEXT_REDIRECT"))) {
        throw error;
      }
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred during registration.");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl tracking-tight">Join MotoManipal</CardTitle>
        <CardDescription>Complete your profile and set up your account credentials.</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-2">
            {message ? <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{message}</div> : null}

            {(subsystemName || position) ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-zinc-400">
                You are joining as {position ? <span className="font-medium text-zinc-200">{position}</span> : null}{position && subsystemName ? " of " : null}{subsystemName ? <span className="font-medium text-zinc-200">{subsystemName}</span> : null}.
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200"><Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address</label>
              <Input type="email" value={email} disabled className="bg-zinc-800 text-zinc-400" />
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold"><User className="h-3.5 w-3.5 text-zinc-400" /> Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold"><KeyRound className="h-3.5 w-3.5 text-zinc-400" /> Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold"><KeyRound className="h-3.5 w-3.5 text-zinc-400" /> Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-6 pt-2">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up account...
                </>
              ) : (
                "Register & Join"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

