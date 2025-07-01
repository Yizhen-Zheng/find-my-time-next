"use server";
import { createClient } from "@/utils/supabase/server";
import { Task, TaskFromSupabase } from "@/utils/types";
import {
  taskFromSupabaseToTask,
  taskToTaskFromSupabase,
} from "@/utils/convert-db-types";

export async function saveNewTasksToDb(
  newTasksFromAI: Omit<Task, "createdAt" | "taskId">[]
): Promise<{ tasks?: Task[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User must be logged in" };
  }
  const convertedTasks: TaskFromSupabase[] =
    taskToTaskFromSupabase(newTasksFromAI);
  const tasksConvertProperty: TaskFromSupabase[] = convertedTasks.map((t) => {
    const taskWithUserId: TaskFromSupabase = { ...t, user_id: user.id };
    const entries = Object.entries(taskWithUserId);
    const filteredEntires = entries.filter(
      ([key, value]) => value !== undefined
    );
    const cleanTask = Object.fromEntries(filteredEntires);
    return cleanTask;
  });

  const { data, error } = await supabase
    .from("task")
    .insert(tasksConvertProperty)
    .select();
  if (error) {
    console.error("Supabase error: ", error);
    return { error: "Failed to insert new tasks into DB" };
  }
  //   convert from snake case to camel case
  const tasks = taskFromSupabaseToTask(data);
  return { tasks };
}

// fetch all tasks of a user
export async function fetchAllTasksOfUser(): Promise<{
  tasks?: Task[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User must be logged in" };
  }
  const { data: allTasksOfUser, error: DBError } = await supabase
    .from("task")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (DBError) {
    console.error("Supabase error: ", DBError);
    return { error: "Failed to insert new tasks into DB" };
  }
  const tasks = taskFromSupabaseToTask(allTasksOfUser);
  return { tasks };
}

// given a date, fetch all tasks at the same date of the user
// currently just fetch all and filter in js
export async function fetchTasksOfUserByDate(dateIsoString: string): Promise<{
  tasks?: Task[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User must be logged in" };
  }
  const { data: allTasksOfUser, error: DBError } = await supabase
    .from("task")
    .select()
    .eq("user_id", user.id);
  if (DBError) {
    console.error("Supabase error: ", DBError);
    return { error: "Failed to insert new tasks into DB" };
  }
  //   convert from snake case to camel case
  const tasks = taskFromSupabaseToTask(allTasksOfUser);
  return { tasks };
}
