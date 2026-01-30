// lib/services/websocket.ts

import { env } from '@/lib/config/env';
import { apiClient } from './api';

type WSMessage = {
  type: string;
  payload?: any;
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Function[]>();
  private connected = false;

  connect(userId: string) {
    if (this.ws) return;

    const token = apiClient.getAuthToken();
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const baseUrl = env.WS_URL
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace(/\/$/, '');

    const url = `${baseUrl}/ws?token=${token}&userId=${userId}`;
    console.log(url);
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.connected = true;
      this.emit('connected');
      console.log('WS connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (err) {
        console.error('WS message parse error', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('WS error', err);
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.emit('disconnected');
      this.ws = null;
      console.log('WS disconnected');
    };
  }

  send(type: string, payload?: any) {
    if (!this.connected || !this.ws) return;
    this.ws.send(JSON.stringify({ type, payload }));
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const list = this.listeners.get(event);
    if (!list) return;
    this.listeners.set(
      event,
      list.filter(cb => cb !== callback)
    );
  }

  disconnect() {
    this.connected = false;
    this.ws?.close();
    this.ws = null;
    this.listeners.clear();
  }

  isConnected() {
    return this.connected;
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}
