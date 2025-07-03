import { Task } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { formatToYYMMDD } from "@/utils/helper";
import { Trash2, Undo2 } from "lucide-react";
interface TaskCardProps {
  taskProp: Task;
  onDelete?: (taskId: number) => void;
  onUpdate?: (task: Task) => void;
}
const TaskCard = ({ taskProp, onDelete, onUpdate }: TaskCardProps) => {
  //   const [task, setTask] = useState<Task>(taskProp);
  const task: Task = taskProp;
  const overDue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  //   useEffect(() => {
  //     console.log();
  //   }, [task]);

  const handleDeleteClick = () => {
    // --- 2. Call the function from props, passing the required data up ---
    if (
      window.confirm(`Are you sure you want to delete "${task.title}"?`) &&
      onDelete &&
      task.taskId
    ) {
      onDelete(task.taskId);
    }
  };
  const handleRecoverClick = () => {
    // --- 2. Call the function from props, passing the required data up ---
    if (
      window.confirm(`Are you sure you want to delete "${task.title}"?`) &&
      onUpdate &&
      task
    ) {
      onUpdate(task);
    }
  };
  return (
    <div
      key={task.taskId}
      className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"
    >
      <div
        className={`w-3 h-3 rounded-full ${
          task.importance === "High"
            ? "bg-[#ff6f48f6]"
            : task.importance === "Medium"
            ? "bg-[#ffd471]"
            : "bg-[#7cdfb4]"
        }`}
      ></div>
      <div className="flex-grow  ">
        <p className="font-semibold text-slate-800">{task.title}</p>
        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
          <span>🗓️ {formatToYYMMDD(task.dueDate)}</span>
          <span>⏱️ {task.duration} min</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {task.taskType}
          </span>
        </div>
      </div>

      {overDue ? (
        <button className="" onClick={handleRecoverClick}>
          <Undo2 className="text-[#7bd17b]" />
        </button>
      ) : (
        <button className="" onClick={handleDeleteClick}>
          <Trash2 className="text-[#e6937a]" />
        </button>
      )}
    </div>
  );
};
export default TaskCard;
