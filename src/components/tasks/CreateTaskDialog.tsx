"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { createTask } from "@/actions/tasks/create-task";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  milestoneId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  subsystems: any[];
};

type FormValues = {
  title: string;
  description: string;
  subsystem_id: string;
  priority: string;
  deadline: string;
  estimated_hours: string;
};

const taskPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function CreateTaskDialog({
  milestoneId,
  projectId,
  open,
  onOpenChange,
  members,
  subsystems,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      subsystem_id: "",
      priority: "MEDIUM",
      deadline: "",
      estimated_hours: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setIsSubmitting(true);
      await createTask({
        milestoneId,
        projectId,
        title: values.title,
        description: values.description || undefined,
        subsystem_id: values.subsystem_id || undefined,
        assigned_to_ids: selectedAssigneeIds,
        priority: (values.priority as any) || "MEDIUM",
        deadline: values.deadline || undefined,
        estimated_hours: values.estimated_hours
          ? parseInt(values.estimated_hours)
          : undefined,
      });
      form.reset();
      setSelectedAssigneeIds([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      form.setError("title", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create task",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Task title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subsystem — dynamic from DB */}
            <FormField
              control={form.control as any}
              name="subsystem_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subsystem</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subsystem…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subsystems.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No subsystems available.
                        </SelectItem>
                      ) : (
                        subsystems.map((subsystem) => (
                          <SelectItem
                            key={subsystem.id}
                            value={subsystem.id}
                          >
                            {subsystem.icon ? `${subsystem.icon} ` : ""}{subsystem.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-assignee selector */}
            <FormItem>
              <FormLabel>Assignees</FormLabel>
              <div className="space-y-2">
                {/* Selected assignees as chips */}
                {selectedAssigneeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAssigneeIds.map((uid) => {
                      const u = members.find((m) => m.id === uid);
                      if (!u) return null;
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 rounded-sm border border-border/40 bg-[#0e0e12] px-1.5 py-0.5 text-[10px] text-[#b8b8c4]"
                        >
                          {u.full_name}
                          {u.subsystem_name && (
                            <span className="text-muted-foreground/60">
                              · {u.subsystem_name}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleAssignee(uid)}
                            className="ml-0.5 text-muted-foreground/60 hover:text-[#e8241a]"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Add member select */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleAssignee(e.target.value);
                    }
                  }}
                  className="h-7 w-full rounded-sm border border-border/60 bg-input px-2 text-xs text-foreground outline-none"
                >
                  <option value="">+ Add member…</option>
                  {members
                    .filter((m) => !selectedAssigneeIds.includes(m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                        {m.subsystem_name ? ` — ${m.subsystem_name}` : ""}
                      </option>
                    ))}
                </select>
              </div>
            </FormItem>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskPriorities.map((priority) => (
                          <SelectItem
                            key={priority}
                            value={priority}
                          >
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Estimated Hours
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating..."
                  : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
