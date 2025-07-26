import { useState } from 'react';
import { Student } from '@/types/seating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, X, Upload } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StudentListManagerProps {
  students: Student[];
  onAddStudent: (name: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onBulkImport: (names: string[]) => void;
}

export function StudentListManager({ 
  students, 
  onAddStudent, 
  onRemoveStudent, 
  onBulkImport 
}: StudentListManagerProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkImportText, setBulkImportText] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim());
      setNewStudentName('');
    }
  };

  const handleBulkImport = () => {
    const names = bulkImportText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length > 0) {
      onBulkImport(names);
      setBulkImportText('');
      setIsBulkImportOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStudent();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Students</h2>
        <span className="text-sm text-gray-500">{students.length} students</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Student name..."
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 input-field"
          />
          <Button 
            onClick={handleAddStudent} 
            className="button-primary"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Collapsible open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="text-sm text-blue-600 hover:text-blue-700 font-medium p-0">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            <Textarea
              placeholder="Paste student names (one per line)..."
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              className="input-field h-24 resize-none"
            />
            <Button 
              onClick={handleBulkImport} 
              variant="secondary" 
              className="w-full"
              size="sm"
            >
              Import Students
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {students.map((student, index) => (
          <Card key={student.id} className="student-item p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-900">{student.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveStudent(student.id)}
                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No students added yet</p>
            <p className="text-xs">Add students to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
