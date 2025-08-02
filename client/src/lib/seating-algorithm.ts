import { Desk, Student, Constraint, SeatingResult } from '@/types/seating';

const MAX_ITERATIONS = 50000;

interface Position {
  x: number;
  y: number;
}

// Calculate Manhattan distance between two desks
function getManhattanDistance(desk1: Desk, desk2: Desk): number {
  const gridSize = 20;
  const x1 = Math.round(desk1.x / gridSize);
  const y1 = Math.round(desk1.y / gridSize);
  const x2 = Math.round(desk2.x / gridSize);
  const y2 = Math.round(desk2.y / gridSize);
  
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Check if two desks are adjacent (touching)
function areDesksAdjacent(desk1: Desk, desk2: Desk): boolean {
  return getManhattanDistance(desk1, desk2) <= 1;
}

// Validate constraints for a given assignment
function validateConstraints(
  assignments: Record<string, string>,
  desks: Desk[],
  constraints: Constraint[]
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const deskMap = new Map(desks.map(d => [d.id, d]));

  for (const constraint of constraints) {
    switch (constraint.type) {
      case 'hard_seat': {
        if (constraint.studentIds.length === 0) {
          // Empty desk constraint - desk should remain empty
          if (assignments[constraint.deskId!]) {
            violations.push(`Locked empty desk constraint violated: Desk must remain empty`);
          }
        } else {
          // Student assignment constraint
          const [studentId] = constraint.studentIds;
          const assignedDeskId = Object.keys(assignments).find(
            deskId => assignments[deskId] === studentId
          );
          
          if (assignedDeskId !== constraint.deskId) {
            violations.push(`Hard seat constraint violated: Student must be at specific desk`);
          }
        }
        break;
      }

      case 'keep_apart': {
        const [studentId1, studentId2] = constraint.studentIds;
        const desk1Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId1
        );
        const desk2Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId2
        );

        if (desk1Id && desk2Id) {
          const desk1 = deskMap.get(desk1Id);
          const desk2 = deskMap.get(desk2Id);
          
          if (desk1 && desk2 && areDesksAdjacent(desk1, desk2)) {
            violations.push(`Keep apart constraint violated: Students are sitting too close`);
          }
        }
        break;
      }

      case 'keep_together': {
        const [studentId1, studentId2] = constraint.studentIds;
        const desk1Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId1
        );
        const desk2Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId2
        );

        if (desk1Id && desk2Id) {
          const desk1 = deskMap.get(desk1Id);
          const desk2 = deskMap.get(desk2Id);
          
          if (desk1 && desk2 && !areDesksAdjacent(desk1, desk2)) {
            violations.push(`Keep together constraint violated: Students are not sitting close enough`);
          }
        }
        break;
      }

      case 'distance': {
        const [studentId1, studentId2] = constraint.studentIds;
        const desk1Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId1
        );
        const desk2Id = Object.keys(assignments).find(
          deskId => assignments[deskId] === studentId2
        );

        if (desk1Id && desk2Id && constraint.minDistance) {
          const desk1 = deskMap.get(desk1Id);
          const desk2 = deskMap.get(desk2Id);
          
          if (desk1 && desk2) {
            const distance = getManhattanDistance(desk1, desk2);
            if (distance < constraint.minDistance) {
              violations.push(`Distance constraint violated: Students are too close`);
            }
          }
        }
        break;
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

// Check if placing a student at a desk would violate constraints
function wouldViolateConstraints(
  studentId: string,
  deskId: string,
  currentAssignments: Record<string, string>,
  desks: Desk[],
  constraints: Constraint[]
): boolean {
  const testAssignments = { ...currentAssignments, [deskId]: studentId };
  const { valid } = validateConstraints(testAssignments, desks, constraints);
  return !valid;
}

