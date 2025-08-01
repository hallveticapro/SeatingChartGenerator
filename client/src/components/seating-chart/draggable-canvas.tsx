import { useEffect, useRef, useState } from 'react';
import { Desk, DeskGroup, Student } from '@/types/seating';
import { DeskElement } from './desk-element';
import { DeskArrangements } from './desk-arrangements';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Users, Group, Ungroup, Armchair as Chair, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DraggableCanvasProps {
  desks: Desk[];
  deskGroups: DeskGroup[];
  selectedDeskIds: string[];
  isSelecting: boolean;
  selectionStart: { x: number; y: number } | null;
  selectionEnd: { x: number; y: number } | null;
  onAddDesk: (type: 'rectangular' | 'round') => void;
  onDeleteDesk: (deskId: string) => void;
  onMoveDesk: (deskId: string, x: number, y: number) => void;
  onEditDesk: (deskId: string, number: number) => void;
  onArrangeDesks: (desks: Omit<Desk, 'id' | 'number'>[]) => void;
  onDeskSelect: (deskId: string, ctrlKey: boolean) => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onCanvasMouseMove: (e: React.MouseEvent) => void;
  onCanvasMouseUp: () => void;
  onGroupDesks: () => void;
  onUngroupDesks: () => void;
  onAssignStudent: (deskId: string, studentId: string) => void;
  onLockDeskEmpty: (deskId: string) => void;
  students: { id: string; name: string }[];
  constraints: any[];
  assignedCount: number;
}

