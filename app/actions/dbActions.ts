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
    const filteredEntires = entries.filter((item) => item[1] !== undefined);
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

// given a date, fetch all tasks that haven't due of the user
export async function fetchTasksOfUserByDate(
  overDue: boolean = false
): Promise<{
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
  const currentDateISO = new Date().toISOString();
  if (!overDue) {
    const { data: tasksOfUser, error: DBError } = await supabase
      .from("task")
      .select()
      .eq("user_id", user.id)
      .gte("due_date", currentDateISO);
    if (DBError) {
      console.error("Supabase error: ", DBError);
      return { error: "Failed to insert new tasks into DB" };
    }
    //   convert from snake case to camel case
    const tasks = taskFromSupabaseToTask(tasksOfUser);
    return { tasks };
  } else {
    const { data: tasksOfUser, error: DBError } = await supabase
      .from("task")
      .select()
      .eq("user_id", user.id)
      .lt("due_date", currentDateISO);
    if (DBError) {
      console.error("Supabase error: ", DBError);
      return { error: "Failed to insert new tasks into DB" };
    }
    //   convert from snake case to camel case
    const tasks = taskFromSupabaseToTask(tasksOfUser);
    return { tasks };
  }
}
// currently task by task id, used in taskObj
export async function fetchTasksById(taskId: number): Promise<{
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
    .eq("id", taskId);
  if (DBError) {
    console.error("Supabase error: ", DBError);
    return { error: "Failed to insert new tasks into DB" };
  }
  //   convert from snake case to camel case
  const tasks = taskFromSupabaseToTask(allTasksOfUser);
  return { tasks };
}

export async function deleteTaskById(taskId: number): Promise<{
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User must be logged in" };
  }
  const response = await supabase.from("task").delete().eq("id", taskId);
  if (response.error) {
    console.error("Supabase error: ", response);
    return { error: "Failed to delete tasks from DB" };
  }
  //   convert from snake case to camel case

  return {};
}
//updatedTask: an array of tasks to upsert.
export async function upsertTaskById(task: Task): Promise<{
  updatedTask?: Task[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User must be logged in" };
  }
  const { data: updatedTaskFromDb, error: DBError } = await supabase
    .from("task")
    .upsert(task)
    .select();
  if (DBError) {
    console.error("Supabase error: ", DBError);
    return { error: "Failed to delete tasks from DB" };
  }
  //   convert from snake case to camel case
  const updatedTask = taskFromSupabaseToTask(updatedTaskFromDb);
  return { updatedTask };
}
