// app/(dashboard)/registry/_components/ManageDepartmentsTab.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Building2, GraduationCap, Plus, Minus, BookOpen, 
  MapPin, Loader2, AlertCircle, CheckCircle2, Building, Users 
} from "lucide-react";
import { 
  getDepartmentsWithPrograms, 
  getAvailablePrograms, 
  assignProgramsToDepartments,
  unassignProgramsFromDepartments,
  unassignCentersFromDepartment,
  getRegistryData // To get centers data
} from '@/lib/actions/registry.actions';

export default function ManageDepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);

  // Center unassignment states
  const [isUnassignCentersDialogOpen, setIsUnassignCentersDialogOpen] = useState(false);
  const [selectedCentersForUnassignment, setSelectedCentersForUnassignment] = useState([]);
  const [departmentForCenterUnassignment, setDepartmentForCenterUnassignment] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchAllPrograms();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const result = await getDepartmentsWithPrograms();
      if (result.success) {
        setDepartments(result.departments || []);
      } else {
        toast.error(result.error || 'Failed to fetch departments');
      }
    } catch (error) {
      toast.error('Error fetching departments');
    }
    setIsLoading(false);
  };

  const fetchAllPrograms = async () => {
    try {
      const result = await getAvailablePrograms();
      if (result.success) {
        setAllPrograms(result.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleAssignPrograms = async () => {
    if (!selectedDepartment || selectedPrograms.length === 0) {
      toast.error('Please select programs to assign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await assignProgramsToDepartments(selectedPrograms, [selectedDepartment.id]);
      if (result.success) {
        toast.success(`${selectedPrograms.length} program(s) assigned successfully`);
        setIsAssignDialogOpen(false);
        setSelectedPrograms([]);
        setSelectedDepartment(null);
        fetchDepartments();
        fetchAllPrograms();
      } else {
        toast.error(result.error || 'Failed to assign programs');
      }
    } catch (error) {
      toast.error('Error assigning programs');
    }
    setIsLoading(false);
  };

  const handleUnassignPrograms = async () => {
    if (!selectedDepartment || selectedPrograms.length === 0) {
      toast.error('Please select programs to unassign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unassignProgramsFromDepartments(selectedPrograms, [selectedDepartment.id]);
      if (result.success) {
        toast.success(`${selectedPrograms.length} program(s) unassigned successfully`);
        setIsUnassignDialogOpen(false);
        setSelectedPrograms([]);
        setSelectedDepartment(null);
        fetchDepartments();
        fetchAllPrograms();
      } else {
        toast.error(result.error || 'Failed to unassign programs');
      }
    } catch (error) {
      toast.error('Error unassigning programs');
    }
    setIsLoading(false);
  };

  const handleUnassignCenters = async () => {
    if (!departmentForCenterUnassignment || selectedCentersForUnassignment.length === 0) {
      toast.error('Please select centers to unassign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unassignCentersFromDepartment(
        departmentForCenterUnassignment.id, 
        selectedCentersForUnassignment
      );
      if (result.success) {
        toast.success(`${selectedCentersForUnassignment.length} center(s) unassigned successfully`);
        setIsUnassignCentersDialogOpen(false);
        setSelectedCentersForUnassignment([]);
        setDepartmentForCenterUnassignment(null);
        fetchDepartments();
      } else {
        toast.error(result.error || 'Failed to unassign centers');
      }
    } catch (error) {
      toast.error('Error unassigning centers');
    }
    setIsLoading(false);
  };

  const openAssignDialog = (department) => {
    setSelectedDepartment(department);
    setSelectedPrograms([]);
    setIsAssignDialogOpen(true);
  };

  const openUnassignDialog = (department) => {
    setSelectedDepartment(department);
    setSelectedPrograms([]);
    setIsUnassignDialogOpen(true);
  };

  const openUnassignCentersDialog = (department) => {
    setDepartmentForCenterUnassignment(department);
    setSelectedCentersForUnassignment([]);
    setIsUnassignCentersDialogOpen(true);
  };

  const toggleProgramSelection = (programId) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const toggleCenterSelection = (centerId) => {
    setSelectedCentersForUnassignment(prev => 
      prev.includes(centerId) 
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  // Get programs that are not assigned to the current department
  const getAvailableProgramsForDepartment = (department) => {
    const assignedProgramIds = new Set(department.programs?.map(p => p.id) || []);
    return allPrograms.filter(program => !assignedProgramIds.has(program.id));
  };

  // Get unassigned programs (not assigned to any department)
  const unassignedPrograms = allPrograms.filter(program => !program.isAssigned);

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Department Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Assign programs to departments with many-to-many relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {departments.length} Departments
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {unassignedPrograms.length} Unassigned Programs
          </Badge>
        </div>
      </div>

      {unassignedPrograms.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800 dark:text-orange-200">
                Unassigned Programs
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
              The following programs are not assigned to any department:
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedPrograms.map(program => (
                <Badge key={program.id} variant="outline" className="text-orange-600 border-orange-600">
                  {program.programCode} - {program.programTitle}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map(department => (
          <Card key={department.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </div>
                <div className="flex flex-col gap-1">
                  {department.centers?.length > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {department.centers.length} Center(s)
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Programs ({department.programs?.length || 0})
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAssignDialog(department)}
                      className="h-7 px-2"
                      title="Assign programs to this department"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    {department.programs?.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUnassignDialog(department)}
                        className="h-7 px-2 text-red-600 hover:text-red-700"
                        title="Unassign programs from this department"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                    {department.centers?.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUnassignCentersDialog(department)}
                        className="h-7 px-2 text-orange-600 hover:text-orange-700"
                        title="Unassign centers from this department"
                      >
                        <Building className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {department.programs?.length > 0 ? (
                  <ScrollArea className="h-32 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-1">
                      {department.programs.map(program => (
                        <div key={program.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          <GraduationCap className="h-3 w-3 text-blue-500" />
                          <span className="text-sm">
                            {program.programCode} - {program.programTitle}
                          </span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {program.programCategory}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    No programs assigned
                  </div>
                )}
              </div>

              {/* Centers assigned to this department */}
              {department.centers?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Assigned Centers
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {department.centers.map(center => (
                      <Badge key={center.id} variant="outline" className="text-green-600 border-green-600 text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {center.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: {department.id.substring(0, 8)}...</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {department._count?.lecturers || 0} Lecturers
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Building className="h-3 w-3 mr-1" />
                    {department._count?.centers || 0} Centers
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Programs Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Programs to Department</DialogTitle>
            <p className="text-sm text-gray-600">
              Select programs to assign to <strong>{selectedDepartment?.name}</strong>
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {(() => {
              const availablePrograms = selectedDepartment ? getAvailableProgramsForDepartment(selectedDepartment) : [];
              return availablePrograms.length > 0 ? (
                <ScrollArea className="h-64 border rounded-md p-3">
                  <div className="space-y-2">
                    {availablePrograms.map(program => (
                      <div key={program.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assign-${program.id}`}
                          checked={selectedPrograms.includes(program.id)}
                          onCheckedChange={() => toggleProgramSelection(program.id)}
                        />
                        <label
                          htmlFor={`assign-${program.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span>{program.programCode} - {program.programTitle}</span>
                            <span className="text-xs text-gray-500">{program.programCategory}</span>
                            {program.isAssigned && (
                              <span className="text-xs text-blue-500">
                                Currently assigned to {program.departments?.length || 0} other department(s)
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No programs available to assign</p>
                  <p className="text-xs text-gray-400">All programs are already assigned to this department</p>
                </div>
              );
            })()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignPrograms}
              disabled={selectedPrograms.length === 0 || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Assign {selectedPrograms.length} Program(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Programs Dialog */}
      <Dialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unassign Programs from Department</DialogTitle>
            <p className="text-sm text-gray-600">
              Select programs to unassign from <strong>{selectedDepartment?.name}</strong>
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDepartment?.programs?.length > 0 ? (
              <ScrollArea className="h-64 border rounded-md p-3">
                <div className="space-y-2">
                  {selectedDepartment.programs.map(program => (
                    <div key={program.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unassign-${program.id}`}
                        checked={selectedPrograms.includes(program.id)}
                        onCheckedChange={() => toggleProgramSelection(program.id)}
                      />
                      <label
                        htmlFor={`unassign-${program.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span>{program.programCode} - {program.programTitle}</span>
                          <span className="text-xs text-gray-500">{program.programCategory}</span>
                          {/* Show if this program is assigned to other departments */}
                          {allPrograms.find(p => p.id === program.id)?.departments?.length > 1 && (
                            <span className="text-xs text-amber-600">
                              Also assigned to {allPrograms.find(p => p.id === program.id)?.departments?.length - 1} other department(s)
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No programs assigned to this department</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnassignPrograms}
              disabled={selectedPrograms.length === 0 || isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Minus className="h-4 w-4 mr-2" />
              )}
              Unassign {selectedPrograms.length} Program(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Centers Dialog */}
      <Dialog 
        open={isUnassignCentersDialogOpen} 
        onOpenChange={setIsUnassignCentersDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unassign Centers from Department</DialogTitle>
          </DialogHeader>
          
          {departmentForCenterUnassignment && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {departmentForCenterUnassignment.name}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Select centers to unassign from this department
                </p>
              </div>

              {departmentForCenterUnassignment.centers?.length > 0 ? (
                <ScrollArea className="h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {departmentForCenterUnassignment.centers.map(center => (
                      <div key={center.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`center-${center.id}`}
                          checked={selectedCentersForUnassignment.includes(center.id)}
                          onCheckedChange={() => toggleCenterSelection(center.id)}
                        />
                        <label
                          htmlFor={`center-${center.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span>{center.name}</span>
                            <span className="text-xs text-gray-500">{center.location}</span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No centers assigned to this department</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUnassignCentersDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUnassignCenters}
              disabled={isLoading || selectedCentersForUnassignment.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Building className="h-4 w-4 mr-2" />
              )}
              Unassign {selectedCentersForUnassignment.length} Center(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}