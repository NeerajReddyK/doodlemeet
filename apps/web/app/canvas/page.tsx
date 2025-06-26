"use client"

import { useEffect, useRef, useState } from "react"

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  const getCanvasCoordinates = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    isDrawing.current = true;
    console.log("isDrawing from mousedown: ", isDrawing);
    const canvas = canvasRef.current;
    if(!canvas) {
      console.log("canvas is null");
      return;
    }
    const coords = getCanvasCoordinates(e, canvas);
    startX.current = coords.x;
    startY.current = coords.y;
  }
  
  const handleMouseUp = (e: MouseEvent) => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if(!canvas) {
      console.log("canvas is null");
      return;
    }
    const context = canvas.getContext("2d");
    if(!context) {
      console.log("Context is null");
      return;
    }
    const coords = getCanvasCoordinates(e, canvas);
    const width = coords.x - startX.current;
    const height = coords.y - startY.current;

    context.strokeStyle = "white";
    context.strokeRect(startX.current, startY.current, width, height);
  }

  const handleMouseMove = (e: MouseEvent) => {
    if(!isDrawing.current) {
      return;
    }
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    if(!context) return;

    const coords = getCanvasCoordinates(e, canvas);
    console.log("Log from mousemove x, y: ", coords.x, coords.y);

    const width = coords.x - startX.current;
    const height = coords.y - startY.current;
    context.beginPath();
    context.strokeStyle = 'white';
    context.strokeRect(startX.current, startY.current, width, height);
    context.clearRect(startX.current, startY.current, width, height);
    context.closePath();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) {
      console.log("canvas is null");
      return;
    }
    const context = canvas.getContext("2d");
    if(!context) {
      console.log("context is null");
      return;
    }

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      console.log("resize called");
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    }

  }, [])

  return (
    <canvas ref={canvasRef} className="bg-black w-screen h-screen"/>
  )
}

export default Canvas;