import { Task, TaskOnDeleteContextType } from "@/utils/types";
import { useContext } from "react";
import { TaskOnDeleteContext } from "./context/TaskOnDeleteContext";
const DeleteConfirmCard = () => {
  const taskOnDeleteController = useContext(TaskOnDeleteContext);
  const onCancel = () => {};
  const onConfirm = () => {};

  if (!taskOnDeleteController || !taskOnDeleteController.taskOnDelete) {
    return null;
  }
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-slideIn">
        <div className="bg-white rounded-xl shadow-xl p-6 min-w-[280px] max-w-[90vw] mx-4">
          {/* Header */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Remove Task?
          </h3>

          {/* Body */}
          <p className="text-gray-600 mb-0">
            Are you sure you want to remove{" "}
            <span className="font-medium">
              "{taskOnDeleteController.taskOnDelete.title || "Untitled Task"}"
            </span>
            ?
          </p>
          <p className="text-gray-600 mb-6">
            Deleted tasks can find it in all tasks latter
          </p>
          {/* Task details preview (optional) */}
          {(taskOnDeleteController.taskOnDelete.duration ||
            taskOnDeleteController.taskOnDelete.dueDate) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
              {taskOnDeleteController.taskOnDelete.duration && (
                <p className="text-gray-600">
                  Duration:{" "}
                  <span className="font-medium">
                    {taskOnDeleteController.taskOnDelete.duration} minutes
                  </span>
                </p>
              )}
              {taskOnDeleteController.taskOnDelete.dueDate && (
                <p className="text-gray-600">
                  Due:{" "}
                  <span className="font-medium">
                    {new Date(
                      taskOnDeleteController.taskOnDelete.dueDate
                    ).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 
                       hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#f5685b] text-white rounded-lg 
                       = transition-colors duration-200 font-medium text-sm"
            >
              Remove Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default DeleteConfirmCard;
