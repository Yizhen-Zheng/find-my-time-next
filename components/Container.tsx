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
import { Task, MatterContextType } from "@/utils/types";
/*
the page component
renderer goes here
*/
interface ContainerProps {
  tasks: Array<Task>;
}
const Container = ({ tasks }: ContainerProps) => {
  // -----------matters.js ref-----------
  const sceneRef = useRef<HTMLDivElement>(null);
  const engine = useRef(Engine.create());
  const render = useRef<Render>(null);
  const runner = useRef<Runner>(null);

  // -----------initialize the engine-----------
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

  return (
    <>
      <MatterContext.Provider
        value={
          {
            world: engine.current.world,
            scene: sceneRef.current,
          } as MatterContextType
        }
      >
        <div className="fixed w-full h-full  bg-transparent flex flex-col justify-center items-center">
          <div ref={sceneRef} className="w-full h-full">
            <CurrentTime />
            {tasks.map((title, idx) => (
              <TaskObject task={title} key={idx} />
            ))}
          </div>
        </div>
      </MatterContext.Provider>
    </>
  );
};

export default Container;
