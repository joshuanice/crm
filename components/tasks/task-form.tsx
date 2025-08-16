"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckCircle2, Clock, Loader2, Plus } from "lucide-react";
import type { NewTaskInput, Task } from "@/types/task";

export function TaskForm({ onCreated }: { onCreated?: (task: Task) => void }) {
  const [form, setForm] = useState<NewTaskInput>({ title: "", description: "", due_date: "", status: "pending" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.title?.trim()) {
      setError("Title is required");
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      status: form.status ?? "pending",
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    } as const;
    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select("id, title, description, status, due_date, created_at")
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error("Failed to add task", { description: error.message });
      return;
    }
    if (data) {
      onCreated?.(data as Task);
      setForm({ title: "", description: "", due_date: "", status: "pending" });
      setSuccess("Task added successfully");
      toast.success("Task added", { description: payload.title || undefined });
      window.setTimeout(() => setSuccess(null), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top row: Title + Due date */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Plus className="h-4 w-4" />
            </div>
            <Input
              id="title"
              placeholder="Write a clear, concise task title"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
              className="h-11 pl-9 text-base"
            />
          </div>
          <p className="text-xs text-muted-foreground">Example: "Follow up with ACME on contract"</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date" className="text-sm font-semibold">Due date</Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <Input
              id="due_date"
              type="date"
              value={form.due_date ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, due_date: e.target.value }))}
              className="h-11 pl-9 text-base"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
          <Textarea
            id="description"
            placeholder="Add more context, links, or notes (optional)"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            className="min-h-28 text-base"
          />
        </div>
      </div>

      {/* Status segmented control */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Status</Label>
        <div className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 p-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/40 sm:w-auto">
          <button
            type="button"
            onClick={() => setForm((s) => ({ ...s, status: "pending" }))}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
              form.status === "pending"
                ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={form.status === "pending"}
          >
            <Clock className="h-4 w-4" /> Pending
          </button>
          <button
            type="button"
            onClick={() => setForm((s) => ({ ...s, status: "in_progress" }))}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
              form.status === "in_progress"
                ? "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30 dark:text-blue-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={form.status === "in_progress"}
          >
            <Loader2 className="h-4 w-4" /> In progress
          </button>
          <button
            type="button"
            onClick={() => setForm((s) => ({ ...s, status: "complete" }))}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
              form.status === "complete"
                ? "bg-green-500/10 text-green-700 ring-1 ring-green-500/30 dark:text-green-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={form.status === "complete"}
          >
            <CheckCircle2 className="h-4 w-4" /> Complete
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {error && (
          <div className="text-sm rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div
            className="text-sm rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-green-700 dark:text-green-400"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground hover:opacity-90" disabled={loading}>
          {loading ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
}
