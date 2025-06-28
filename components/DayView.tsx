"use client";
import { useEffect, useState, useRef } from "react";
import Container from "./Container";
import SingleTaskCard from "./SingleTaskCard";
import { Task } from "@/utils/types";
/*
the top-most page component
*/
const DayView = () => {
  // hardcoded placeholder data

  const defaultValues: Array<Task> = [
    { title: "First task", taskId: 0 } as Task,
  ];
  const [tasks, setTasks] = useState<Array<Task>>(defaultValues);
  const [showSingleTaskCard, setShowSingleTaskCard] = useState<boolean>(true);
  // Stores taskTitle of the long-pressed body

  const addTask = () => {
    // handle adding new tasks
    // create placeholder value
    const defaultNewTask: Task = {
      title: "TaskTitle",
      taskId: defaultValues.length,
    };
    setTasks((prev) => [...prev, defaultNewTask]);
  };

  useEffect(() => {
    // handle mouse events
  }, []);
  return (
    <>
      <div className="fixed w-full h-full  flex flex-col justify-center items-center bg-primary">
        {showSingleTaskCard && (
          <SingleTaskCard setShowSingleTaskCard={setShowSingleTaskCard} />
        )}
        <button
          onClick={addTask}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-300 to-cyan-300 hover:from-cyan-300 hover:to-violet-300 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out z-10 text-lg transform hover:scale-105 active:scale-95 "
        >
          Add New Task
        </button>
        <Container tasks={tasks} />
      </div>
    </>
  );
};
export default DayView;
