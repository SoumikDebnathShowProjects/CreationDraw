/**
 * API Contracts - Centralized type definitions
 * This is the source of truth for all API contracts
 */

// ==================== AUTH CONTRACTS ====================

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    status: 'online' | 'offline' | 'away';
  };
}

// ==================== SHAPE CONTRACTS ====================

export interface BackendShape {
  id: string;
  type: 'path' | 'line' | 'rectangle' | 'circle' | 'text';
  points: Array<{ x: number; y: number }> | null;
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
  text: string | null;
  color: string;
  width: number;
  fill: string | null;
  userId: string;
  createdAt: string; // ISO8601 string
}

export interface FrontendShape {
  id: string;
  type: 'path' | 'line' | 'rectangle' | 'circle' | 'text';
  points?: Array<{ x: number; y: number }>;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  text?: string;
  color: string;
  width: number;
  fill?: string;
  userId: string;
  timestamp: number; // Unix timestamp in ms
}

export interface CreateShapeRequest {
  type: 'path' | 'line' | 'rectangle' | 'circle' | 'text';
  points?: Array<{ x: number; y: number }>;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  text?: string;
  color: string;
  width: number;
  fill?: string;
}

export interface CreateShapeResponse {
  success: boolean;
  shapeId: string;
}

// ==================== ROOM CONTRACTS ====================

export interface BackendRoom {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  memberCount: number;
  isPublic: boolean;
  createdBy: string;
  isFavorite?: boolean;
}

// ==================== WEBSOCKET MESSAGE CONTRACTS ====================

export interface WSJoinRoom {
  type: 'join_room';
  roomId: string;
  userId: string;
}

export interface WSDrawEvent {
  type: 'draw_event';
  event: {
    type: 'DRAW_START' | 'DRAW_MOVE' | 'DRAW_END' | 'SHAPE_ADD';
    roomId: string;
    userId: string;
    point?: { x: number; y: number };
    shape?: FrontendShape;
    color?: string;
    width?: number;
  };
}

export interface WSCursorMove {
  type: 'cursor_move';
  x: number;
  y: number;
  userId: string;
  roomId: string;
  userName?: string;
  color?: string;
}

export type WSClientMessage = WSJoinRoom | WSDrawEvent | WSCursorMove;

export interface WSServerConnected {
  type: 'connected';
}

export interface WSServerJoined {
  type: 'joined';
  roomId: string;
}

export interface WSServerDraw {
  type: 'draw';
  event: {
    type: 'DRAW_START' | 'DRAW_MOVE' | 'DRAW_END' | 'SHAPE_ADD';
    roomId: string;
    userId: string;
    point?: { x: number; y: number };
    shape?: FrontendShape;
    color?: string;
    width?: number;
  };
}

export interface WSServerCursor {
  type: 'cursor';
  cursor: {
    userId: string;
    userName: string;
    x: number;
    y: number;
    color: string;
  };
}

export interface WSServerUserJoined {
  type: 'user_joined';
  user: {
    id: string;
  };
}

export interface WSServerUserLeft {
  type: 'user_left';
  userId: string;
}

export type WSServerMessage = 
  | WSServerConnected 
  | WSServerJoined 
  | WSServerDraw 
  | WSServerCursor 
  | WSServerUserJoined 
  | WSServerUserLeft;

// ==================== CONVERSION HELPERS ====================

/**
 * Convert backend shape to frontend shape
 */
export function backendShapeToFrontend(backend: BackendShape): FrontendShape {
  return {
    id: backend.id,
    type: backend.type,
    points: backend.points || undefined,
    startPoint: backend.startPoint || undefined,
    endPoint: backend.endPoint || undefined,
    text: backend.text || undefined,
    color: backend.color,
    width: backend.width,
    fill: backend.fill || undefined,
    userId: backend.userId,
    timestamp: new Date(backend.createdAt).getTime(),
  };
}

/**
 * Convert frontend shape to backend create request
 */
export function frontendShapeToBackend(frontend: Omit<FrontendShape, 'id' | 'timestamp'>): CreateShapeRequest {
  return {
    type: frontend.type,
    points: frontend.points,
    startPoint: frontend.startPoint,
    endPoint: frontend.endPoint,
    text: frontend.text,
    color: frontend.color,
    width: frontend.width,
    fill: frontend.fill,
  };
}
