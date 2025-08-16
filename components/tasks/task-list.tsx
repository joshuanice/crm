"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Task } from "@/types/task";
import { Calendar, CheckCircle2, Clock, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";

type Counts = { total: number; pending: number; in_progress: number; complete: number };

export function TaskList({
  initial,
  refreshKey,
  query: controlledQuery,
  showTools = true,
  onCountsChange,
}: {
  initial?: Task[];
  refreshKey?: number;
  query?: string;
  showTools?: boolean;
  onCountsChange?: (counts: Counts) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(initial ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery ?? internalQuery;

  const total = tasks.length;
  const completeCount = tasks.filter((t) => t.status === "complete").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const visible = tasks.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q) ?? false)
    );
  });

  useEffect(() => {
    onCountsChange?.({ total, pending: pendingCount, in_progress: inProgressCount, complete: completeCount });
  }, [total, pendingCount, inProgressCount, completeCount, onCountsChange]);

  useEffect(() => {
    if (!initial?.length) {
      void loadTasks();
    }
  }, [refreshKey]);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, description, status, due_date, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) setError(error.message);
    if (data) setTasks(data as Task[]);
  }

  async function setStatus(id: string, next: Task["status"]) {
    const prev = tasks.find((t) => t.id === id)?.status;
    if (!prev || prev === next) return;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: next } : t)));
    const promise: Promise<void> = (async () => {
        const { error } = await supabase
          .from("tasks")
          .update({ status: next })
          .eq("id", id);
        if (error) throw error;
      })();
      toast.promise(promise, {
        loading: "Updating status…",
        success: "Status updated",
        error: (e) => (e as any)?.message ?? "Failed to update status",
      });
    try {
      await promise;
    } catch (e: any) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: prev } : t)));
      setError(e?.message ?? "Failed to update status");
    }
  }

  return (
    <div className="space-y-4 w-full">
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {showTools && (
        <div className="sticky top-0 z-10 -mx-4 sm:mx-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border/50">
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{total}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <p className="text-sm text-muted-foreground">In progress</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{inProgressCount}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <p className="text-sm text-muted-foreground">Complete</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{completeCount}</p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <Input
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              placeholder="Search tasks by title or description…"
              className="h-10"
              aria-label="Search tasks"
            />
          </div>
        </div>
      )}

      {/* Table-like list */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className={`hidden sm:grid grid-cols-[1fr,160px,160px] items-center px-4 py-3 text-sm text-muted-foreground sticky ${showTools ? "top-20" : "top-0"} bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60`}>
          <span className="inline-flex items-center gap-2">Title</span>
          <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> Due</span>
          <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Status</span>
        </div>
        {loading && tasks.length === 0 && (
          <p className="px-4 py-8 text-base text-muted-foreground">Loading tasks…</p>
        )}
        {tasks.length === 0 && !loading ? (
          <p className="px-4 py-12 text-base text-muted-foreground text-center">No tasks yet — create your first task on the left.</p>
        ) : !visible.length && !loading ? (
          <p className="px-4 py-12 text-base text-muted-foreground text-center">No matching tasks for “{query}”.</p>
        ) : (
          <ul className="divide-y">
            {visible.map((task, idx) => {
              const isOverdue =
                !!task.due_date && task.status !== "complete" && new Date(task.due_date) < new Date(new Date().toDateString());
              return (
                <li
                  key={task.id}
                  className={`group grid grid-cols-1 sm:grid-cols-[1fr,160px,160px] items-start gap-4 px-4 py-4 transition-colors duration-200 ${
                    idx % 2 === 0 ? "bg-muted/20" : "bg-transparent"
                  } hover:bg-accent/30`}
                >
                  <div>
                    <div className="flex items-start gap-2">
                      {task.status === "complete" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                      ) : task.status === "in_progress" ? (
                        <Loader2 className="mt-0.5 h-5 w-5 text-blue-500" />
                      ) : (
                        <Clock className="mt-0.5 h-5 w-5 text-amber-500" />
                      )}
                      <div className="font-semibold leading-tight text-base sm:text-lg transition-transform duration-200 group-hover:translate-x-0.5">{task.title}</div>
                    </div>
                    {task.description && (
                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 ml-7 min-w-0 transition-colors">{task.description}</p>
                    )}
                  </div>

                  <div className={`text-sm sm:text-base ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                    {isOverdue && <span className="ml-2 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] text-red-600 dark:text-red-400">Overdue</span>}
                  </div>

                  <div className="min-w-0">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-accent active:scale-[0.98] ${
                            task.status === "complete"
                              ? "border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-300"
                              : task.status === "in_progress"
                              ? "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                              : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }`}
                          aria-label={`Change status (current: ${task.status})`}
                        >
                          {task.status === "complete" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Complete
                            </>
                          ) : task.status === "in_progress" ? (
                            <>
                              <Loader2 className="h-4 w-4" /> In progress
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4" /> Pending
                            </>
                          )}
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="z-50 min-w-[160px] overflow-hidden rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onSelect={() => setStatus(task.id, "pending")}
                        >
                          <Clock className="mr-2 h-4 w-4" /> Pending
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onSelect={() => setStatus(task.id, "in_progress")}
                        >
                          <Loader2 className="mr-2 h-4 w-4" /> In progress
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onSelect={() => setStatus(task.id, "complete")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
