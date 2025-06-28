"use client";

import React, { useEffect, useState, useContext } from "react";
import { ActiveTaskContext } from "./context/ActiveTaskContext";
import {
  Task,
  ActiveTaskContextType,
  SingleTaskCardActiveContextType,
} from "@/utils/types";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";

const SingleTaskCard = () => {
  // close itself when click outside or cross
  const { showSingleTaskCard, setShowSingleTaskCard } = useContext(
    SingleTaskCardActiveContext
  ) as SingleTaskCardActiveContextType;

  // get current task to be shown
  const { activeTask, setActiveTask } = useContext(
    ActiveTaskContext
  ) as ActiveTaskContextType;
  // detailed information about task
  const [taskTitle, setTaskTitle] = useState<string>("default task title");
  const [duration, setDuration] = useState<number>(45); //duration in minuts(e.g.: 45, 90,...)

  useEffect(() => {}, [taskTitle]);

  /*
  TODO: 
    animation for ease-in, ease-out in css
    text layout
  */
  return (
    <>
      <div className="bg-amber-100 rounded-2xl w-full h-3/5 absolute z-1 bottom-[-10px]">
        <div className=" relative w-full flex flex-row-reverse">
          <button
            className="relative items-center"
            onClick={() => setShowSingleTaskCard(false)}
          >
            X
          </button>
        </div>
        <div>
          <ul>
            <li className="flex flex-row ">
              <p className="text-amber-950">Title: </p>
              <p className="text-amber-950 ">{taskTitle}</p>
            </li>
            <li className="flex flex-row">
              <p className="text-amber-950">Task Duration: </p>
              <p className="text-amber-950">{duration}</p>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
export default SingleTaskCard;
