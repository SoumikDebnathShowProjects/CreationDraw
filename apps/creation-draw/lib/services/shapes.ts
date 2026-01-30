import { Shape } from '@/types';
import { roomService } from './rooms';

export const shapeService = {
  saveShape: async (
    roomId: string,
    shape: Omit<Shape, 'id' | 'timestamp'>
  ): Promise<void> => {
    try {
      await roomService.createShape(roomId, shape);
    } catch (error) {
      console.error('Failed to save shape:', error);

      if (typeof window !== 'undefined') {
        try {
          const savedShapes = localStorage.getItem(`shapes_${roomId}`);
          const shapes = savedShapes ? JSON.parse(savedShapes) : [];

          shapes.push({
            ...shape,
            id: 'shape_' + Date.now(),
            timestamp: Date.now(),
          });

          localStorage.setItem(`shapes_${roomId}`, JSON.stringify(shapes));
        } catch (error) {
          console.error('Failed to save shape to localStorage:', error);
        }
      }
    }
  },

  loadShapes: async (roomId: string): Promise<Shape[]> => {
    try {
      return await roomService.getRoomShapes(roomId);
    } catch (error) {
      console.error('Failed to load shapes:', error);

      if (typeof window !== 'undefined') {
        try {
          const savedShapes = localStorage.getItem(`shapes_${roomId}`);
          return savedShapes ? JSON.parse(savedShapes) : [];
        } catch (error) {
          console.error('Failed to parse shapes from localStorage:', error);
          return [];
        }
      }
      return [];
    }
  },

 // ✅ UPDATED FIELD
updateShapes: async (
  roomId: string,
  updatedShape: Shape
): Promise<void> => {
  try {
    const { id, timestamp, ...shapeData } = updatedShape;

    await roomService.updateShape(
      roomId,
      id,
      shapeData
    );
  } catch (error) {
    console.error('Failed to update shape:', error);

    if (typeof window !== 'undefined') {
      try {
        const savedShapes = localStorage.getItem(`shapes_${roomId}`);
        const shapes: Shape[] = savedShapes ? JSON.parse(savedShapes) : [];

        const index = shapes.findIndex(
          shape => shape.id === updatedShape.id
        );

        if (index !== -1) {
          shapes[index] = {
            ...updatedShape,
            timestamp: Date.now(),
          };

          localStorage.setItem(
            `shapes_${roomId}`,
            JSON.stringify(shapes)
          );
        }
      } catch (error) {
        console.error('Failed to update shape in localStorage:', error);
      }
    }
  }
},

};
