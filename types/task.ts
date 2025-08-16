export type TaskStatus = "pending" | "in_progress" | "complete";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null; // ISO date string
  created_at: string;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus; // default to "pending"
  due_date?: string | null; // ISO date string
}
