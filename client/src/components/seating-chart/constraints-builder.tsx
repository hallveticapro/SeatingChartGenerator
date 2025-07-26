import { useState } from 'react';
import { Student, Desk, Constraint } from '@/types/seating';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, UserX, Ruler, Plus, X } from 'lucide-react';

interface ConstraintsBuilderProps {
  students: Student[];
  desks: Desk[];
  constraints: Constraint[];
  onAddConstraint: (constraint: Omit<Constraint, 'id'>) => void;
  onRemoveConstraint: (constraintId: string) => void;
}

export function ConstraintsBuilder({
  students,
  desks,
  constraints,
  onAddConstraint,
  onRemoveConstraint
}: ConstraintsBuilderProps) {
  const [hardSeatStudent, setHardSeatStudent] = useState('');
  const [hardSeatDesk, setHardSeatDesk] = useState('');
  const [keepApartStudent1, setKeepApartStudent1] = useState('');
  const [keepApartStudent2, setKeepApartStudent2] = useState('');
  const [distanceStudent1, setDistanceStudent1] = useState('');
  const [distanceStudent2, setDistanceStudent2] = useState('');
  const [minDistance, setMinDistance] = useState(2);

  const handleAddHardSeat = () => {
    if (hardSeatStudent && hardSeatDesk) {
      onAddConstraint({
        type: 'hard_seat',
        studentIds: [hardSeatStudent],
        deskId: hardSeatDesk
      });
      setHardSeatStudent('');
      setHardSeatDesk('');
    }
  };

  const handleAddKeepApart = () => {
    if (keepApartStudent1 && keepApartStudent2 && keepApartStudent1 !== keepApartStudent2) {
      onAddConstraint({
        type: 'keep_apart',
        studentIds: [keepApartStudent1, keepApartStudent2]
      });
      setKeepApartStudent1('');
      setKeepApartStudent2('');
    }
  };

  const handleAddDistance = () => {
    if (distanceStudent1 && distanceStudent2 && distanceStudent1 !== distanceStudent2) {
      onAddConstraint({
        type: 'distance',
        studentIds: [distanceStudent1, distanceStudent2],
        minDistance
      });
      setDistanceStudent1('');
      setDistanceStudent2('');
    }
  };

  const getConstraintDescription = (constraint: Constraint): string => {
    const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';
    const getDeskNumber = (id?: string) => desks.find(d => d.id === id)?.number || 'Unknown';

    switch (constraint.type) {
      case 'hard_seat':
        return `${getStudentName(constraint.studentIds[0])} → Desk ${getDeskNumber(constraint.deskId)}`;
      case 'keep_apart':
        return `${getStudentName(constraint.studentIds[0])} ↔ ${getStudentName(constraint.studentIds[1])} apart`;
      case 'distance':
        return `${getStudentName(constraint.studentIds[0])} ↔ ${getStudentName(constraint.studentIds[1])} min ${constraint.minDistance} desks`;
      default:
        return 'Unknown constraint';
    }
  };

  const getConstraintIcon = (type: string) => {
    switch (type) {
      case 'hard_seat': return <MapPin className="w-3 h-3 text-blue-600" />;
      case 'keep_apart': return <UserX className="w-3 h-3 text-yellow-600" />;
      case 'distance': return <Ruler className="w-3 h-3 text-slate-600" />;
      default: return null;
    }
  };

  const getConstraintBgColor = (type: string) => {
    switch (type) {
      case 'hard_seat': return 'bg-blue-50';
      case 'keep_apart': return 'bg-yellow-50';
      case 'distance': return 'bg-slate-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Constraints</h2>
        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-3 h-3 mr-1 inline" />
          Add Rule
        </span>
      </div>

      <div className="space-y-3">
        {/* Hard Seat Assignment */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm font-medium text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Hard Seat Assignment
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select value={hardSeatStudent} onValueChange={setHardSeatStudent}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={hardSeatDesk} onValueChange={setHardSeatDesk}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select Desk" />
                  </SelectTrigger>
                  <SelectContent>
                    {desks.map(desk => (
                      <SelectItem key={desk.id} value={desk.id}>
                        Desk {desk.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddHardSeat} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Add Hard Seat Rule
              </Button>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Keep Apart */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm font-medium text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <UserX className="w-4 h-4 mr-2 text-yellow-600" />
              Keep Apart
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select value={keepApartStudent1} onValueChange={setKeepApartStudent1}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Student A" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={keepApartStudent2} onValueChange={setKeepApartStudent2}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Student B" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.id !== keepApartStudent1).map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddKeepApart} 
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                Add Keep Apart Rule
              </Button>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Distance Constraint */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm font-medium text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <Ruler className="w-4 h-4 mr-2 text-slate-600" />
              Distance Constraint
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select value={distanceStudent1} onValueChange={setDistanceStudent1}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Student A" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={distanceStudent2} onValueChange={setDistanceStudent2}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Student B" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.id !== distanceStudent1).map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Min distance:</span>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={minDistance}
                  onChange={(e) => setMinDistance(parseInt(e.target.value) || 2)}
                  className="w-16 input-field text-center"
                />
                <span className="text-sm text-gray-600">desks</span>
              </div>
              <Button 
                onClick={handleAddDistance} 
                className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                size="sm"
              >
                Add Distance Rule
              </Button>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active Constraints List */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {constraints.map(constraint => (
          <Card key={constraint.id} className={`constraint-item p-3 ${getConstraintBgColor(constraint.type)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getConstraintIcon(constraint.type)}
                <span className="text-xs text-gray-700">
                  {getConstraintDescription(constraint)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveConstraint(constraint.id)}
                className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
        
        {constraints.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-xs">No constraints added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
