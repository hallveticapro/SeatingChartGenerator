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
}

export interface Constraint {
  id: string;
  type: 'hard_seat' | 'keep_apart' | 'distance';
  studentIds: string[];
  deskId?: string;
  minDistance?: number;
}

export interface RoomLayout {
  id: string;
  name: string;
  desks: Desk[];
  students: Student[];
  constraints: Constraint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SeatingResult {
  success: boolean;
  assignments: Record<string, string>; // deskId -> studentId
  errorMessage?: string;
  conflictingConstraints?: string[];
}
