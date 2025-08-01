export interface Student {
  id: string;
  name: string;
}

export interface Desk {
  id: string;
  number: number;
  x: number;
  y: number;
  type: 'rectangular' | 'round';
  assignedStudent?: Student;
  groupId?: string;
}

export interface DeskGroup {
  id: string;
  name: string;
  color: string;
  deskIds: string[];
}

export interface Constraint {
  id: string;
  type: 'hard_seat' | 'keep_apart' | 'distance' | 'must_be_in_group' | 'cannot_be_in_group';
  studentIds: string[];
  deskId?: string;
  minDistance?: number;
  groupId?: string;
}

export interface FurnitureItem {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  rotation: number; // 0, 90, 180, 270 degrees
}

export interface RoomLayout {
  id: string;
  name: string;
  desks: Desk[];
  students: Student[];
  constraints: Constraint[];
  deskGroups: DeskGroup[];
  furniture: FurnitureItem[];
  frontLabel: { x: number; y: number; } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeatingResult {
  success: boolean;
  assignments: Record<string, string>; // deskId -> studentId
  errorMessage?: string;
  conflictingConstraints?: string[];
}
