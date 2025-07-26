import { Button } from '@/components/ui/button';
import { Archive, BookOpen, Refrigerator, Armchair, FileText, Printer, DoorOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface ClassroomFurnitureProps {
  onAddFurniture: (type: string, x: number, y: number) => void;
}

export function ClassroomFurniture({ onAddFurniture }: ClassroomFurnitureProps) {
  const furnitureItems = [
    {
      name: "Teacher Desk",
      icon: <Armchair className="w-4 h-4" />,
      type: "teacher-desk",
      width: 160,
      height: 80
    },
    {
      name: "Door",
      icon: <DoorOpen className="w-4 h-4" />,
      type: "door",
      width: 20,
      height: 100
    },
    {
      name: "Front Label",
      icon: <FileText className="w-4 h-4" />,
      type: "front-label",
      width: 160,
      height: 30
    },
    {
      name: "Bookshelf",
      icon: <BookOpen className="w-4 h-4" />,
      type: "bookshelf",
      width: 40,
      height: 120
    },
    {
      name: "Cabinet",
      icon: <Archive className="w-4 h-4" />,
      type: "cabinet",
      width: 80,
      height: 60
    },
    {
      name: "Counter",
      icon: <FileText className="w-4 h-4" />,
      type: "counter",
      width: 160,
      height: 40
    },
    {
      name: "Closet",
      icon: <Armchair className="w-4 h-4" />,
      type: "closet",
      width: 80,
      height: 80
    },
    {
      name: "Refrigerator",
      icon: <Refrigerator className="w-4 h-4" />,
      type: "refrigerator",
      width: 60,
      height: 60
    },
    {
      name: "Printer Station",
      icon: <Printer className="w-4 h-4" />,
      type: "printer",
      width: 80,
      height: 60
    }
  ];

  const handleAddFurniture = (item: typeof furnitureItems[0]) => {
    // Add at a default position - user can drag to desired location
    onAddFurniture(item.type, 400, 400);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          style={{ opacity: 1, visibility: 'visible' }}
        >
          <Archive className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="mobile-hidden">Add Furniture</span>
          <span className="sm:hidden">Furniture</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Classroom Furniture</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {furnitureItems.map((item, index) => (
          <DropdownMenuItem 
            key={index}
            onClick={() => handleAddFurniture(item)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            {item.icon}
            <span>{item.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}