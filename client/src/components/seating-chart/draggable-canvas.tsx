import { useEffect, useRef, useState } from 'react';
import { Desk } from '@/types/seating';
import { DeskElement } from './desk-element';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Circle, Users, Armchair as Chair } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DraggableCanvasProps {
  desks: Desk[];
  onAddDesk: (type: 'rectangular' | 'round') => void;
  onDeleteDesk: (deskId: string) => void;
  onMoveDesk: (deskId: string, x: number, y: number) => void;
  onEditDesk: (deskId: string, number: number) => void;
  assignedCount: number;
}

export function DraggableCanvas({
  desks,
  onAddDesk,
  onDeleteDesk,
  onMoveDesk,
  onEditDesk,
  assignedCount
}: DraggableCanvasProps) {
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedDeskId) {
        onDeleteDesk(selectedDeskId);
        setSelectedDeskId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedDeskId, onDeleteDesk]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      setSelectedDeskId(null);
    }
  };

  const handleDeskEdit = (deskId: string) => {
    const desk = desks.find(d => d.id === deskId);
    if (desk) {
      setEditingDesk(desk);
      setEditNumber(desk.number.toString());
    }
  };

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
      <div className="bg-white border-b border-gray-200 p-4 panel-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => onAddDesk('rectangular')} 
              className="button-primary text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Desk
            </Button>
            <Button 
              onClick={() => selectedDeskId && onDeleteDesk(selectedDeskId)} 
              variant="destructive"
              size="sm"
              disabled={!selectedDeskId}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <Button 
              onClick={() => onAddDesk('round')} 
              variant="secondary"
              size="sm"
            >
              <Circle className="w-4 h-4 mr-2" />
              Round Table
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Chair className="w-4 h-4" />
              <span>{desks.length} desks</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
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
          className="grid-background min-h-full min-w-full relative p-8 cursor-default"
          style={{ minWidth: '1200px', minHeight: '800px' }}
          onClick={handleCanvasClick}
        >
          {/* Room Elements */}
          {/* Teacher Desk */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 w-40 h-20 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <Chair className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                <div className="text-xs font-medium text-amber-800">Teacher Desk</div>
              </div>
            </div>
          </div>

          {/* Front Label */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-100 border border-green-300 rounded px-4 py-1">
              <span className="text-xs font-medium text-green-800">FRONT OF CLASSROOM</span>
            </div>
          </div>

          {/* Door */}
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
            <div className="bg-white border-2 border-gray-800 w-4 h-24 relative">
              {/* Door swing arc */}
              <div className="absolute -left-4 top-0 w-4 h-4 border-l-2 border-t-2 border-gray-400 rounded-tl-full opacity-50"></div>
              <div className="absolute -top-2 -right-8 text-xs font-medium text-gray-700 whitespace-nowrap">Door</div>
            </div>
          </div>

          {/* Student Desks */}
          {desks.map(desk => (
            <DeskElement
              key={desk.id}
              desk={desk}
              isSelected={selectedDeskId === desk.id}
              onSelect={setSelectedDeskId}
              onMove={onMoveDesk}
              onEdit={handleDeskEdit}
            />
          ))}

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
                className="button-primary"
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
