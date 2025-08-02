import { useState } from 'react';
import { Student, AcademicLevel } from '@/types/seating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Upload, GraduationCap } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StudentListManagerProps {
  students: Student[];
  onAddStudent: (name: string, academicLevel?: AcademicLevel) => void;
  onRemoveStudent: (studentId: string) => void;
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void;
  onBulkImport: (names: string[]) => void;
}

export function StudentListManager({ 
  students, 
  onAddStudent, 
  onRemoveStudent,
  onUpdateStudent,
  onBulkImport 
}: StudentListManagerProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState<AcademicLevel>('medium-high');
  const [bulkImportText, setBulkImportText] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim(), newStudentLevel);
      setNewStudentName('');
      setNewStudentLevel('medium-high');
    }
  };

  const getAcademicLevelColor = (level?: AcademicLevel) => {
    switch (level) {
      case 'high': return 'bg-green-600';
      case 'medium-high': return 'bg-blue-600'; 
      case 'medium-low': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getAcademicLevelLabel = (level?: AcademicLevel) => {
    switch (level) {
      case 'high': return 'H';
      case 'medium-high': return 'MH';
      case 'medium-low': return 'ML';
      case 'low': return 'L';
      default: return '?';
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
          <Select value={newStudentLevel} onValueChange={(value: AcademicLevel) => setNewStudentLevel(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium-high">Medium-High</SelectItem>
              <SelectItem value="medium-low">Medium-Low</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddStudent} 
            size="sm"
            style={{ 
              opacity: 1, 
              visibility: 'visible', 
              backgroundColor: 'hsl(214, 85%, 55%)', 
              color: 'white', 
              border: 'none' 
            }}
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
              style={{ opacity: 1, visibility: 'visible' }}
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
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm text-gray-900">{student.name}</span>
                  <div className={`w-6 h-6 ${getAcademicLevelColor(student.academicLevel)} text-white rounded text-xs flex items-center justify-center font-medium`}>
                    {getAcademicLevelLabel(student.academicLevel)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Select 
                  value={student.academicLevel || 'medium-high'} 
                  onValueChange={(value: AcademicLevel) => onUpdateStudent(student.id, { academicLevel: value })}
                >
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium-high">Med-Hi</SelectItem>
                    <SelectItem value="medium-low">Med-Lo</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveStudent(student.id)}
                  className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
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
