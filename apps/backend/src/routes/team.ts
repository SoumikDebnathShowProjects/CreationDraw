import { Router } from 'express';
import {prisma}from '@repo/db'
import { authMiddleware } from '../middleware/auth';

const router:Router = Router();

// Get all team members
router.get('/team/members', authMiddleware, async (req, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    res.json(
      teamMembers.map((tm) => ({
        id: tm.user.id,
        name: tm.user.name,
        email: tm.user.email,
        avatar: tm.user.avatar,
        status: tm.user.status,
        role: tm.role,
        joinedAt: tm.joinedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Invite team member
router.post('/team/invite', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // User exists, add to team if not already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: { userId: existingUser.id },
      });

      if (existingMember) {
        return res.status(400).json({ message: 'User is already a team member' });
      }

      await prisma.teamMember.create({
        data: {
          userId: existingUser.id,
          role: role || 'member',
        },
      });

      return res.json({ success: true, message: 'User added to team' });
    }

    // User doesn't exist, create invite
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    await prisma.teamInvite.create({
      data: {
        email,
        role: role || 'member',
        invitedBy: userId,
        expiresAt,
      },
    });

    // TODO: Send invitation email here

    res.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update member role
router.put('/team/members/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { role } = req.body;
    const currentUserId = req.userId!;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if current user is admin
    const currentUser = await prisma.teamMember.findUnique({
      where: { userId: currentUserId },
    });

    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    // Update role
    await prisma.teamMember.update({
      where: { userId: targetUserId },
      data: { role },
    });

    res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove team member
router.delete('/team/members/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId!;

    // Prevent self-deletion
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    // Check if current user is admin
    const currentUser = await prisma.teamMember.findUnique({
      where: { userId: currentUserId },
    });

    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Remove from team
    await prisma.teamMember.delete({
      where: { userId: targetUserId },
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get member activity
router.get('/team/members/:userId/activity', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params as any;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roomMembers: {
          select: {
            roomId: true,
          },
        },
        shapes: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get last active time (most recent shape creation or room join)
    const lastShape = await prisma.shape.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const lastRoomJoin = await prisma.roomMember.findFirst({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      select: { joinedAt: true },
    });

    const lastActive = lastShape?.createdAt || lastRoomJoin?.joinedAt || user.updatedAt;

    res.json({
      lastActive: lastActive.toISOString(),
      roomsJoined: user.roomMembers.length,
      shapesCreated: user.shapes.length,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
