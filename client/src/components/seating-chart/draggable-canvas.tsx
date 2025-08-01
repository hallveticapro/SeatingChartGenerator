import { useEffect, useRef, useState } from 'react';
import { Desk, DeskGroup } from '@/types/seating';
import { DeskElement } from './desk-element';
import { DeskArrangements } from './desk-arrangements';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Users, Group, Ungroup, Armchair as Chair } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  assignedCount
}: DraggableCanvasProps) {
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [editNumber, setEditNumber] = useState('');
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
    setEditingDesk(desk);
    setEditNumber(desk.number.toString());
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








          {/* Group Labels */}
          {deskGroups.map(group => {
            const groupDesks = desks.filter(desk => desk.groupId === group.id);
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
            const labelY = minY - 35; // Above the group
            
            return (
              <div
                key={group.id}
                id={`group-label-${group.id}`}
                className="absolute text-sm font-medium px-3 py-1 rounded-full shadow-lg cursor-move hover:shadow-xl transition-shadow"
                style={{
                  left: centerX - 40, // Center the label width
                  top: labelY,
                  backgroundColor: group.color,
                  color: 'white',
                  zIndex: 1000
                }}
                ref={(el) => {
                  if (el && window.interact) {
                    window.interact(el)
                      .draggable({
                        inertia: false,
                        listeners: {
                          start(event: any) {
                            const target = event.target;
                            target.style.zIndex = '1001';
                            target.style.opacity = '0.8';
                            target.style.transform = 'scale(1.05)';
                            target.style.cursor = 'grabbing';
                            target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                            
                            // Store initial label position
                            target.dataset.startX = target.style.left;
                            target.dataset.startY = target.style.top;
                            target.dataset.totalDx = '0';
                            target.dataset.totalDy = '0';
                            
                            // Store initial positions and disable individual desk dragging
                            groupDesks.forEach(desk => {
                              const deskElement = document.getElementById(`desk-${desk.id}`);
                              if (deskElement) {
                                // Store initial position from current style
                                const currentLeft = deskElement.style.left || `${desk.x}px`;
                                const currentTop = deskElement.style.top || `${desk.y}px`;
                                deskElement.dataset.initialX = currentLeft;
                                deskElement.dataset.initialY = currentTop;
                                
                                // Disable desk dragging temporarily
                                if (window.interact && window.interact.isSet(deskElement)) {
                                  window.interact(deskElement).draggable(false);
                                }
                                
                                // Visual feedback
                                deskElement.style.zIndex = '1001';
                                deskElement.style.transform = 'scale(1.05) rotate(2deg)';
                                deskElement.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                                deskElement.style.opacity = '0.9';
                                deskElement.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                              }
                            });
                          },
                          move(event: any) {
                            const target = event.target;
                            const currentX = parseFloat(target.style.left) || 0;
                            const currentY = parseFloat(target.style.top) || 0;
                            const newX = currentX + event.dx;
                            const newY = currentY + event.dy;
                            
                            target.style.left = `${newX}px`;
                            target.style.top = `${newY}px`;
                            
                            // Accumulate total movement
                            const totalDx = parseFloat(target.dataset.totalDx || '0') + event.dx;
                            const totalDy = parseFloat(target.dataset.totalDy || '0') + event.dy;
                            target.dataset.totalDx = totalDx.toString();
                            target.dataset.totalDy = totalDy.toString();
                            
                            // Move all desks in the group
                            groupDesks.forEach(desk => {
                              const deskElement = document.getElementById(`desk-${desk.id}`);
                              if (deskElement) {
                                // Get initial position (remove 'px' suffix)
                                const initialX = parseFloat(deskElement.dataset.initialX || '0');
                                const initialY = parseFloat(deskElement.dataset.initialY || '0');
                                
                                const deskNewX = initialX + totalDx;
                                const deskNewY = initialY + totalDy;
                                
                                deskElement.style.left = `${deskNewX}px`;
                                deskElement.style.top = `${deskNewY}px`;
                              }
                            });
                          },
                          end(event: any) {
                            const target = event.target;
                            target.style.zIndex = '1000';
                            target.style.opacity = '';
                            target.style.transform = '';
                            target.style.cursor = 'move';
                            target.style.boxShadow = '';
                            
                            // "Drop" all desks and re-enable dragging
                            groupDesks.forEach(desk => {
                              const deskElement = document.getElementById(`desk-${desk.id}`);
                              if (deskElement) {
                                // Re-enable desk dragging
                                if (window.interact && window.interact.isSet(deskElement)) {
                                  window.interact(deskElement).draggable(true);
                                }
                                
                                // Reset visual effects
                                deskElement.style.zIndex = '';
                                deskElement.style.transform = '';
                                deskElement.style.boxShadow = '';
                                deskElement.style.opacity = '';
                                deskElement.style.transition = '';
                                
                                // Snap to grid
                                const currentX = parseFloat(deskElement.style.left) || desk.x;
                                const currentY = parseFloat(deskElement.style.top) || desk.y;
                                const snappedX = Math.round(currentX / 20) * 20;
                                const snappedY = Math.round(currentY / 20) * 20;
                                
                                deskElement.style.left = `${snappedX}px`;
                                deskElement.style.top = `${snappedY}px`;
                                
                                // Clean up data attributes
                                delete deskElement.dataset.initialX;
                                delete deskElement.dataset.initialY;
                                
                                // Update desk data
                                onMoveDesk(desk.id, snappedX, snappedY);
                              }
                            });
                          }
                        }
                      })
                      .on('tap', function(event: any) {
                        // Prevent drag when clicking for selection
                        event.preventDefault();
                        event.stopPropagation();
                        
                        // Select all desks in the group
                        onDeskSelect(group.deskIds[0], false);
                        group.deskIds.slice(1).forEach(deskId => {
                          onDeskSelect(deskId, true);
                        });
                      });
                  }
                }}
                title="Drag to move entire group, click to select all desks"
              >
                {group.name}
              </div>
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
              onEdit={handleDeskEdit}
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
    </div>
  );
}