export function generateSeatingChart(
  desks: Desk[],
  students: Student[],
  constraints: Constraint[]
): SeatingResult {
  // Count locked empty desks first
  const hardSeatConstraints = constraints.filter(c => c.type === 'hard_seat');
  const lockedEmptyDesks = hardSeatConstraints.filter(c => c.studentIds.length === 0).length;
  const availableDeskCount = desks.length - lockedEmptyDesks;
  
  // Early validation with locked desks consideration
  if (students.length > availableDeskCount) {
    return {
      success: false,
      assignments: {},
      errorMessage: `Too many students (${students.length}) for available desks (${availableDeskCount}). ${lockedEmptyDesks} desks are locked empty. Please add more desks, remove students, or unlock some desks.`
    };
  }

  // Check for impossible constraints
  const hardSeatDesks = new Set(hardSeatConstraints.map(c => c.deskId));
  if (hardSeatDesks.size !== hardSeatConstraints.length) {
    return {
      success: false,
      assignments: {},
      errorMessage: 'Multiple students assigned to the same desk in hard seat constraints.'
    };
  }

  const assignments: Record<string, string> = {};
  const assignedStudents = new Set<string>();
  const availableDesks = [...desks];

  // Step 1: Handle hard seat constraints first
  for (const constraint of hardSeatConstraints) {
    if (constraint.type === 'hard_seat' && constraint.deskId) {
      if (constraint.studentIds.length === 0) {
        // Locked empty desk - remove from available desks but don't assign anyone
        const deskIndex = availableDesks.findIndex(d => d.id === constraint.deskId);
        if (deskIndex >= 0) {
          availableDesks.splice(deskIndex, 1);
        }
      } else {
        // Student assignment constraint
        const [studentId] = constraint.studentIds;
        assignments[constraint.deskId] = studentId;
        assignedStudents.add(studentId);
        
        const deskIndex = availableDesks.findIndex(d => d.id === constraint.deskId);
        if (deskIndex >= 0) {
          availableDesks.splice(deskIndex, 1);
        }
      }
    }
  }

  // Step 2: Pre-validate keep_together constraints for conflicts
  const keepTogetherConstraints = constraints.filter(c => c.type === 'keep_together');
  const studentConnections = new Map<string, Set<string>>();
  
  // Build a graph of keep_together relationships
  for (const constraint of keepTogetherConstraints) {
    const [student1, student2] = constraint.studentIds;
    if (!studentConnections.has(student1)) {
      studentConnections.set(student1, new Set());
    }
    if (!studentConnections.has(student2)) {
      studentConnections.set(student2, new Set());
    }
    studentConnections.get(student1)!.add(student2);
    studentConnections.get(student2)!.add(student1);
  }
  
  // Check for impossible keep_together constraint groups (more than 4 students connected)
  for (const [studentId, connections] of studentConnections) {
    if (connections.size > 3) {
      return {
        success: false,
        assignments: {},
        errorMessage: `Student "${students.find(s => s.id === studentId)?.name}" has too many "keep together" constraints. Each student can only be kept together with at most 3 other students to form a valid desk cluster.`
      };
    }
  }
  
  // Step 3: Assign remaining students using backtracking
  const remainingStudents = students.filter(s => !assignedStudents.has(s.id));
  
  function backtrack(studentIndex: number, iterations: number): boolean {
    if (iterations > MAX_ITERATIONS) {
      return false;
    }

    if (studentIndex >= remainingStudents.length) {
      return true; // All students assigned
    }

    const student = remainingStudents[studentIndex];
    
    // Get currently available desks (not assigned and not locked)
    const currentlyAvailableDesks = availableDesks.filter(desk => !assignments[desk.id]);
    
    // Early termination: if we don't have enough desks for remaining students
    if (currentlyAvailableDesks.length < (remainingStudents.length - studentIndex)) {
      return false;
    }
    
    // Shuffle available desks for randomization
    const shuffledDesks = [...currentlyAvailableDesks].sort(() => Math.random() - 0.5);

    for (const desk of shuffledDesks) {
      // Check if this assignment would violate any constraints
      if (!wouldViolateConstraints(student.id, desk.id, assignments, desks, constraints)) {
        assignments[desk.id] = student.id;
        
        if (backtrack(studentIndex + 1, iterations + 1)) {
          return true;
        }
        
        // Backtrack
        delete assignments[desk.id];
      }
    }

    return false;
  }

  const success = backtrack(0, 0);

  if (!success) {
    // Identify conflicting constraints
    const conflictingConstraints = constraints
      .filter(c => {
        if (c.type === 'keep_apart') {
          const [student1, student2] = c.studentIds;
          return remainingStudents.some(s => s.id === student1) && 
                 remainingStudents.some(s => s.id === student2);
        }
        if (c.type === 'keep_together') {
          const [student1, student2] = c.studentIds;
          return remainingStudents.some(s => s.id === student1) && 
                 remainingStudents.some(s => s.id === student2);
        }
        return false;
      })
      .map(c => {
        if (c.type === 'keep_apart') {
          return `Keep apart: ${c.studentIds.join(' and ')}`;
        }
        if (c.type === 'keep_together') {
          return `Keep together: ${c.studentIds.join(' and ')}`;
        }
        return 'Unknown constraint';
      });

    return {
      success: false,
      assignments: {},
      errorMessage: 'Unable to generate seating chart that satisfies all constraints. This may be due to conflicting keep_together requirements or insufficient desk arrangement. Try reducing constraint complexity or reorganizing desk layout.',
      conflictingConstraints
    };
  }

  // Final validation
  const { valid, violations } = validateConstraints(assignments, desks, constraints);
  
  return {
    success: valid,
    assignments,
    errorMessage: valid ? undefined : violations.join('; ')
  };
}
