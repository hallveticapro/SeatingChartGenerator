import { useState, useEffect } from 'react';
import { Student, Desk, Constraint, RoomLayout } from '@/types/seating';
import { StudentListManager } from '@/components/seating-chart/student-list-manager';
import { ConstraintsBuilder } from '@/components/seating-chart/constraints-builder';
import { DraggableCanvas } from '@/components/seating-chart/draggable-canvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateSeatingChart } from '@/lib/seating-algorithm';
import { exportToPDF } from '@/lib/pdf-export';
import { storage } from '@/lib/storage';
import { Presentation, Save, FileText, Sparkles } from 'lucide-react';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
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
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (students.length > 0 || desks.length > 0 || constraints.length > 0) {
        const layout: RoomLayout = {
          id: 'current',
          name: 'Current Layout',
          students,
          desks,
          constraints,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        storage.saveLayout(layout);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [students, desks, constraints]);

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

  const assignedCount = desks.filter(d => d.assignedStudent).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 panel-shadow">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Presentation className="text-blue-600 w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900">Classroom Seating Chart Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleSaveLayout}
                variant="outline"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting || desks.length === 0}
                className="button-primary text-white"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Save as PDF'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel */}
        <div className="w-80 bg-white border-r border-gray-200 panel-shadow overflow-y-auto">
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
                className="w-full button-primary text-white font-semibold py-3"
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
          onAddDesk={handleAddDesk}
          onDeleteDesk={handleDeleteDesk}
          onMoveDesk={handleMoveDesk}
          onEditDesk={handleEditDesk}
          assignedCount={assignedCount}
        />
      </div>
    </div>
  );
}
