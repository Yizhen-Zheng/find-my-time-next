import { Task, TaskFromSupabase } from "./types";
export const taskFromSupabaseToTask = (
  tasksFromSupabase: TaskFromSupabase[]
): Task[] => {
  const tasks: Task[] = tasksFromSupabase.map((taskFromSupabase) => {
    const task: Task = {
      taskId: taskFromSupabase.id,
      userId: taskFromSupabase.user_id,
      title: taskFromSupabase.title,
      importance: taskFromSupabase.importance,
      dueDate: taskFromSupabase.due_date,
      taskType: taskFromSupabase.task_type,
      createdAt: taskFromSupabase.created_at,
      duration: taskFromSupabase.duration,
    };
    return task;
  });
  return tasks;
};

export const taskToTaskFromSupabase = (tasks: Task[]): TaskFromSupabase[] => {
  const tasksFromSupabase: TaskFromSupabase[] = tasks.map((task) => {
    const taskFromSupabase: TaskFromSupabase = {
      id: task.taskId,
      user_id: task.userId,
      title: task.title,
      importance: task.importance,
      due_date: task.dueDate,
      task_type: task.taskType,
      created_at: task.createdAt,
      duration: task.duration,
    };
    return taskFromSupabase;
  });
  return tasksFromSupabase;
};
