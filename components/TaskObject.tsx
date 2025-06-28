"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { Query, World, Bodies, Body } from "matter-js";
import { MatterContext } from "./context/MatterContext";
import { ActiveTaskContext } from "./context/ActiveTaskContext";
import { SingleTaskCardActiveContext } from "./context/SingleTaskCardActiveContext";
import {
  Task,
  MatterContextType,
  SingleTaskCardActiveContextType,
  ActiveTaskContextType,
} from "@/utils/types";
import { getShapeColor } from "@/utils/helper";
/*
the task object(polygon)
*/
interface TaskObjectProps {
  task: Task;
}
const TaskObject = ({ task }: TaskObjectProps) => {
  // engine.world and the canvas div for manipulating body
  const { world, scene } = useContext(MatterContext) as MatterContextType;
  // current active(selected) task and setter. can set current task as active if long pressed
  const { activeTask, setActiveTask } = useContext(
    ActiveTaskContext
  ) as ActiveTaskContextType;
  const { showSingleTaskCard, setShowSingleTaskCard } = useContext(
    SingleTaskCardActiveContext
  ) as SingleTaskCardActiveContextType;

  // body / task info:
  // hold the created body in canvas
  const bodyRef = useRef<Body | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  // choose shape(temp)
  const shapes = ["Ball", "Pentagon", "Rectangle", "Triangle"];
  const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

  // -----------long press-----------
  // Long press detection refs
  // store setTimeOut for latter clear
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const pressStartTimeRef = useRef(0);
  const LONG_PRESS_DURATION = 800; // 800ms for long press

  // -----------manipulate popup window-----------

  useEffect(() => {
    if (!world) return;
    // TODO: replace this with getting current time line position, then only add to spces below the current time line
    // will be good for later delete handler to function properly
    const startX = Math.random() * (window.innerWidth - 200) + 100;
    const startY = Math.random() * 200 + 100;

    // Create body based on shape type
    let body: Body;
    const options = {
      restitution: 0.6,
      friction: 0.3,
      frictionAir: 0.01,
      density: 0.8 + Math.random() * 0.4,
      render: {
        fillStyle: getShapeColor(shapeType),
        strokeStyle: "#000",
        lineWidth: 1,
      },
      // simulate the taskId from DB
      // fetch detailed task info with this id, either from radis or dp api
      label: `${task.taskId ?? Math.floor(Math.random() * 10000)}`,
    };
    switch (shapeType) {
      case "Ball":
        const radius = 15 + Math.random() * 75; // Variable size
        body = Bodies.circle(startX, startY, radius, options);
        break;
      case "Triangle":
        const width = 30 + Math.random() * 75;
        const height = 30 + Math.random() * 75;
        body = Bodies.polygon(startX, startY, width, height, options);
        break;
      case "Rectangle":
        const widthI = 30 + Math.random() * 75;
        const heightI = 30 + Math.random() * 75;
        body = Bodies.rectangle(startX, startY, widthI, heightI, options);
        break;
      case "Pentagon":
        const size = 25 + Math.random() * 75;
        body = Bodies.polygon(startX, startY, 5, size, options);
        break;
      default:
        body = Bodies.circle(startX, startY, 30, options);
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

    // Update position and angle based on physics
    const updatePosition = () => {
      return;
    };
    const interval = setInterval(updatePosition, 160); // ~60fps

    return () => {
      clearInterval(interval);
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
            // FIXME: the first added(default task) don't have these properties
            setActiveTask(task);
            setShowSingleTaskCard(true);
            // replace the console log with handlePopupInfoWindow
            // pass a setter from Dayview(or use another context called popup window context)
            // set condition to true to show that window
            // also need to set 'currentSelectedTask', so we'll know:
            //  which task should be shown or modified(excluded from MVP)
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
