"use client";
import { useEffect, useState } from "react";
import Container from "./Container";
import SingleTaskInfo from "./SingleTaskInfo";
import { Task } from "@/utils/types";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";
import { ActiveTaskContext } from "./context/ActiveTaskContext";
import { fetchTasksOfUserByDate } from "@/app/actions/dbActions";
import { sortTasks } from "@/utils/helper";
import DeleteConfirmCard from "./DeleteConfirmCard";
import { TaskOnDeleteContext } from "./context/TaskOnDeleteContext";
// import { ToastContainer, toast } from "react-toastify";
/*
the top-most parent component, controls UI 
*/
const DayView = () => {
  const [popedTasks, setPopedTasks] = useState<Task[]>([]);
  const [taskStack, setTaskStack] = useState<Task[]>([]);

  // popup window activity
  const [taskOnDelete, setTaskOnDelete] = useState<Task | null>(null);
  const [showSingleTaskCard, setShowSingleTaskCard] = useState<boolean>(false);
  // current active task(single one), will be shared through components like showing task information or deleting
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  //error display
  const [error, setError] = useState<boolean>(false);

  const addTask = () => {
    // handle adding tasks, fetch logic
    if (taskStack.length === 0) {
      console.log("no more tasks! you are almost done"); //TODO: toastify this notice
      return;
    }
    const nextTask: Task = taskStack[taskStack.length - 1];

    //remove task from stack
    setTaskStack((prev) => prev.slice(0, -1));
    // Add the new task to the visible list
    setPopedTasks((prev) => [...prev, nextTask]);
  };

  useEffect(() => {
    //fetch from db
    const fetchAvailableTasks = async () => {
      //only fetch those before due
      const { tasks: allAvailableTasks, error: dbError } =
        await fetchTasksOfUserByDate(false);
      if (dbError) {
        setError(true);
      } else if (allAvailableTasks && allAvailableTasks.length) {
        const sortedTasks = sortTasks(allAvailableTasks);
        setTaskStack(sortedTasks);
      }
    };
    fetchAvailableTasks();
  }, []);
  useEffect(() => {
    console.log("poped:", popedTasks);
    console.log("stack:", taskStack);
  }, [popedTasks, taskStack]);
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
          <TaskOnDeleteContext.Provider
            value={{ taskOnDelete, setTaskOnDelete }}
          >
            <div className="fixed w-full h-full  flex flex-col justify-center items-center bg-[#afc8fe]">
              {taskOnDelete && <DeleteConfirmCard />}
              <SingleTaskInfo />
              <button
                onClick={addTask}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-300 to-cyan-300 hover:from-cyan-300 hover:to-violet-300 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out z-10 text-lg transform hover:scale-105 active:scale-95 "
              >
                Add New Task
              </button>
              <Container tasks={popedTasks} />
            </div>
            {error && <div>an error occured</div>}
          </TaskOnDeleteContext.Provider>
        </ActiveTaskContext.Provider>
      </SingleTaskCardActiveContext.Provider>
    </>
  );
};
export default DayView;
