import { useEffect, useRef } from 'react';
import { Desk } from '@/types/seating';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    interact: any;
  }
}

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
        inertia: false,
        modifiers: [
          window.interact.modifiers.snap({
            targets: [
              window.interact.snappers.grid({ x: 20, y: 20 })
            ],
            range: Infinity,
            relativePoints: [{ x: 0, y: 0 }]
          })
        ],
        listeners: {
          start(event: any) {
            event.target.style.zIndex = '1000';
            event.target.style.opacity = '0.8';
            event.target.style.transform += ' scale(1.05)';
          },
          move(event: any) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
            target.setAttribute('data-x', x.toString());
            target.setAttribute('data-y', y.toString());
          },
          end(event: any) {
            const target = event.target;
            target.style.zIndex = '';
            target.style.opacity = '';
            target.style.transform = target.style.transform.replace(' scale(1.05)', '');
            
            const x = parseFloat(target.getAttribute('data-x')) || 0;
            const y = parseFloat(target.getAttribute('data-y')) || 0;
            
            // Calculate new absolute position
            const newX = desk.x + x;
            const newY = desk.y + y;
            
            // Reset relative position
            target.setAttribute('data-x', '0');
            target.setAttribute('data-y', '0');
            target.style.transform = `translate(${newX}px, ${newY}px)`;
            
            onMove(desk.id, newX, newY);
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
      <div className="text-center pointer-events-none px-2 py-1 w-full h-full flex flex-col justify-center">
        <div className="text-xs font-bold text-gray-600 mb-1">
          {desk.type === 'round' ? `Table ${desk.number}` : `Desk ${desk.number}`}
        </div>
        <div 
          className={cn(
            "text-xs font-medium leading-tight overflow-hidden",
            desk.assignedStudent ? "text-blue-600" : "text-gray-400"
          )}
          style={{
            fontSize: desk.assignedStudent?.name && desk.assignedStudent.name.length > 12 ? '10px' : '12px',
            lineHeight: '1.2'
          }}
          title={desk.assignedStudent?.name || 'Unassigned'}
        >
          {desk.assignedStudent ? 
            (desk.assignedStudent.name.length > 15 ? 
              `${desk.assignedStudent.name.substring(0, 15)}...` : 
              desk.assignedStudent.name
            ) : 
            'Unassigned'
          }
        </div>
      </div>
    </div>
  );
}
