"use client";

import React, { useEffect, useState, useContext } from "react";
import { ActiveTaskContext } from "./context/ActiveTaskContext";
import { X, Calendar, Clock, AlertCircle, Tag } from "lucide-react";
import {
  ActiveTaskContextType,
  SingleTaskCardActiveContextType,
} from "@/utils/types";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";
import { formatToYYMMDD } from "@/utils/helper";

const SingleTaskInfo = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  // close itself when click outside or cross
  const { showSingleTaskCard, setShowSingleTaskCard } = useContext(
    SingleTaskCardActiveContext
  ) as SingleTaskCardActiveContextType;

  // get current task to be shown
  const { activeTask, setActiveTask } = useContext(
    ActiveTaskContext
  ) as ActiveTaskContextType;

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowSingleTaskCard(false);
      setIsAnimating(false);
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Get importance color
  const getImportanceColor = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  useEffect(() => {
    console.log(activeTask);
  }, [showSingleTaskCard]);

  if (!showSingleTaskCard) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-50/10  z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Task Info Card */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#afc8fe] bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#afc8fe]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Task Details
                  </h2>
                  <p className="text-sm text-slate-600">
                    Complete task information
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close task details"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title Section */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {activeTask?.title || "Untitled Task"}
              </h3>
              {activeTask?.title && (
                <p className="text-slate-600 leading-relaxed">
                  {activeTask.title}
                </p>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#afc8fe] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#afc8fe]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Duration
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {activeTask?.duration || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#fef3c6] rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Due Date
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {activeTask?.dueDate
                        ? formatToYYMMDD(activeTask.dueDate)
                        : "No due date"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Importance & Type */}
            <div className="space-y-4">
              {/* Importance */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Importance
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getImportanceColor(
                    activeTask?.importance || "low"
                  )}`}
                >
                  {activeTask?.importance || "Low"}
                </span>
              </div>

              {/* Task Type */}
              {activeTask?.taskType && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Task Type
                    </span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#afc8fe] bg-opacity-20 text-[#424c61] border border-[#afc8fe] border-opacity-30">
                    {activeTask.taskType}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Information */}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 bg-[#afc8fe] hover:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors">
                Edit Task
              </button>
              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleTaskInfo;
