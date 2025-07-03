"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { Query, World, Bodies, Body } from "matter-js";
import { MatterContext } from "./context/MatterContext";
import { ActiveTaskContext } from "./context/ActiveTaskContext";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";
import { TaskOnDeleteContext } from "./context/TaskOnDeleteContext";
import { Task, MatterContextType } from "@/utils/types";
import { getTaskObjectOptions } from "@/utils/helper";
/*
the task object(polygons)
*/
interface TaskObjectProps {
  task: Task;
}
const TaskObject = ({ task }: TaskObjectProps) => {
  // engine.world and the canvas div for manipulating body
  const { world, scene } = useContext(MatterContext) as MatterContextType;
  // current active(selected) task and setter. can set current task as active if long pressed
  const activeTaskController = useContext(ActiveTaskContext);
  const showSingleTaskCardController = useContext(SingleTaskCardActiveContext);

  // body / task info:
  // hold the created body in canvas
  const bodyRef = useRef<Body | null>(null);
  // const [position, setPosition] = useState({ x: 0, y: 0 });
  // const [angle, setAngle] = useState(0);

  // -----------long press-----------
  // Long press detection refs
  // store setTimeOut for latter clear
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const pressStartTimeRef = useRef(0);
  const LONG_PRESS_DURATION = 800; // 800ms for long press

  // boundary detection
  const isOutOfBoundsRef = useRef<boolean>(false);
  const taskOnDeleteController = useContext(TaskOnDeleteContext);
  const positionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -----------manipulate popup window-----------

  useEffect(() => {
    if (!world) return;
    // ender related values (style, position...)
    const rect = scene.getBoundingClientRect();
    const screenWidth = rect.width || window.innerWidth;
    const screenHeight = rect.height || window.innerHeight;
    const taskOptions = getTaskObjectOptions(task, screenWidth, screenHeight);
    const startX = Math.random() * Math.max(window.innerWidth - 200, 0) + 50;
    const startY = Math.random() * Math.max(window.innerHeight - 200, 0) + 50;

    // Create body based on shape type
    let body: Body;
    const matterOptions = {
      restitution: taskOptions.restitution,
      friction: taskOptions.friction,
      frictionAir: taskOptions.frictionAir,
      density: taskOptions.density,
      render: taskOptions.render,
      label: `${task?.taskId ?? Math.floor(Math.random() * 10000)}`,
    };
    switch (taskOptions.shapeType) {
      case "Ball":
        body = Bodies.circle(
          startX,
          startY,
          taskOptions.size.radius || 30,
          matterOptions
        );
        break;
      case "Triangle":
        body = Bodies.polygon(
          startX,
          startY,
          3,
          taskOptions.size.radius || 30,
          matterOptions
        );
        break;
      case "Rectangle":
        body = Bodies.rectangle(
          startX,
          startY,
          taskOptions.size.width || 60,
          taskOptions.size.height || 60,
          matterOptions
        );
        break;
      case "Pentagon":
        body = Bodies.polygon(
          startX,
          startY,
          5,
          taskOptions.size.radius || 30,
          matterOptions
        );
        break;
      default:
        body = Bodies.circle(startX, startY, 30, matterOptions);
    }
    // apply initial force(random)
    const horizontalForce = (Math.random() - 0.5) * 0.03;
    const verticalForce = Math.random() * 0.01;
    Body.applyForce(body, body.position, {
      x: horizontalForce,
      y: verticalForce,
    });

    //add created body to world after creating body
    bodyRef.current = body;
    World.add(world, body);

    // Position monitoring for boundary detection
    const checkBoundary = () => {
      if (!bodyRef.current || !scene) return;

      const body = bodyRef.current;
      const rect = scene.getBoundingClientRect();
      const { x, y } = body.position;

      // Check if body is out of bounds with some margin
      const margin = 50; // Allow some margin before considering it out of bounds
      const isOutOfBounds =
        x < -margin ||
        x > rect.width + margin ||
        y < -margin ||
        y > rect.height + margin;

      if (isOutOfBounds && !isOutOfBoundsRef.current) {
        // Just went out of bounds
        isOutOfBoundsRef.current = true;
        taskOnDeleteController?.setTaskOnDelete(task);

        // Optional: Apply some visual feedback
        if (body.render) {
          body.render.opacity = 0.5;
        }
      } else if (!isOutOfBounds && isOutOfBoundsRef.current) {
        // Came back in bounds
        isOutOfBoundsRef.current = false;
        taskOnDeleteController?.setTaskOnDelete(null);

        // Restore opacity
        if (body.render) {
          body.render.opacity = 1;
        }
      }
    };
    // Start position monitoring
    positionCheckIntervalRef.current = setInterval(checkBoundary, 100);

    // Update position and angle based on physics
    const updatePosition = () => {
      return;
    };
    const interval = setInterval(updatePosition, 160); // ~60fps

    return () => {
      clearInterval(interval);
      if (positionCheckIntervalRef.current) {
        clearInterval(positionCheckIntervalRef.current);
      }
      if (bodyRef.current && world) {
        World.remove(world, bodyRef.current);
      }
    };
    // by removing world from deps, preventing re-rendering bodies every time adding new body to world,
  }, []);

  useEffect(() => {
    if (!bodyRef.current) return;
    const body = bodyRef.current;
    // ------------define long touch / press handlers------------
    if (!scene) return;
    // Mouse/Touch event handlers
    const handleStart = (clientX: number, clientY: number) => {
      const rect = scene.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      // Check if this body is under the cursor
      const bodiesUnderPoint = Query.point([body], { x, y });
      if (bodiesUnderPoint.length > 0 && bodiesUnderPoint.includes(body)) {
        isPressedRef.current = true;
        pressStartTimeRef.current = Date.now();
        // start long press timer:
        longPressTimerRef.current = setTimeout(() => {
          if (isPressedRef.current) {
            activeTaskController?.setActiveTask(task);
            showSingleTaskCardController?.setShowSingleTaskCard(true);

            console.log(
              `long press detected on:${body.label}\nx position:${body.position.x}\ny position:${body.position.y}`
            );
          }
        }, LONG_PRESS_DURATION);
      }
    };
    const handleEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isPressedRef.current) {
        const pressDuration = Date.now() - pressStartTimeRef.current;
        // maybe show popup after ending long press

        console.log(`press ended after ${pressDuration}ms on ${task.taskId}`);
      }
      isPressedRef.current = false;
    };

    // seems this can detect if task is on 'deleting zone' or safe zone
    const handleMove = (clientX: number, clientY: number) => {
      // when long press plus move:
      if (isPressedRef.current) {
        const rect = scene.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Check if we're still over the same body
        const bodiesUnderPoint = Query.point([body], { x, y });

        if (!bodiesUnderPoint.includes(body)) {
          // Mouse/finger moved away from the body, cancel long press
          handleEnd();
        }
      }
    };
    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    // Touch events
    // Note sure if need to prevent default
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    // Add event listeners.
    // each body added to scene will add such a set of eventlisteners to scene
    // cus we're using closure to contain each one's bodyRef and so on infos
    scene.addEventListener("mousedown", handleMouseDown);
    scene.addEventListener("mouseup", handleMouseUp);
    scene.addEventListener("mousemove", handleMouseMove);
    scene.addEventListener("mouseleave", handleEnd); // Cancel on mouse leave

    scene.addEventListener("touchstart", handleTouchStart, { passive: false });
    scene.addEventListener("touchend", handleTouchEnd, { passive: false });
    scene.addEventListener("touchmove", handleTouchMove, { passive: false });
  }, []);

  return <></>;
};

export default TaskObject;
// TODO: replace this with getting current time line position, then only add to spces below the current time line
// will be good for later delete handler to function properly
