"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { Task } from "@/utils/types";
import {
  extractTasksFromText,
  extractTasksFromImage,
} from "@/app/actions/genaiActions";
import { saveNewTasksToDb } from "@/app/actions/dbActions";
import React from "react";
import Link from "next/link";
import TaskCard from "./TaskCard";
import { Image, Upload } from "lucide-react";
interface AddTasksFromTextProps {
  initialTasks: Task[];
  fetchInitialTasksError?: string;
}
const AddTasksFromText = ({
  initialTasks,
  fetchInitialTasksError,
}: AddTasksFromTextProps) => {
  // State for the list of tasks
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // State for the text input
  // TODO: only show first 3 newest added tasks(sort by createdAt), add button 'view all taks' at bottom of window
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State for handling errors from the server action
  const [error, setError] = useState<boolean>(
    fetchInitialTasksError !== undefined
  );

  // useTransition hook to manage loading states without blocking the UI
  const [isPending, startTransition] = useTransition();
  const [isImagePending, startImageTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    // startTransition wraps the server action call
    startTransition(async () => {
      const { tasks: newTasks, error: AIError } = await extractTasksFromText(
        tasks,
        text
      );
      if (newTasks && newTasks.length > 0) {
        const { tasks: savedTasks, error: dbError } = await saveNewTasksToDb(
          newTasks
        );
        if (savedTasks && savedTasks.length > 0) {
          setTasks((prevTasks) => [...prevTasks, ...savedTasks]);
          setText(""); // Clear input on success
        } else if (dbError) {
          // catch db err
          console.error("DB error: ", dbError);
          setError(true);
        }
      } else if (AIError) {
        //catch ai err
        console.error("AI error: ", AIError);
        setError(true);
      }
    });
  };
  const handleImageSubmit = () => {
    if (!selectedImage) return;

    setError(false);
    startImageTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const { tasks: newTasks, error: AIError } = await extractTasksFromImage(
          tasks,
          selectedImage
        );

        if (newTasks && newTasks.length > 0) {
          const { tasks: savedTasks, error: dbError } = await saveNewTasksToDb(
            newTasks
          );
          if (savedTasks && savedTasks.length > 0) {
            setTasks((prevTasks) => [...prevTasks, ...savedTasks]);
            // Clear image selection on success
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else if (dbError) {
            console.error("DB error: ", dbError);
            setError(true);
          }
        } else if (AIError) {
          console.error("AI error: ", AIError);
          setError(true);
        }
      } catch (error) {
        console.error("Image processing error: ", error);
        setError(true);
      }
    });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.error("Please select a valid image file");
        setError(true);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error("Image file size must be less than 10MB");
        setError(true);
        return;
      }

      setSelectedImage(file);
      setError(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-600 mb-2 pl-16">
            New Task
          </h1>
          <p className="text-slate-500">What you need to do today?</p>
        </header>

        {/* Task Input Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="task-input"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              New Task(s)
            </label>
            <textarea
              id="task-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 'Draft the quarterly report by Friday, and schedule a 30 minute review meeting for it tomorrow.'"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
              rows={3}
            />
            <div className="mt-4 flex items-center justify-end">
              {error && <p className="text-sm text-red-600 mr-4">{error}</p>}
              <button
                type="submit"
                disabled={isPending || !text}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isPending ? "Analyzing..." : "Add Tasks"}
              </button>
            </div>
          </form>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Or upload an image with tasks
          </h3>

          {/* Image Upload Input */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <Image className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  Click to select an image
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PNG, JPG, JPEG up to 10MB
                </span>
              </div>
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={clearImageSelection}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Image Submit Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleImageSubmit}
              disabled={isImagePending || !selectedImage}
              className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isImagePending ? "Processing..." : "Extract Tasks from Image"}
            </button>
          </div>
        </div>

        {/* View All Tasks Button */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/task/all-task"
            className="px-6 py-2.5 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
          >
            View All Tasks
          </Link>
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Tasks</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(isPending || isImagePending) && (
              <div className="opacity-50 text-center p-4">
                Adding new tasks...
              </div>
            )}
            {tasks.length === 0 && !isPending && !isImagePending && (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                <p className="text-slate-500">No tasks yet. Add one above!</p>
              </div>
            )}
            {tasks
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  );
                } else {
                  return -1;
                }
              })
              .slice(0, 3)
              .map((task) => (
                <TaskCard taskProp={task} key={task.taskId} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTasksFromText;
