'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Eraser, Circle, Undo, Redo, Trash2 } from 'lucide-react';
import { Room, Shape, Point } from '@/types';
import { WebSocketClient } from '@/lib/services/websocket';
import { shapeService } from '@/lib/services/shapes';

type Tool = 'pen' | 'eraser' | 'circle';

interface CanvasViewProps {
  room: Room;
  userId: string;
}

export default function CanvasView({ room, userId }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocketClient>(new WebSocketClient());

  const [tool, setTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const color = '#000000';

  // ===================== WebSocket + Load
  useEffect(() => {
    const ws = wsRef.current;
    ws.connect(userId);

    shapeService.loadShapes(room.id).then(data => {
      setShapes(data);
      redraw(data);
    });

    ws.on('draw', (shape: Shape) => {
      setShapes(prev => {
        const updated = [...prev, shape];
        redraw(updated);
        return updated;
      });
    });

    return () => ws.disconnect();
  }, [room.id, userId]);

  // ===================== Helpers
  const getPos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const redraw = (data: Shape[]) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.width;
      ctx.lineCap = 'round';

      if (shape.type === 'path' && shape.points) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      if (shape.type === 'circle' && shape.startPoint && shape.endPoint) {
        const r = Math.hypot(
          shape.endPoint.x - shape.startPoint.x,
          shape.endPoint.y - shape.startPoint.y
        );
        ctx.beginPath();
        ctx.arc(shape.startPoint.x, shape.startPoint.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  };

  const saveHistory = (data: Shape[]) => {
    const h = history.slice(0, historyIndex + 1);
    setHistory([...h, data]);
    setHistoryIndex(h.length);
  };

  // ===================== Mouse Handlers
  const handleDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const p = getPos(e);
    setStartPoint(p);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath([p]);
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = getPos(e);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath(prev => {
        const last = prev[prev.length - 1];
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
        ctx.stroke();
        return [...prev, p];
      });
    }

    if (tool === 'circle' && startPoint) {
      redraw(shapes);
      const r = Math.hypot(p.x - startPoint.x, p.y - startPoint.y);
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
  };

  const handleUp = async (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);
    const end = getPos(e);

    let newShape: Shape | null = null;

    if (tool === 'pen' || tool === 'eraser') {
      newShape = {
        id: crypto.randomUUID(),
        type: 'path',
        points: currentPath,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: tool === 'eraser' ? brushSize * 3 : brushSize,
        userId,
        timestamp: Date.now()
      };
    }

    if (tool === 'circle') {
      newShape = {
        id: crypto.randomUUID(),
        type: 'circle',
        startPoint,
        endPoint: end,
        color,
        width: brushSize,
        userId,
        timestamp: Date.now()
      };
    }

    if (newShape) {
      const updated = [...shapes, newShape];
      setShapes(updated);
      saveHistory(updated);
      redraw(updated);

      await shapeService.saveShape(room.id, newShape);
      wsRef.current.send('draw', newShape);
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  // ===================== Actions
  const undo = () => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setHistoryIndex(i => i - 1);
    setShapes(prev);
    redraw(prev);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setHistoryIndex(i => i + 1);
    setShapes(next);
    redraw(next);
  };

  const clear = () => {
    setShapes([]);
    saveHistory([]);
    redraw([]);
  };

  // ===================== UI
  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex gap-2 p-3 bg-white border-b">
        <button onClick={() => setTool('pen')}><Pencil /></button>
        <button onClick={() => setTool('eraser')}><Eraser /></button>
        <button onClick={() => setTool('circle')}><Circle /></button>
        <button onClick={undo}><Undo /></button>
        <button onClick={redo}><Redo /></button>
        <button onClick={clear}><Trash2 /></button>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm">Size</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={e => setBrushSize(+e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <canvas
          ref={canvasRef}
          width={1400}
          height={900}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          className="bg-white shadow-xl rounded cursor-crosshair"
        />
      </div>
    </div>
  );
}
