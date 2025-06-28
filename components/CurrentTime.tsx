"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { Engine, Render, World, Bodies, Body } from "matter-js";
import { MatterContext } from "./context/MatterContext";
import { calculateCurrentTimeYPosition } from "../utils/helper";
import { Task, MatterContextType } from "@/utils/types";
/*
the task object(polygon)
a rigid line, slides fown from top of screen to down. 
will squeeze the bojects. 
the objects will 'boom' when over squeezed 
*/
interface CurrentTimeProps {
  upperBoundTime?: string; // Format: "HH:MM" (default "08:00")
  lowerBoundTime?: string; // Format: "HH:MM" (default "20:00")
  topBound?: number;
  bottomBound?: number;
}
const CurrentTime = ({
  upperBoundTime = "08:00",
  lowerBoundTime = "20:00",
  topBound = 10,
  bottomBound = 10,
}: CurrentTimeProps) => {
  const { world, scene } = useContext(MatterContext) as MatterContextType;
  const bodyRef = useRef<Body | null>(null);
  const animationRef = useRef<number>(0);
  const [currentTimeReadable, setCurrentTimeReadable] = useState<string>();
  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  // Get current time in minutes since midnight
  const getCurrentTimeMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // handle update position
  const updatePosition = () => {
    if (bodyRef.current) {
      let start = timeToMinutes(upperBoundTime);
      let end = timeToMinutes(lowerBoundTime);
      let current = getCurrentTimeMinutes();
      const newY = calculateCurrentTimeYPosition(start, end, current);
      Body.setPosition(bodyRef.current, {
        x: bodyRef.current.position.x,
        y: newY,
      });
    }
    animationRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    if (!world) return;
    // Create the timeline body - a thin horizontal rectangle
    const screenWidth = window.innerWidth;
    const bodyWidth = screenWidth - 10; // Leave some margin
    const bodyHeight = 4; // Thin line
    //
    let start = timeToMinutes(upperBoundTime);
    let end = timeToMinutes(lowerBoundTime);
    let current = getCurrentTimeMinutes();
    const initialY = calculateCurrentTimeYPosition(start, end, current);

    const currentTimeBody = Bodies.rectangle(
      screenWidth / 2, // Center horizontally
      initialY,
      bodyWidth,
      bodyHeight,
      {
        isStatic: true, // Static so it doesn't fall due to gravity
        render: {
          fillStyle: "#fdf7c3", //FDF7C3
          // fillStyle: "#fef3c6", //FDF7C3
          strokeStyle: "#fef3c6",
          lineWidth: 1,
        },
        label: "currentTime",
      }
    );

    bodyRef.current = currentTimeBody;
    World.add(world, currentTimeBody);
    updatePosition();

    console.log(currentTimeBody);
    // clean up:
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (bodyRef.current && world) {
        World.remove(world, bodyRef.current);
      }
    };
  }, [world, upperBoundTime, lowerBoundTime]);

  useEffect(() => {
    // re-render current time
    // Set up an interval to update the time every second.
    const intervalId = setInterval(() => {
      const now = new Date();
      // Format the time to a readable HH:MM:SS format.`
      // You can customize the options as needed.
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentTimeReadable(timeString);
    }, 1000); // Update every second
    // a cleanup function that React will run when the component unmounts. clear the interval to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className=" flex flex-col justify-center items-center">
        <span className="text-amber-950">{currentTimeReadable}</span>
      </div>
    </>
  );
};

export default CurrentTime;
