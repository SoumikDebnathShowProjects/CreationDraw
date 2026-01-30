import { WebSocketServer, WebSocket } from 'ws';

interface Client {
  ws: WebSocket;
}

const clients = new Set<Client>(); // avoid duplicate clients

export function setupWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, ) => {
    const client: Client = { ws };
    clients.add(client);
    ws.on('message', (data: Buffer) => {
      const message = data.toString();
      console.log('Received:', message);

      // Broadcast to all OTHER clients
      clients.forEach(c => {
        if (c !== client && c.ws.readyState === WebSocket.OPEN) {
          c.ws.send(message); // ✅ use send(), not emit()
        }
      });
    });

    ws.on('close', () => {
      clients.delete(client);
      console.log('Client disconnected');
    });
  });

  console.log('Minimal WebSocket server running on /ws');
}
