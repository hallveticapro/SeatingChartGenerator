import { RoomLayout } from '@/types/seating';

const STORAGE_KEY = 'classroom_seating_layouts';

export const storage = {
  saveLayout: (layout: RoomLayout): void => {
    try {
      const layouts = storage.getAllLayouts();
      const existingIndex = layouts.findIndex(l => l.id === layout.id);
      
      if (existingIndex >= 0) {
        layouts[existingIndex] = { ...layout, updatedAt: new Date() };
      } else {
        layouts.push(layout);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  },

  getLayout: (id: string): RoomLayout | null => {
    try {
      const layouts = storage.getAllLayouts();
      return layouts.find(l => l.id === id) || null;
    } catch (error) {
      console.error('Failed to get layout from localStorage:', error);
      return null;
    }
  },

  getAllLayouts: (): RoomLayout[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const layouts = JSON.parse(stored);
      return layouts.map((layout: any) => ({
        ...layout,
        createdAt: new Date(layout.createdAt),
        updatedAt: new Date(layout.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get layouts from localStorage:', error);
      return [];
    }
  },

  deleteLayout: (id: string): void => {
    try {
      const layouts = storage.getAllLayouts().filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error('Failed to delete layout from localStorage:', error);
    }
  }
};
