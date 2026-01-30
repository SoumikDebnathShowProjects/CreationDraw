export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
};

export type Room = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  isPublic: boolean;
  createdBy: string;
  thumbnail?: string;
  isFavorite?: boolean;
};

export type Point = { x: number; y: number };

export type Shape = {
  id: string;
  type: 'path' | 'line' | 'rectangle' | 'circle' | 'text';
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  color: string;
  width: number;
  fill?: string;
  userId: string;
  timestamp: number;
};

export type DrawEvent = {
  type: 'DRAW_START' | 'DRAW_MOVE' | 'DRAW_END' | 'SHAPE_ADD' | 'UNDO' | 'REDO' | 'CLEAR';
  roomId: string;
  userId: string;
  point?: any;
  shape?: Shape|any;
  color?: string;
  width?: number;
};


export type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'select';

export type Cursor = {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
};

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
};
