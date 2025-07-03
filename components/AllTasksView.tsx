"use client";
import { useState, useMemo } from "react";
import { Task } from "@/utils/types";
import TaskCard from "./TaskCard";
import { deleteTaskById, upsertTaskById } from "@/app/actions/dbActions";

interface AllTasksViewProps {
  initialFetchedTasks?: Task[];
  initialFetchError?: string;
}

type TaskViewTab = "available" | "overdue";

const AllTasksView = ({
  initialFetchedTasks,
  initialFetchError,
}: AllTasksViewProps) => {
  const [allTasks, setAllTasks] = useState<Task[]>(initialFetchedTasks || []);
  const [activeTab, setActiveTab] = useState<TaskViewTab>("available");
  const [error, setError] = useState<boolean>(initialFetchError ? true : false);

  // --- Handlers remain the same as before, they operate on `allTasks` ---
  const handleDeleteTask = async (taskId: number) => {
    setAllTasks((currentTasks) =>
      currentTasks.filter((task) => task.taskId !== taskId)
    );
    const deleteError = await deleteTaskById(taskId);
    if (deleteError) {
      setError(true);
    }
  };
  // currently not used because the task card don't have such feature yet
  const handleUpdateTask = async (updatedTask: Task) => {
    setAllTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task
      )
    );
    const { updatedTask: updatedTaskFromDb, error: upsertError } =
      await upsertTaskById(updatedTask);
    if (upsertError) {
      setError(true);
    }
    console.log(updatedTaskFromDb);
  };

  // Filter tasks based on due date
  const overdueTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.dueDate) {
        return new Date(task.dueDate) < new Date();
      } else {
        return false;
      }
    });
  }, [allTasks]);

  const availableTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.dueDate) {
        return new Date(task.dueDate) >= new Date();
      } else {
        return false;
      }
    });
  }, [allTasks]);

  // Get the tasks to display based on active tab
  const tasksToDisplay = useMemo(() => {
    return activeTab === "available" ? availableTasks : overdueTasks;
  }, [activeTab, availableTasks, overdueTasks]);

  return (
    <div className="items-center justify-center w-full">
      {/* 1. The Toggle UI */}
      <div className="flex  border-b mb-4 w-full items-center m-auto  ">
        <button
          onClick={() => setActiveTab("available")}
          className={`w-full h-10 font-semibold ${
            activeTab === "available"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-slate-500"
          }`}
        >
          Ongoing ({availableTasks.length})
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`w-full h-10 font-semibold ${
            activeTab === "overdue"
              ? "border-b-2 border-red-500 text-red-600"
              : "text-slate-500"
          }`}
        >
          Overdue ({overdueTasks.length})
        </button>
      </div>

      {/* 2. The Mapped List - Now shows filtered tasks based on active tab */}
      <div className="space-y-4">
        {tasksToDisplay.length > 0 ? (
          tasksToDisplay.map((task) => (
            <TaskCard
              key={task.taskId}
              taskProp={task}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))
        ) : (
          <p className="text-center text-slate-500 py-8">
            {activeTab === "available"
              ? "No available tasks."
              : "No overdue tasks. Great job!"}
          </p>
        )}
      </div>
      {error && <div>An error occurred</div>}
    </div>
  );
};

export default AllTasksView;
