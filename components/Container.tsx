"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  Engine,
  Render,
  World,
  Bodies,
  Runner,
  Mouse,
  MouseConstraint,
} from "matter-js";
import { MatterContext } from "./context/MatterContext";

import TaskObject from "./TaskObject";
import CurrentTime from "./CurrentTime";
/*
the page component
renderer goes here
*/
interface ContainerProps {
  tasks: Array<string>;
}
const Container = ({ tasks }: ContainerProps) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engine = useRef(Engine.create());
  const render = useRef<Render>(null);
  const runner = useRef<Runner>(null);
  // long press
  const [longPressedTask, setLongPressedTask] = useState(null);
  // True when mouse is down on a body
  const isPressingRef = useRef(false);
  // Timestamp when mouse press started
  const pressStartTimeRef = useRef(0);
  const longPressTimeoutRef = useRef(null);
  const activeBodyRef = useRef(null);

  const longPressThreshold = 700; // Duration in milliseconds for a press to be considered "long"
  const moveThreshold = 5; // Maximum pixel movement allowed during a long press

  //   function to handle adding task
  //   TODO: handle tasks adding that only re-render that task, not all tasks(Gemini)
  //   const addTask = () => {
  //     if (sceneRef.current) {
  //       const newTaskBody = createNewBody(`New Task ${bodies.length + 1}`);
  //       World.add(engine.current.world, newTaskBody);
  //       setBodies((prev) => [...prev, newTaskBody]); // Add to React state
  //     }
  //   };
  //  initialize the engine
  useEffect(() => {
    if (!sceneRef.current) return;
    //  config gravity
    engine.current.gravity.y = 1.2; // Increased gravity for faster falling
    engine.current.gravity.x = 0;

    // Create renderer
    render.current = Render.create({
      element: sceneRef.current,
      engine: engine.current,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    const walls = [
      Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 50, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      }), // top
      Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight,
        window.innerWidth,
        50,
        // { isStatic: true }
        { isStatic: true, render: { fillStyle: "transparent" } }
      ), // bottom
      Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      }), // left
      Bodies.rectangle(
        window.innerWidth,
        window.innerHeight / 2,
        50,
        window.innerHeight,
        { isStatic: true, render: { fillStyle: "transparent" } }
      ), // right
    ];

    World.add(engine.current.world, walls);

    // Add mouse control for dragging
    const mouse = Mouse.create(render.current.canvas);
    const mouseConstraint = MouseConstraint.create(engine.current, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(engine.current.world, mouseConstraint);
    // Keep the mouse in sync with rendering
    render.current.mouse = mouse;

    // start the engine and renderer
    runner.current = Runner.create();
    Runner.run(runner.current, engine.current);
    Render.run(render.current);

    // clean up:
    return () => {
      if (render.current) {
        Render.stop(render.current);
        render.current.canvas.remove();
      }
      if (runner.current) {
        Runner.stop(runner.current);
      }
      World.clear(engine.current.world, false);
      Engine.clear(engine.current);
    };
  }, []);
  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  // TODO: long press handler(Gemini)
  useEffect(() => {
    // --- Mouse Down Handler ---
    // Get mouse position relative to the canvas
    // Query for Matter.js bodies at the mouse position
    // If a body is found, consider it for a long press
  }, []);
  return (
    <>
      <MatterContext value={engine.current.world}>
        <div className="fixed w-full h-full  bg-transparent flex flex-col justify-center items-center">
          <div ref={sceneRef} className="w-full h-full">
            <CurrentTime />
            {tasks.map((title, idx) => (
              <TaskObject taskTitle={title} key={idx} />
            ))}
          </div>
        </div>
      </MatterContext>
    </>
  );
};

export default Container;
