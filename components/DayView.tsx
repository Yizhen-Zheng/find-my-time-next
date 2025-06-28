"use client";
import { useEffect, useState, useRef } from "react";
import Container from "./Container";
import SingleTaskCard from "./SingleTaskCard";
import { Task, SingleTaskCardActiveContextType } from "@/utils/types";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";
import { ActiveTaskContext } from "./context/ActiveTaskContext";

/*
the top-most parent component
*/
const DayView = () => {
  // hardcoded placeholder data
  const defaultValues: Array<Task> = [
    { title: "First task", taskId: 0 } as Task,
  ];
  const [tasks, setTasks] = useState<Array<Task>>(defaultValues);

  // popup window activity
  const [showSingleTaskCard, setShowSingleTaskCard] = useState<boolean>(true);
  // current active task(single one), will be shared through components like showing task information or deleting
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  //
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
      <SingleTaskCardActiveContext.Provider
        value={{
          showSingleTaskCard: showSingleTaskCard,
          setShowSingleTaskCard: setShowSingleTaskCard,
        }}
      >
        <ActiveTaskContext.Provider
          value={{ activeTask: activeTask, setActiveTask: setActiveTask }}
        >
          <div className="fixed w-full h-full  flex flex-col justify-center items-center bg-primary">
            {showSingleTaskCard && <SingleTaskCard />}
            <button
              onClick={addTask}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-300 to-cyan-300 hover:from-cyan-300 hover:to-violet-300 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out z-10 text-lg transform hover:scale-105 active:scale-95 "
            >
              Add New Task
            </button>
            <Container tasks={tasks} />
          </div>
        </ActiveTaskContext.Provider>
      </SingleTaskCardActiveContext.Provider>
    </>
  );
};
export default DayView;
