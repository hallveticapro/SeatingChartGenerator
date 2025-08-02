import { Button } from "@/components/ui/button";
import { Desk } from "@/types/seating";
import { Grid3x3, Rows3, Columns3, Users, SquareStack } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DeskArrangementsProps {
  onArrangeDesks: (desks: Omit<Desk, "id" | "number">[]) => void;
}

export function DeskArrangements({ onArrangeDesks }: DeskArrangementsProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createRowsLayout = (rows: number, desksPerRow: number) => {
    const desks: Omit<Desk, "id" | "number">[] = [];
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
          type: "rectangular",
        });
      }
    }
    return desks;
  };

  const createGroupLayout = (groupSize: number, numGroups: number) => {
    const desks: Omit<Desk, "id" | "number">[] = [];
    const deskWidth = 120;
    const spacingX = 130; // Reduced from 140
    const spacingY = 80; // Reduced from 100
    const groupSpacingX = 280; // Reduced from 300
    const groupSpacingY = 200; // Reduced from 250
    const startX = 200;
    const startY = 200;

    for (let group = 0; group < numGroups; group++) {
      const groupX = startX + (group % 3) * groupSpacingX;
      const groupY = startY + Math.floor(group / 3) * groupSpacingY;

      if (groupSize === 2) {
        // Side by side - closer together
        desks.push(
          { x: groupX, y: groupY, type: "rectangular" },
          { x: groupX + 125, y: groupY, type: "rectangular" } // Closer spacing
        );
      } else if (groupSize === 4) {
        // 2x2 square - tighter formation
        desks.push(
          { x: groupX, y: groupY, type: "rectangular" },
          { x: groupX + 125, y: groupY, type: "rectangular" },
          { x: groupX, y: groupY + 70, type: "rectangular" },
          { x: groupX + 125, y: groupY + 70, type: "rectangular" }
        );
      } else if (groupSize === 6) {
        // 3x2 rectangle formation
        desks.push(
          { x: groupX, y: groupY, type: "rectangular" },
          { x: groupX + 125, y: groupY, type: "rectangular" },
          { x: groupX + 250, y: groupY, type: "rectangular" },
          { x: groupX, y: groupY + 70, type: "rectangular" },
          { x: groupX + 125, y: groupY + 70, type: "rectangular" },
          { x: groupX + 250, y: groupY + 70, type: "rectangular" }
        );
      }
    }
    return desks;
  };

  const createSpecialGroupLayout = () => {
    const desks: Omit<Desk, "id" | "number">[] = [];
    const spacingX = 125; // Same spacing as 4 groups of 4 layout
    const spacingY = 70; // Same spacing as 4 groups of 4 layout
    const groupSpacingX = 280; // Space between groups
    const groupSpacingY = 200; // More space between rows of groups
    const startX = 160;
    const startY = 160;

    // Front row: 3 groups of 4
    for (let group = 0; group < 3; group++) {
      const groupX = startX + group * groupSpacingX;
      const groupY = startY;

      // 2x2 square formation
      desks.push(
        { x: groupX, y: groupY, type: "rectangular" },
        { x: groupX + spacingX, y: groupY, type: "rectangular" },
        { x: groupX, y: groupY + spacingY, type: "rectangular" },
        { x: groupX + spacingX, y: groupY + spacingY, type: "rectangular" }
      );
    }

    // Back row: 2 groups of 4 (centered)
    for (let group = 0; group < 2; group++) {
      const groupX = startX + 150 + group * groupSpacingX; // Offset to center better
      const groupY = startY + groupSpacingY;

      // 2x2 square formation
      desks.push(
        { x: groupX, y: groupY, type: "rectangular" },
        { x: groupX + spacingX, y: groupY, type: "rectangular" },
        { x: groupX, y: groupY + spacingY, type: "rectangular" },
        { x: groupX + spacingX, y: groupY + spacingY, type: "rectangular" }
      );
    }

    return desks;
  };

  const arrangements = [
    {
      name: "3x5 Rows",
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(3, 5),
    },
    {
      name: "4x6 Rows",
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(4, 6),
    },
    {
      name: "5x6 Rows",
      icon: <Rows3 className="w-4 h-4" />,
      action: () => createRowsLayout(5, 6),
    },
    {
      name: "6 Pairs",
      icon: <Users className="w-4 h-4" />,
      action: () => createGroupLayout(2, 6),
    },
    {
      name: "4 Groups of 4",
      icon: <Grid3x3 className="w-4 h-4" />,
      action: () => createGroupLayout(4, 4),
    },
    {
      name: "5 Groups of 4 (3+2)",
      icon: <Grid3x3 className="w-4 h-4" />,
      action: () => createSpecialGroupLayout(),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          style={{ opacity: 1, visibility: "visible" }}
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
