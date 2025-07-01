import { Task } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { formatToYYMMDD } from "@/utils/helper";

const TaskCard = ({ taskProp }: { taskProp: Task }) => {
  const [task, setTask] = useState<Task>(taskProp);
  useEffect(() => {
    //
  }, [task]);
  return (
    <div
      key={task.taskId}
      className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"
    >
      <div
        className={`w-3 h-3 rounded-full ${
          task.importance === "High"
            ? "bg-red-500"
            : task.importance === "Medium"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      ></div>
      <div className="flex-grow">
        <p className="font-semibold text-slate-800">{task.title}</p>
        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
          <span>🗓️ {formatToYYMMDD(task.dueDate)}</span>
          <span>⏱️ {task.duration} min</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {task.taskType}
          </span>
        </div>
      </div>
    </div>
  );
};
export default TaskCard;
