"use client"

import { use, useCallback, useEffect, useRef } from "react";
import axios from "axios";
const slug = "neerajroom2";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNWRiMjViNy1iZjc5LTRkMTItYTQ3MC1iZDg1OTEzNjRlMGMiLCJlbWFpbCI6Im5lZXJhajFAZ21haWwuY29tIiwiaWF0IjoxNzUxMDE1Nzc3LCJleHAiOjE3NTE2MjA1Nzd9.xE0Mfa3OVCQg6J-CwgJOH1cHtqw3JvlOIcRTsL86ISQ";

interface initMessageSchema {
  id: number,
  message: {
    type: string,
    x: number,
    y: number,
    width: number,
    height: number
  },
  slug: string,
  userId: string,
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDrawing = useRef(false);
  const initMessages = useRef<initMessageSchema []>([])
  const beUrl = process.env.NEXT_PUBLIC_BE_URL;

  const getCanvasCoordinates = (canvas: HTMLCanvasElement, e: MouseEvent) => {
    const coords = canvas.getBoundingClientRect();
    return ({
      x: e.clientX - coords.left,
      y: e.clientY - coords.top
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    if(!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  const handleMouseDown = useCallback((e: MouseEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    const coords = getCanvasCoordinates(canvas, e);
    startX.current = coords.x;
    startY.current = coords.y;
  }, []);

  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    if(!context) return;

    const coords = getCanvasCoordinates(canvas, e);
    const width = coords.x - startX.current;
    const height = coords.y - startY.current;
    if(!beUrl) {
      console.log("undefined backend url")
      return;
    }

    const data = await axios.post(`${beUrl}/chats/${slug}`, {
      message: {
        type: "chat",
        x: Number(startX.current),
        y: Number(startY.current),
        width: Number(width),
        height: Number(height)
      }
    },
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
    );
    initMessages.current.push({
      id: 0,
      message: {
        type: "chat",
        x: Number(startX.current),
        y: Number(startY.current),
        width: Number(width),
        height: Number(height)
      },
      userId: "not-yet-assigned",
      slug: slug,
    })

    context.strokeStyle = "white";
    context.strokeRect(startX.current, startY.current, width, height);
  }, []);

  const handleMouseMove = useCallback(async (e: MouseEvent) => {
    if(!isDrawing.current) {
      return;
    }
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    if(!context) return;

    clearCanvas();
    secondaryInitCanvas();

    const coords = getCanvasCoordinates(canvas, e);
    let width = Math.abs(coords.x - startX.current); 
    let height = Math.abs(coords.y - startY.current);
    const x = Math.min(startX.current, coords.x);
    const y = Math.min(startY.current, coords.y);

    context.strokeStyle = "white";
    context.strokeRect(x, y, width, height);
  }, []);

  const fetchData = async () => {
    
    const response = await axios.get(`${beUrl}/chats/${slug}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const rawMessages = response.data.messages;
    const parsedMessages = rawMessages.map((msg: any) => ({
      ...msg,
      message: JSON.parse(msg.message)
    }));
    return parsedMessages;
  }
  const initCanvas = async () => {
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
    const parsedMessages = await fetchData();
    context.strokeStyle = "white";
    parsedMessages.forEach((msg: any) => {
      const {x, y, width, height} = msg.message;
      context.strokeRect(x, y, width, height);
    });
    initMessages.current = parsedMessages;
  }

  const secondaryInitCanvas = () => {
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
    context.strokeStyle = "white";
    initMessages.current.forEach((msg) => {
      const {x, y, width, height} = msg.message;
      context.strokeRect(x, y, width, height);
    })
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

    initCanvas();


    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth; 
      canvas.height = canvas.offsetHeight;
      context.strokeStyle = "white";
      initMessages.current.forEach((msg) => {
        const {x, y, width, height} = msg.message;
        context.strokeRect(x, y, width, height);
      });
    }
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
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
    <canvas ref={canvasRef} className="bg-black w-screen h-screen" />
  )
}

export default Canvas;
