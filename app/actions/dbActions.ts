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
  console.log(data);
  //   convert from snake case to camel case
  const tasks = taskFromSupabaseToTask(data);
  return { tasks };
}

// export async function fetchTaskByUser(): Promise<{
//   tasks?: Task[];
//   error?: string;
// }> {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     return { error: "User must be logged in" };
//   }
// }
