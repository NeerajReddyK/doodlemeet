"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
const slug = "neerajroom1";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNWRiMjViNy1iZjc5LTRkMTItYTQ3MC1iZDg1OTEzNjRlMGMiLCJlbWFpbCI6Im5lZXJhajFAZ21haWwuY29tIiwiaWF0IjoxNzUxMDE1Nzc3LCJleHAiOjE3NTE2MjA1Nzd9.xE0Mfa3OVCQg6J-CwgJOH1cHtqw3JvlOIcRTsL86ISQ";

// import { useEffect, useRef, useState } from "react"

// interface Rectangle {
//   x: number,
//   y: number,
//   width: number,
//   height: number
// }

// const Canvas = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const isDrawing = useRef(false);
//   const startX = useRef<number>(0);
//   const startY = useRef<number>(0);
//   const committedRects = useRef<Rectangle[]>([]);

//   const getCanvasCoordinates = (e: MouseEvent, canvas: HTMLCanvasElement) => {
//     const rect = canvas.getBoundingClientRect();
//     return {
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top
//     }
//   }

//   const handleMouseDown = (e: MouseEvent) => {
//     isDrawing.current = true;
//     console.log("isDrawing from mousedown: ", isDrawing);
//     const canvas = canvasRef.current;
//     if(!canvas) {
//       console.log("canvas is null");
//       return;
//     }
//     const coords = getCanvasCoordinates(e, canvas);
//     startX.current = coords.x;
//     startY.current = coords.y;
//   }
  
//   const handleMouseUp = (e: MouseEvent) => {
//     isDrawing.current = false;
//     const canvas = canvasRef.current;
//     if(!canvas) {
//       console.log("canvas is null");
//       return;
//     }
//     const context = canvas.getContext("2d");
//     if(!context) {
//       console.log("Context is null");
//       return;
//     }
//     const coords = getCanvasCoordinates(e, canvas);
//     const width = coords.x - startX.current;
//     const height = coords.y - startY.current;

//     committedRects.current.push({
//       x: startX.current,
//       y: startY.current,
//       width: width,
//       height: height
//     });
    
//     context.strokeStyle = "white";
//     context.strokeRect(startX.current, startY.current, width, height);
//   }

//   const handleMouseMove = (e: MouseEvent) => {
//     if(!isDrawing.current) {
//       return;
//     }
//     const canvas = canvasRef.current;
//     if(!canvas) return;
//     const context = canvas.getContext("2d");
//     if(!context) return;

//     const coords = getCanvasCoordinates(e, canvas);
//     console.log("Log from mousemove x, y: ", coords.x, coords.y);

//     context.clearRect(0, 0, canvas.width, canvas.height);

//     committedRects.current.forEach(rect => {
//       context.strokeStyle = "white";
//       context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//     });

//     const width = coords.x - startX.current;
//     const height = coords.y - startY.current;
//     context.strokeStyle = 'gray';
//     context.strokeRect(startX.current, startY.current, width, height);
//   }

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if(!canvas) {
//       console.log("canvas is null");
//       return;
//     }
//     const context = canvas.getContext("2d");
//     if(!context) {
//       console.log("context is null");
//       return;
//     }

//     const resizeCanvas = () => {
//       canvas.width = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
//       console.log("resize called");
//     }
//     resizeCanvas();

//     window.addEventListener('resize', resizeCanvas);
//     canvas.addEventListener("mousedown", handleMouseDown);
//     canvas.addEventListener("mouseup", handleMouseUp);
//     canvas.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       window.removeEventListener("resize", resizeCanvas);
//       canvas.removeEventListener("mousedown", handleMouseDown);
//       canvas.removeEventListener("mouseup", handleMouseUp);
//       canvas.removeEventListener("mousemove", handleMouseMove);
//     }

//   }, [])

//   return (
//     <canvas ref={canvasRef} className="bg-black w-screen h-screen"/>
//   )
// }

// export default Canvas;

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
  const xDown = useRef<number>(0);
  const yDown = useRef<number>(0);
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
    xDown.current = coords.x;
    yDown.current = coords.y;
  }, []);

  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext("2d");
    if(!context) return;

    const coords = getCanvasCoordinates(canvas, e);
    const width = coords.x - xDown.current;
    const height = coords.y - yDown.current;
    if(!beUrl) {
      console.log("undefined backend url")
      return;
    }

    const data = await axios.post(`${beUrl}/chats/${slug}`, {
      message: {
        type: "chat",
        x: Number(xDown.current),
        y: Number(yDown.current),
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
    console.log(data);

    context.strokeStyle = "white";
    context.strokeRect(xDown.current, yDown.current, width, height);
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
    initCanvas();

    const coords = getCanvasCoordinates(canvas, e);
    const width = coords.x - xDown.current; 
    const height = coords.y - yDown.current;
    xDown.current = width < 0 ? xDown.current + width: xDown.current; 
    yDown.current = height < 0 ? yDown.current + height : yDown.current; 
    context.strokeStyle = "white";
    context.strokeRect(xDown.current, yDown.current, Math.abs(width), Math.abs(height));
    
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
    console.log(parsedMessages);
    context.strokeStyle = "white";
    parsedMessages.forEach((msg: any) => {
      const {x, y, width, height} = msg.message;
      context.strokeRect(x, y, width, height);
    });
    initMessages.current = parsedMessages;
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