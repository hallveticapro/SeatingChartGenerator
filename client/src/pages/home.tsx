import { useState, useEffect } from 'react';
import { Student, Desk, Constraint, RoomLayout, FurnitureItem } from '@/types/seating';
import { StudentListManager } from '@/components/seating-chart/student-list-manager';
import { ConstraintsBuilder } from '@/components/seating-chart/constraints-builder';
import { DraggableCanvas } from '@/components/seating-chart/draggable-canvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateSeatingChart } from '@/lib/seating-algorithm';
import { exportToPDF } from '@/lib/pdf-export';
import { storage } from '@/lib/storage';
import { Presentation, Save, FileText, Sparkles, RotateCcw, Upload } from 'lucide-react';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [frontLabel, setFrontLabel] = useState<{ x: number; y: number; } | null>(null);
  const [selectedDeskIds, setSelectedDeskIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load saved layout on mount
  useEffect(() => {
    const savedLayouts = storage.getAllLayouts();
    if (savedLayouts.length > 0) {
      const latest = savedLayouts[savedLayouts.length - 1];
      setStudents(latest.students);
      setDesks(latest.desks);
      setConstraints(latest.constraints);
      setFurniture(latest.furniture || []);
      setFrontLabel(latest.frontLabel || { x: 400, y: 80 });
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (students.length > 0 || desks.length > 0 || constraints.length > 0 || furniture.length > 0) {
        const layout: RoomLayout = {
          id: 'current',
          name: 'Current Layout',
          students,
          desks,
          constraints,
          furniture,
          frontLabel,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        storage.saveLayout(layout);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [students, desks, constraints, furniture, frontLabel]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddStudent = (name: string) => {
    // Check for duplicate names and add suffix if needed
    const existingNames = students.map(s => s.name);
    let finalName = name;
    let counter = 2;
    
    while (existingNames.includes(finalName)) {
      finalName = `${name} (${counter})`;
      counter++;
    }

    const newStudent: Student = {
      id: generateId(),
      name: finalName
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    
    // Remove student from desk assignments
    setDesks(prev => prev.map(desk => 
      desk.assignedStudent?.id === studentId 
        ? { ...desk, assignedStudent: undefined }
        : desk
    ));
    
    // Remove constraints involving this student
    setConstraints(prev => prev.filter(c => !c.studentIds.includes(studentId)));
  };

  const handleBulkImport = (names: string[]) => {
    const existingNames = students.map(s => s.name);
    const newStudents: Student[] = [];

    names.forEach(name => {
      let finalName = name;
      let counter = 2;
      
      while ([...existingNames, ...newStudents.map(s => s.name)].includes(finalName)) {
        finalName = `${name} (${counter})`;
        counter++;
      }

      newStudents.push({
        id: generateId(),
        name: finalName
      });
    });

    setStudents(prev => [...newStudents, ...prev]);
    toast({
      title: "Students imported",
      description: `Added ${newStudents.length} students to the list.`
    });
  };

  const handleAddDesk = (type: 'rectangular' | 'round') => {
    const newDesk: Desk = {
      id: generateId(),
      number: desks.length + 1,
      x: 160 + (desks.length % 3) * 160,
      y: 160 + Math.floor(desks.length / 3) * 100,
      type
    };
    setDesks(prev => [...prev, newDesk]);
  };

  const handleDeleteDesk = (deskId: string) => {
    setDesks(prev => prev.filter(d => d.id !== deskId));
    setSelectedDeskIds(prev => prev.filter(id => id !== deskId));
    
    // Remove constraints involving this desk
    setConstraints(prev => prev.filter(c => c.deskId !== deskId));
    
    // Renumber remaining desks
    setDesks(prev => prev.map((desk, index) => ({ ...desk, number: index + 1 })));
  };

  const handleMoveDesk = (deskId: string, x: number, y: number) => {
    setDesks(prev => prev.map(desk => 
      desk.id === deskId ? { ...desk, x, y } : desk
    ));
  };

  const handleEditDesk = (deskId: string, number: number) => {
    setDesks(prev => prev.map(desk => 
      desk.id === deskId ? { ...desk, number } : desk
    ));
  };

  const handleArrangeDesks = (newDesks: Omit<Desk, 'id' | 'number'>[]) => {
    // Clear existing seating assignments
    setDesks([]);
    
    // Create new desks with proper IDs and numbers
    const arrangedDesks: Desk[] = newDesks.map((desk, index) => ({
      id: generateId(),
      number: index + 1,
      x: desk.x,
      y: desk.y,
      type: desk.type
    }));
    
    setDesks(arrangedDesks);
    
    toast({
      title: "Desks arranged",
      description: `Created ${arrangedDesks.length} desks in the selected layout.`
    });
  };

  const handleAddConstraint = (constraint: Omit<Constraint, 'id'>) => {
    const newConstraint: Constraint = {
      ...constraint,
      id: generateId()
    };
    setConstraints(prev => [...prev, newConstraint]);
    toast({
      title: "Constraint added",
      description: "New seating constraint has been added."
    });
  };

  const handleRemoveConstraint = (constraintId: string) => {
    setConstraints(prev => prev.filter(c => c.id !== constraintId));
  };

  const handleGenerateSeatingChart = async () => {
    if (students.length === 0) {
      toast({
        title: "No students",
        description: "Please add students before generating a seating chart.",
        variant: "destructive"
      });
      return;
    }

    if (desks.length === 0) {
      toast({
        title: "No desks",
        description: "Please add desks before generating a seating chart.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = generateSeatingChart(desks, students, constraints);
      
      if (result.success) {
        // Update desk assignments
        setDesks(prev => prev.map(desk => {
          const assignedStudentId = result.assignments[desk.id];
          const assignedStudent = assignedStudentId 
            ? students.find(s => s.id === assignedStudentId)
            : undefined;
          
          return { ...desk, assignedStudent };
        }));

        toast({
          title: "Seating chart generated!",
          description: "Students have been successfully assigned to desks."
        });
      } else {
        toast({
          title: "Generation failed",
          description: result.errorMessage || "Unable to generate seating chart.",
          variant: "destructive"
        });

        if (result.conflictingConstraints) {
          console.warn('Conflicting constraints:', result.conflictingConstraints);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the seating chart.",
        variant: "destructive"
      });
      console.error('Seating generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLayout = () => {
    const layout: RoomLayout = {
      id: generateId(),
      name: `Layout ${new Date().toLocaleDateString()}`,
      students,
      desks,
      constraints,
      furniture,
      frontLabel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    storage.saveLayout(layout);
    toast({
      title: "Layout saved",
      description: "Your classroom layout has been saved locally."
    });
  };

  const handleExportPDF = async () => {
    if (desks.length === 0) {
      toast({
        title: "No desks to export",
        description: "Please add desks before exporting to PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      await exportToPDF('room-canvas', 'seating-chart.pdf');
      toast({
        title: "PDF exported",
        description: "Your seating chart has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetAll = () => {
    const confirmReset = confirm(
      "Are you sure you want to reset everything? This will clear all students, desks, constraints, and furniture. This action cannot be undone."
    );
    
    if (confirmReset) {
      setStudents([]);
      setDesks([]);
      setConstraints([]);
      setFurniture([]);
      setFrontLabel(null);
      
      // Clear from localStorage
      storage.deleteLayout('current');
      
      toast({
        title: "Everything reset",
        description: "All data has been cleared successfully."
      });
    }
  };

  const handleAddFurniture = (type: string, x: number, y: number) => {
    const furnitureNames: { [key: string]: { name: string; width: number; height: number } } = {
      'teacher-desk': { name: 'Teacher Desk', width: 160, height: 80 },
      door: { name: 'Door', width: 20, height: 100 },
      'front-label': { name: 'Front Label', width: 160, height: 30 },
      bookshelf: { name: 'Bookshelf', width: 40, height: 120 },
      cabinet: { name: 'Cabinet', width: 80, height: 60 },
      counter: { name: 'Counter', width: 160, height: 40 },
      closet: { name: 'Closet', width: 80, height: 80 },
      refrigerator: { name: 'Refrigerator', width: 60, height: 60 },
      printer: { name: 'Printer Station', width: 80, height: 60 }
    };

    const furnitureInfo = furnitureNames[type] || { name: 'Item', width: 80, height: 60 };
    
    const newFurniture: FurnitureItem = {
      id: generateId(),
      type,
      x,
      y,
      width: furnitureInfo.width,
      height: furnitureInfo.height,
      name: furnitureInfo.name,
      rotation: 0
    };
    
    setFurniture(prev => [...prev, newFurniture]);
    
    toast({
      title: "Furniture added",
      description: `${furnitureInfo.name} has been added to the classroom.`
    });
  };

  const handleMoveFurniture = (furnitureId: string, x: number, y: number) => {
    setFurniture(prev => prev.map(item => 
      item.id === furnitureId ? { ...item, x, y } : item
    ));
  };

  const handleDeleteFurniture = (furnitureId: string) => {
    setFurniture(prev => prev.filter(item => item.id !== furnitureId));
    toast({
      title: "Furniture removed",
      description: "The furniture item has been removed."
    });
  };

  const handleRotateFurniture = (furnitureId: string) => {
    setFurniture(prev => prev.map(item => 
      item.id === furnitureId 
        ? { ...item, rotation: (item.rotation + 90) % 360 }
        : item
    ));
  };

  const handleMoveFrontLabel = (x: number, y: number) => {
    setFrontLabel({ x, y });
  };

  const handleDeskSelect = (deskId: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSelectedDeskIds(prev => 
        prev.includes(deskId) 
          ? prev.filter(id => id !== deskId)
          : [...prev, deskId]
      );
    } else {
      setSelectedDeskIds([deskId]);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSelecting(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
      
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedDeskIds([]);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;
      setSelectionEnd({ x, y });

      // Find desks within selection rectangle
      const minX = Math.min(selectionStart.x, x);
      const maxX = Math.max(selectionStart.x, x);
      const minY = Math.min(selectionStart.y, y);
      const maxY = Math.max(selectionStart.y, y);

      const selectedDesks = desks.filter(desk => {
        const deskCenterX = desk.x + 60; // Half desk width
        const deskCenterY = desk.y + 30; // Half desk height
        return deskCenterX >= minX && deskCenterX <= maxX && 
               deskCenterY >= minY && deskCenterY <= maxY;
      });

      if (e.ctrlKey || e.metaKey) {
        setSelectedDeskIds(prev => {
          const newIds = selectedDesks.map(d => d.id);
          const combined = [...prev, ...newIds];
          return Array.from(new Set(combined));
        });
      } else {
        setSelectedDeskIds(selectedDesks.map(d => d.id));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleSaveLayoutAsJSON = () => {
    const layout: RoomLayout = {
      id: generateId(),
      name: `Classroom Layout ${new Date().toLocaleDateString()}`,
      students,
      desks,
      constraints,
      furniture,
      frontLabel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom-layout-${timestamp[0]}-${timestamp[1].split('.')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Layout saved",
      description: "Your classroom layout has been downloaded as a JSON file."
    });
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout: RoomLayout = JSON.parse(e.target?.result as string);
        
        setStudents(layout.students || []);
        setDesks(layout.desks || []);
        setConstraints(layout.constraints || []);
        setFurniture(layout.furniture || []);
        setFrontLabel(layout.frontLabel || null);

        toast({
          title: "Layout imported",
          description: "Your classroom layout has been successfully imported."
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import layout. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const assignedCount = desks.filter(d => d.assignedStudent).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 panel-shadow">
        <div className="max-w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Presentation className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Classroom Seating Chart Builder</h1>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button 
                onClick={handleResetAll}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'white', 
                  color: '#dc2626', 
                  border: '1px solid #dc2626' 
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="mobile-hidden">Reset All</span>
                <span className="sm:hidden">Reset</span>
              </Button>
              <Button 
                onClick={handleSaveLayoutAsJSON}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                style={{ opacity: 1, visibility: 'visible', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="mobile-hidden">Save Layout</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <label className="flex-1 sm:flex-none">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLayout}
                  className="hidden"
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  style={{ opacity: 1, visibility: 'visible', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="mobile-hidden">Import Layout</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </label>
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting || desks.length === 0}
                size="sm"
                className="flex-1 sm:flex-none"
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'hsl(214, 85%, 55%)', 
                  color: 'white', 
                  border: 'none' 
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="mobile-hidden">{isExporting ? 'Exporting...' : 'Save as PDF'}</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] sm:h-[calc(100vh-96px)]">
        {/* Left Panel */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 panel-shadow overflow-y-auto max-h-96 lg:max-h-none">
          <div className="p-6 space-y-6">
            <StudentListManager
              students={students}
              onAddStudent={handleAddStudent}
              onRemoveStudent={handleRemoveStudent}
              onBulkImport={handleBulkImport}
            />

            <ConstraintsBuilder
              students={students}
              desks={desks}
              constraints={constraints}
              onAddConstraint={handleAddConstraint}
              onRemoveConstraint={handleRemoveConstraint}
            />

            {/* Generate Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                onClick={handleGenerateSeatingChart}
                disabled={isGenerating || students.length === 0 || desks.length === 0}
                className="w-full font-semibold py-3"
                style={{ 
                  opacity: 1, 
                  visibility: 'visible', 
                  backgroundColor: 'hsl(214, 85%, 55%)', 
                  color: 'white', 
                  border: 'none' 
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Seating Chart'}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This will automatically assign students to desks based on your constraints
              </p>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <DraggableCanvas
          desks={desks}
          furniture={furniture}
          frontLabel={frontLabel}
          selectedDeskIds={selectedDeskIds}
          isSelecting={isSelecting}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          onAddDesk={handleAddDesk}
          onDeleteDesk={handleDeleteDesk}
          onMoveDesk={handleMoveDesk}
          onEditDesk={handleEditDesk}
          onArrangeDesks={handleArrangeDesks}
          onAddFurniture={handleAddFurniture}
          onMoveFurniture={handleMoveFurniture}
          onDeleteFurniture={handleDeleteFurniture}
          onRotateFurniture={handleRotateFurniture}
          onMoveFrontLabel={handleMoveFrontLabel}
          onDeskSelect={handleDeskSelect}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasMouseMove={handleCanvasMouseMove}
          onCanvasMouseUp={handleCanvasMouseUp}
          assignedCount={assignedCount}
        />
      </div>
    </div>
  );
}
