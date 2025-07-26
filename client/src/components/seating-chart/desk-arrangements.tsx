import { Button } from '@/components/ui/button';
import { Desk } from '@/types/seating';
import { Grid3x3, Rows3, Columns3, Users, SquareStack } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface DeskArrangementsProps {
  onArrangeDesks: (desks: Omit<Desk, 'id' | 'number'>[]) => void;
}

export function DeskArrangements({ onArrangeDesks }: DeskArrangementsProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createRowsLayout = (rows: number, desksPerRow: number) => {
    const desks: Omit<Desk, 'id' | 'number'>[] = [];
    const deskWidth = 120;
    const deskHeight = 64;
    const spacingX = 140;
    const spacingY = 100;
    const startX = 200;
    const startY = 200;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < desksPerRow; col++) {
        desks.push({
          x: startX + col * spacingX,
          y: startY + row * spacingY,
          type: 'rectangular'
        });
      }
    }
    return desks;
  };

  const createGroupLayout = (groupSize: number, numGroups: number) => {
    const desks: Omit<Desk, 'id' | 'number'>[] = [];
    const deskWidth = 120;
    const spacingX = 140;
    const spacingY = 100;
    const groupSpacingX = 300;
    const groupSpacingY = 250;
    const startX = 200;
    const startY = 200;

    for (let group = 0; group < numGroups; group++) {
      const groupX = startX + (group % 3) * groupSpacingX;
      const groupY = startY + Math.floor(group / 3) * groupSpacingY;

      if (groupSize === 2) {
        // Side by side
        desks.push(
          { x: groupX, y: groupY, type: 'rectangular' },
          { x: groupX + spacingX, y: groupY, type: 'rectangular' }
        );
      } else if (groupSize === 4) {
        // 2x2 square
        desks.push(
          { x: groupX, y: groupY, type: 'rectangular' },
          { x: groupX + spacingX, y: groupY, type: 'rectangular' },
          { x: groupX, y: groupY + spacingY, type: 'rectangular' },
          { x: groupX + spacingX, y: groupY + spacingY, type: 'rectangular' }
        );
      } else if (groupSize === 6) {
        // Round table with 6 seats
        const centerX = groupX + spacingX / 2;
        const centerY = groupY + spacingY / 2;
        const radius = 80;
        
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          desks.push({
            x: centerX + Math.cos(angle) * radius - deskWidth / 2,
            y: centerY + Math.sin(angle) * radius - 32,
            type: 'rectangular'
          });
        }
      }
    }
    return desks;
  };

  const arrangements = [
    {
      name: "3x5 Rows",
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(3, 5)
    },
    {
      name: "4x6 Rows", 
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(4, 6)
    },
    {
      name: "5x6 Rows",
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(5, 6)
    },
    {
      name: "6 Pairs",
      icon: <Users className="w-4 h-4" />,
      action: () => createGroupLayout(2, 6)
    },
    {
      name: "4 Groups of 4",
      icon: <Grid3x3 className="w-4 h-4" />,
      action: () => createGroupLayout(4, 4)
    },
    {
      name: "3 Groups of 6",
      icon: <SquareStack className="w-4 h-4" />,
      action: () => createGroupLayout(6, 3)
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          style={{ opacity: 1, visibility: 'visible' }}
        >
          <Grid3x3 className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="mobile-hidden">Quick Layouts</span>
          <span className="sm:hidden">Layouts</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Desk Arrangements</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {arrangements.map((arrangement, index) => (
          <DropdownMenuItem 
            key={index}
            onClick={() => onArrangeDesks(arrangement.action())}
            className="flex items-center space-x-2 cursor-pointer"
          >
            {arrangement.icon}
            <span>{arrangement.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}