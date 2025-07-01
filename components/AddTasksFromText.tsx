"use client";

import { useEffect, useState, useTransition } from "react";
import { Task } from "@/utils/types";
import { extractTasksFromText } from "@/app/actions/genaiActions";
import { saveNewTasksToDb } from "@/app/actions/dbActions";
import React from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import TaskCard from "./TaskCard";

const AddTasksFromText = () => {
  // State for the list of tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      taskId: 1,
      title: "Follow up with the design team",
      taskType: "Work",
      duration: 15,
      importance: "Medium",
      dueDate: "2025-07-01",
    },
  ]);
  // State for the text input
  const [text, setText] = useState("");
  // State for handling errors from the server action
  const [error, setError] = useState<boolean>(false);

  // useTransition hook to manage loading states without blocking the UI
  const [isPending, startTransition] = useTransition();

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
  useEffect(() => {
    console.log("test");
  }, [tasks]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            AI Task Manager
          </h1>
          <p className="text-slate-500">
            Describe what you need to do in plain English. Our AI will schedule
            it for you.
          </p>
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

        {/* Task List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Tasks</h2>
          <div className="space-y-4">
            {isPending && (
              <div className="opacity-50 text-center p-4">
                Adding new tasks...
              </div>
            )}
            {tasks.length === 0 && !isPending && (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                <p className="text-slate-500">No tasks yet. Add one above!</p>
              </div>
            )}
            {tasks.map((task) => (
              <TaskCard taskProp={task} />
            ))}
          </div>
        </div>
        <div className="items-center justify-center flex flex-col">
          <button className=" border border-blue-400 rounded-lg bg-blue-200">
            <Link href={"/"}>View All Tasks</Link>
          </button>
          which haven't been implemented yet. click above will send you to home
          page
        </div>
      </div>
    </div>
  );
};

export default AddTasksFromText;
