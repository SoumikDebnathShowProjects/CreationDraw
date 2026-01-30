import { Router } from 'express';
import { prisma } from '@repo/db';
import { authMiddleware } from '../middleware/auth';

const router:Router = Router();

// Get all rooms
router.get('/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        members: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(
      rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
        isPublic: room.isPublic,
        createdBy: room.createdById,
        memberCount: room.members.length,
        isFavorite: false, // Frontend-only state
      }))
    );
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create room
router.post('/rooms', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const room = await prisma.room.create({
      data: {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description: description ?? '',
        isPublic: isPublic ?? false,
        createdById: userId,
        members: {
          create: { userId },
        },
      },
    });

    res.json({
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      memberCount: 1,
      isPublic: room.isPublic,
      createdBy: room.createdById,
      isFavorite: false,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room by ID
router.get('/rooms/:roomId', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId;

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ message: 'Invalid roomId' });
    }

const room = await prisma.room.findUnique({
  where: { id: roomId },
  select: {
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    isPublic: true,
    createdById: true,
    members: {
      select: {
        userId: true,
      },
    },
  },
});

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      memberCount: room.members.length,
      isPublic: room.isPublic,
      createdBy: room.createdById,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join room
router.post('/rooms/:roomId/join', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { roomId } = req.params as any;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add user to room members
    await prisma.roomMember.upsert({
      where: {
        roomId_userId: { roomId, userId },
      },
      update: {},
      create: { roomId, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room members
router.get('/rooms/:roomId/members', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId as any;

    if (!roomId) {
      return res.status(400).json({ message: 'Invalid roomId' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    res.json(members.map((m) => m.user));
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room shapes
router.get('/rooms/:roomId/shapes', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId as any;

    if (!roomId) {
      return res.status(400).json({ message: 'Invalid roomId' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const shapes = await prisma.shape.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        points: true,
        startPoint: true,
        endPoint: true,
        text: true,
        color: true,
        width: true,
        fill: true,
        userId: true,
        createdAt: true,
      },
    });

    res.json(shapes);
  } catch (error) {
    console.error('Get shapes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create shape
router.post('/rooms/:roomId/shapes', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId as any;
    const userId = req.userId!;

    const {
      type,
      points,
      startPoint,
      endPoint,
      text,
      color,
      width,
      fill,
    } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Invalid roomId' });
    }

    if (!type || !color || typeof width !== 'number') {
      return res.status(400).json({ message: 'Invalid shape payload' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const shape = await prisma.shape.create({
      data: {
        type,
        color,
        width,
        fill,
        text,
        points: points ? JSON.parse(JSON.stringify(points)) : null,
        startPoint: startPoint ? JSON.parse(JSON.stringify(startPoint)) : null,
        endPoint: endPoint ? JSON.parse(JSON.stringify(endPoint)) : null,
        roomId,
        userId,
      },
    });

    res.json({
      success: true,
      shapeId: shape.id,
    });
  } catch (error) {
    console.error('Create shape error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Update a specific shape in a room
router.put('/rooms/:roomId/shapes/:shapeId', authMiddleware, async (req, res) => {
  try {
    const { roomId, shapeId } = req.params as any;
    const userId = req.userId!;

    const {
      type,
      points,
      startPoint,
      endPoint,
      text,
      color,
      width,
      fill,
    } = req.body;

    if (!roomId || !shapeId) {
      return res.status(400).json({ message: 'Invalid roomId or shapeId' });
    }

    // Check room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check shape exists and belongs to room
    const existingShape = await prisma.shape.findFirst({
      where: {
        id: shapeId,
        roomId,
      },
    });

    if (!existingShape) {
      return res.status(404).json({ message: 'Shape not found' });
    }

    // Optional: allow only creator to update
    if (existingShape.userId !== userId) {
      return res.status(403).json({ message: 'Not allowed to update this shape' });
    }

    const updatedShape = await prisma.shape.update({
      where: { id: shapeId },
      data: {
        type: type ?? undefined,
        color: color ?? undefined,
        width: typeof width === 'number' ? width : undefined,
        fill: fill ?? undefined,
        text: text ?? undefined,
        points: points ? JSON.parse(JSON.stringify(points)) : undefined,
        startPoint: startPoint ? JSON.parse(JSON.stringify(startPoint)) : undefined,
        endPoint: endPoint ? JSON.parse(JSON.stringify(endPoint)) : undefined,
      },
    });

    res.json({
      success: true,
      shape: updatedShape,
    });
  } catch (error) {
    console.error('Update shape error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
