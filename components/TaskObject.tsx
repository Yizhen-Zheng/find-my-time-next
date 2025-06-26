"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { Render, World, Bodies, Body } from "matter-js";
import { MatterContext } from "./context/MatterContext";
/*
the task object(polygon)
*/
interface TaskObjectProps {
  taskTitle: string;
  // shape: string(maybe)
}
const TaskObject = ({ taskTitle }: TaskObjectProps) => {
  const world = useContext(MatterContext);
  const bodyRef = useRef<Body | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  // choose shape
  const shapes = ["Ball", "Pentagon", "Rectangle", "Triangle"];
  const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

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

  useEffect(() => {
    if (!world) return;
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

    bodyRef.current = body;
    World.add(world, body);

    // Update position and angle based on physics
    const updatePosition = () => {
      return;
    };
    const interval = setInterval(updatePosition, 160); // ~60fps

    // apply initial force(random)
    const horizontalForce = (Math.random() - 0.5) * 0.03;
    const verticalForce = Math.random() * 0.01;
    Body.applyForce(body, body.position, {
      x: horizontalForce,
      y: verticalForce,
    });

    return () => {
      clearInterval(interval);
      if (bodyRef.current && world) {
        World.remove(world, bodyRef.current);
      }
    };
  }, [world, shapeType]);

  //   conditionally switch params for creating matters Body
  const getShapeColor = (shape: string): string => {
    const colors = {
      Ball: ["#ff6b6b", "#ff8e53", "#ff6b9d", "#c44569", "#88ebeb"],
      Rectangle: ["#4ecdc4", "#45aaf2", "#26de81", "#2bcbba"],
      Pentagon: ["#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"],
    };
    const shapeColors = colors[shape as keyof typeof colors] || colors.Ball;
    return shapeColors[Math.floor(Math.random() * shapeColors.length)];
  };

  //
  return <></>;
};

export default TaskObject;
