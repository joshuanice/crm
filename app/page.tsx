"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState({ total: 0, pending: 0, in_progress: 0, complete: 0 });
  const [addOpen, setAddOpen] = useState(false);

  function handleCreated(_: Task) {
    setRefreshKey((k) => k + 1);
    setAddOpen(false);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-background">
      {/* Subtle spotlight gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero + Theme toggle */}
        <section className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="bg-gradient-to-r from-primary via-indigo-500 to-foreground bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
              Customer Tasks Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Create, organize, and complete tasks with a clean, modern UI.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end items-center gap-2">
            <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
              <Dialog.Trigger asChild>
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
                />
                <Dialog.Content
                  className="fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/50 bg-background p-0 shadow-2xl focus:outline-none
                  transition-all duration-200 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100"
                >
                  <div className="border-b border-border/50 px-5 py-4">
                    <Dialog.Title className="text-lg font-semibold">Add New Task</Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">Quickly add a task with title, due date, status and details.</Dialog.Description>
                  </div>
                  <div className="p-6 sm:p-7">
                    <TaskForm onCreated={handleCreated} />
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </section>

        {/* Totals + Search above the overview */}
        <section className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{counts.total}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{counts.pending}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg">
              <p className="text-sm text-muted-foreground">In progress</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{counts.in_progress}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg">
              <p className="text-sm text-muted-foreground">Complete</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{counts.complete}</p>
            </div>
          </div>
          <div className="mt-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks by title or description…"
              className="h-10"
              aria-label="Search tasks"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <Card className="lg:col-span-12 xl:col-span-12 rounded-2xl border border-border/50 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-2xl">
              <CardTitle className="text-xl">Tasks Overview</CardTitle>
              <p className="text-sm text-muted-foreground">View all tasks, mark complete, and keep momentum.</p>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-auto">
              <TaskList refreshKey={refreshKey} query={query} showTools={false} onCountsChange={setCounts} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