export function DraggableCanvas({
  desks,
  deskGroups,
  selectedDeskIds,
  isSelecting,
  selectionStart,
  selectionEnd,
  onAddDesk,
  onDeleteDesk,
  onMoveDesk,
  onEditDesk,
  onArrangeDesks,
  onDeskSelect,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onGroupDesks,
  onUngroupDesks,
  onAssignStudent,
  onLockDeskEmpty,
  students,
  constraints,
  assignedCount
}: DraggableCanvasProps) {
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [assigningDesk, setAssigningDesk] = useState<Desk | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedDeskIds.length > 0) {
        selectedDeskIds.forEach(deskId => onDeleteDesk(deskId));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedDeskIds, onDeleteDesk]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    // Canvas click is now handled by mouse events passed from parent
  };

  const handleDeskEdit = (desk: Desk) => {
    if (desk.isGroupLabel) return; // Don't edit group labels
    setEditingDesk(desk);
    setEditNumber(desk.number.toString());
  };

  const handleDeskAssignment = (desk: Desk) => {
    if (desk.isGroupLabel) return; // Don't assign students to group labels
    if (desk.assignedStudent) {
      // If desk already has a student, edit desk number instead
      handleDeskEdit(desk);
      return;
    }
    if (desk.isLockedEmpty) {
      // If desk is locked empty, unlock it
      onLockDeskEmpty(desk.id);
      return;
    }
    // For unassigned desks, open student assignment dialog
    setAssigningDesk(desk);
    setSelectedStudentId('');
  };

  const handleDragDesk = (deskId: string, x: number, y: number) => {
    const draggedDesk = desks.find(desk => desk.id === deskId);
    if (!draggedDesk) return;

    // If the desk is part of a group, move all desks in the group during drag
    if (draggedDesk.groupId) {
      const deltaX = x - draggedDesk.x;
      const deltaY = y - draggedDesk.y;

      // Update all group desks immediately for smooth movement
      desks.forEach(desk => {
        if (desk.groupId === draggedDesk.groupId && desk.id !== deskId) {
          const element = document.getElementById(`desk-${desk.id}`);
          if (element) {
            const newX = desk.x + deltaX;
            const newY = desk.y + deltaY;
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
          }
        }
      });
    }
  };

  // Determine if selected desks are all in the same group
  const selectedDesks = desks.filter(desk => selectedDeskIds.includes(desk.id));
  const groupIds = Array.from(new Set(selectedDesks.map(desk => desk.groupId).filter(Boolean)));
  const allInSameGroup = groupIds.length === 1 && selectedDesks.every(desk => desk.groupId === groupIds[0]);
  const shouldShowUngroup = allInSameGroup && selectedDeskIds.length > 0;



  const handleSaveEdit = () => {
    if (editingDesk) {
      const newNumber = parseInt(editNumber);
      if (!isNaN(newNumber) && newNumber > 0) {
        onEditDesk(editingDesk.id, newNumber);
      }
      setEditingDesk(null);
      setEditNumber('');
    }
  };

  const handleSaveAssignment = () => {
    if (assigningDesk && selectedStudentId) {
      onAssignStudent(assigningDesk.id, selectedStudentId);
      setAssigningDesk(null);
      setSelectedStudentId('');
    }
  };

  // Get unassigned students for the assignment dialog
  const unassignedStudents = students?.filter(student => 
    !desks.some(desk => desk.assignedStudent?.id === student.id)
  ) || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Canvas Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2 sm:p-4 panel-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button 
              onClick={() => onAddDesk('rectangular')} 
              size="sm"
              style={{ 
                opacity: 1, 
                visibility: 'visible', 
                backgroundColor: 'hsl(214, 85%, 55%)', 
                color: 'white', 
                border: 'none' 
              }}
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="mobile-hidden">Add Desk</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button 
              onClick={() => selectedDeskIds.forEach(deskId => onDeleteDesk(deskId))} 
              variant="destructive"
              size="sm"
              disabled={selectedDeskIds.length === 0}
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="mobile-hidden">Delete Selected ({selectedDeskIds.length})</span>
              <span className="sm:hidden">Delete</span>
            </Button>
            <Button 
              onClick={shouldShowUngroup ? onUngroupDesks : onGroupDesks}
              variant="outline"
              size="sm"
              disabled={shouldShowUngroup ? selectedDeskIds.length === 0 : selectedDeskIds.length < 2}
              style={{ opacity: 1, visibility: 'visible' }}
            >
              {shouldShowUngroup ? (
                <>
                  <Ungroup className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="mobile-hidden">Ungroup</span>
                  <span className="sm:hidden">Ungroup</span>
                </>
              ) : (
                <>
                  <Group className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="mobile-hidden">Group</span>
                  <span className="sm:hidden">Group</span>
                </>
              )}
            </Button>



            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

            <DeskArrangements onArrangeDesks={onArrangeDesks} />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
              <Chair className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{desks.length} desks</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{assignedCount} assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto">
        <div 
          ref={canvasRef}
          id="room-canvas" 
          className="grid-background min-h-full min-w-full relative p-4 sm:p-8 cursor-default"
          style={{ 
            minWidth: '100%', 
            minHeight: '100%',
            width: 'max(100%, 1200px)',
            height: 'max(100%, 800px)'
          }}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
        >
          {/* Room Elements */}








          {/* Group Labels as Special Desks */}
          {deskGroups.map(group => {
            const groupDesks = desks.filter(desk => desk.groupId === group.id && !desk.isGroupLabel);
            if (groupDesks.length === 0) return null;
            
            // Calculate group bounds for better centering
            const xs = groupDesks.map(d => d.x);
            const ys = groupDesks.map(d => d.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            // Center the label on the group
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const labelY = minY - 50; // Above the group with more space
            
            // Create a virtual group label desk
            const groupLabelDesk: Desk = {
              id: `group-label-${group.id}`,
              number: 0,
              x: centerX - 40,
              y: labelY,
              type: 'group-label',
              isGroupLabel: true,
              groupName: group.name,
              groupColor: group.color,
              groupId: group.id
            };
            
            return (
              <DeskElement
                key={groupLabelDesk.id}
                desk={groupLabelDesk}
                isSelected={selectedDeskIds.includes(groupLabelDesk.id)}
                onSelect={(deskId, ctrlKey) => {
                  // When group label is selected, select all desks in the group
                  if (!ctrlKey) {
                    onDeskSelect(group.deskIds[0], false);
                    group.deskIds.slice(1).forEach(id => {
                      onDeskSelect(id, true);
                    });
                  }
                }}
                onMove={(deskId, x, y) => {
                  // When group label moves, move all desks in the group
                  const deltaX = x - groupLabelDesk.x;
                  const deltaY = y - groupLabelDesk.y;
                  
                  groupDesks.forEach(desk => {
                    const newX = desk.x + deltaX;
                    const newY = desk.y + deltaY;
                    onMoveDesk(desk.id, newX, newY);
                  });
                }}
                onDrag={(deskId, x, y) => {
                  // During drag, move all group desks in real-time
                  const deltaX = x - groupLabelDesk.x;
                  const deltaY = y - groupLabelDesk.y;
                  
                  groupDesks.forEach(desk => {
                    const element = document.getElementById(`desk-${desk.id}`);
                    if (element) {
                      const newX = desk.x + deltaX;
                      const newY = desk.y + deltaY;
                      element.style.left = `${newX}px`;
                      element.style.top = `${newY}px`;
                    }
                  });
                }}
                onEdit={handleDeskAssignment}
              />
            );
          })}

          {/* Student Desks */}
          {desks.map(desk => (
            <DeskElement
              key={desk.id}
              desk={desk}
              isSelected={selectedDeskIds.includes(desk.id)}
              onSelect={(deskId, ctrlKey) => onDeskSelect(deskId, ctrlKey)}
              onMove={onMoveDesk}
              onDrag={desk.groupId ? handleDragDesk : undefined}
              onEdit={handleDeskAssignment}
            />
          ))}

          {/* Selection Rectangle */}
          {isSelecting && selectionStart && selectionEnd && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: Math.min(selectionStart.x, selectionEnd.x),
                top: Math.min(selectionStart.y, selectionEnd.y),
                width: Math.abs(selectionEnd.x - selectionStart.x),
                height: Math.abs(selectionEnd.y - selectionStart.y)
              }}
            />
          )}

          {/* Empty State */}
          {desks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Chair className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No desks added yet</p>
                <p className="text-sm">Click "Add Desk" to start building your classroom layout</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Desk Dialog */}
      <Dialog open={!!editingDesk} onOpenChange={(open) => !open && setEditingDesk(null)}>
        <DialogContent aria-describedby="edit-desk-description">
          <DialogHeader>
            <DialogTitle>Edit Desk</DialogTitle>
          </DialogHeader>
          <p id="edit-desk-description" className="sr-only">
            Change the number displayed on this desk
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="desk-number">Desk Number</Label>
              <Input
                id="desk-number"
                type="number"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                min="1"
                className="input-field"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setEditingDesk(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'hsl(214, 85%, 55%)', 
                  color: 'white', 
                  border: 'none' 
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={!!assigningDesk} onOpenChange={(open) => !open && setAssigningDesk(null)}>
        <DialogContent aria-describedby="assign-student-description">
          <DialogHeader>
            <DialogTitle>Assign to Desk</DialogTitle>
          </DialogHeader>
          <p id="assign-student-description" className="sr-only">
            Select a student to assign to this desk or lock it empty
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student-select">Select Student (optional)</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Choose a student or use Lock Empty..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unassignedStudents.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  All students are already assigned to desks.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setAssigningDesk(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (assigningDesk) {
                    onLockDeskEmpty(assigningDesk.id);
                    setAssigningDesk(null);
                    setSelectedStudentId('');
                  }
                }}
                variant="outline"
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'white', 
                  color: '#dc2626', 
                  border: '1px solid #dc2626' 
                }}
              >
                Lock Empty
              </Button>
              <Button 
                onClick={handleSaveAssignment}
                disabled={!selectedStudentId}
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'hsl(214, 85%, 55%)', 
                  color: 'white', 
                  border: 'none' 
                }}
              >
                Assign Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
