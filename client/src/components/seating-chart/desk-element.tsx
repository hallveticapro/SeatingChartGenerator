import { useEffect, useRef } from 'react';
import { Desk } from '@/types/seating';
import { cn } from '@/lib/utils';

interface DeskElementProps {
  desk: Desk;
  isSelected: boolean;
  onSelect: (deskId: string) => void;
  onMove: (deskId: string, x: number, y: number) => void;
  onEdit: (deskId: string) => void;
}

export function DeskElement({ desk, isSelected, onSelect, onMove, onEdit }: DeskElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !window.interact) return;

    const interactable = window.interact(element)
      .draggable({
        listeners: {
          start(event: any) {
            event.target.style.zIndex = '1000';
            event.target.style.opacity = '0.8';
          },
          move(event: any) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // Snap to grid (20px)
            const snappedX = Math.round(x / 20) * 20;
            const snappedY = Math.round(y / 20) * 20;

            target.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
            target.setAttribute('data-x', snappedX);
            target.setAttribute('data-y', snappedY);
          },
          end(event: any) {
            event.target.style.zIndex = '';
            event.target.style.opacity = '';
            
            const x = parseFloat(event.target.getAttribute('data-x')) || 0;
            const y = parseFloat(event.target.getAttribute('data-y')) || 0;
            onMove(desk.id, desk.x + x, desk.y + y);
          }
        }
      })
      .on('tap', function(event: any) {
        onSelect(desk.id);
      });

    // Set initial position
    element.style.transform = `translate(${desk.x}px, ${desk.y}px)`;
    element.setAttribute('data-x', '0');
    element.setAttribute('data-y', '0');

    return () => {
      if (interactable) {
        interactable.unset();
      }
    };
  }, [desk.id, desk.x, desk.y, onMove, onSelect]);

  const handleDoubleClick = () => {
    onEdit(desk.id);
  };

  const baseClasses = "desk-element absolute bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center cursor-move";
  const shapeClasses = desk.type === 'round' 
    ? "rounded-full w-30 h-30" 
    : "rounded-lg w-30 h-16";
  
  const selectedClasses = isSelected ? "desk-selected" : "";

  return (
    <div
      ref={elementRef}
      className={cn(baseClasses, shapeClasses, selectedClasses)}
      style={{
        left: 0,
        top: 0,
        width: desk.type === 'round' ? '120px' : '120px',
        height: desk.type === 'round' ? '120px' : '64px'
      }}
      data-desk-id={desk.id}
      onDoubleClick={handleDoubleClick}
    >
      <div className="text-center pointer-events-none">
        <div className="text-xs font-bold text-gray-600 mb-1">
          {desk.type === 'round' ? `Table ${desk.number}` : `Desk ${desk.number}`}
        </div>
        <div className={cn(
          "text-xs font-medium",
          desk.assignedStudent ? "text-blue-600" : "text-gray-400"
        )}>
          {desk.assignedStudent ? 
            (desk.assignedStudent.name.length > 10 ? 
              `${desk.assignedStudent.name.substring(0, 10)}...` : 
              desk.assignedStudent.name
            ) : 
            'Unassigned'
          }
        </div>
      </div>
    </div>
  );
}
