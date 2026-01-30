# DrawBoard Backend API

Complete HTTP backend for the DrawBoard collaborative drawing platform.

## Features

- ✅ User authentication (JWT)
- ✅ Room management (CRUD)
- ✅ Real-time collaboration (WebSocket)
- ✅ Shape persistence
- ✅ Team management
- ✅ User profiles

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Update `.env` with your `DATABASE_URL`
3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

### 3. Environment Variables

Copy `.env.example` to `.env` and update:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/drawboard"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/signin` - Sign in
- `POST /auth/signup` - Sign up

### User
- `GET /me` - Get current user
- `PUT /me` - Update profile
- `DELETE /me` - Delete account

### Rooms
- `GET /rooms` - List all rooms
- `POST /rooms` - Create room
- `GET /rooms/:roomId` - Get room details
- `POST /rooms/:roomId/join` - Join room
- `GET /rooms/:roomId/members` - Get room members
- `GET /rooms/:roomId/shapes` - Get room shapes
- `POST /rooms/:roomId/shapes` - Create shape

### Team
- `GET /team/members` - Get team members
- `POST /team/invite` - Invite member
- `PUT /team/members/:userId/role` - Update role
- `DELETE /team/members/:userId` - Remove member
- `GET /team/members/:userId/activity` - Get activity

## WebSocket

WebSocket server runs on the same port as HTTP server at `/ws`.

### Connection
```
ws://localhost:3001/ws?token=JWT_TOKEN&userId=USER_ID
```

### Message Types

**Client → Server:**
- `join_room`: `{ type: 'join_room', roomId: string }`
- `draw_event`: `{ type: 'draw_event', event: DrawEvent }`
- `cursor_move`: `{ type: 'cursor_move', x: number, y: number, userName: string, color?: string }`

**Server → Client:**
- `connected`: `{ type: 'connected' }`
- `joined`: `{ type: 'joined', roomId: string }`
- `draw`: `{ type: 'draw', event: DrawEvent }`
- `cursor`: `{ type: 'cursor', cursor: Cursor }`
- `user_joined`: `{ type: 'user_joined', user: User }`
- `user_left`: `{ type: 'user_left', userId: string }`

## Database Schema

See `prisma/schema.prisma` for complete schema.

### Models
- `User` - User accounts
- `Room` - Drawing rooms
- `RoomMember` - Room membership
- `Shape` - Canvas shapes
- `TeamMember` - Team membership
- `TeamInvite` - Team invitations

## Production Deployment

1. Set environment variables
2. Build: `npm run build`
3. Start: `npm start`
4. Use process manager (PM2, systemd, etc.)

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS/WSS in production
- Configure CORS properly
- Use environment variables for secrets
- Implement rate limiting
- Add input validation middleware
