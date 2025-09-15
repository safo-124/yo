// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorLecturersTab.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  createLecturerInCenter,
  assignLecturerToDepartment
} from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import { UserPlus, Users, Edit3, BookCopy, Layers } from "lucide-react"; // Icons
import { Badge } from '@/components/ui/badge';

export default function ManageCoordinatorLecturersTab({
  centerId,
  initialLecturers = [],
  departmentsForAssignment = [],
  coordinatorUserId
}) {
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('');
  const [selectedDepartmentForNewLecturer, setSelectedDepartmentForNewLecturer] = useState('');

  const [selectedLecturerToAssign, setSelectedLecturerToAssign] = useState(null);
  const [targetDepartmentId, setTargetDepartmentId] = useState('');

  useEffect(() => {
    setLecturers(initialLecturers);
  }, [initialLecturers]);

  const resetCreateForm = () => {
    setNewLecturerName('');
    setNewLecturerEmail('');
    setNewLecturerPassword('');
    setSelectedDepartmentForNewLecturer('');
    setFormError('');
  };

  const resetAssignForm = () => {
    setSelectedLecturerToAssign(null);
    setTargetDepartmentId('');
    setFormError('');
  };

  const handleCreateLecturer = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newLecturerName.trim() || !newLecturerEmail.trim() || !newLecturerPassword.trim()) {
      setFormError("Name, email, and password are required.");
      setIsLoading(false);
      return;
    }
    if (newLecturerPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const lecturerData = {
      name: newLecturerName.trim(),
      email: newLecturerEmail.trim(),
      password: newLecturerPassword.trim(),
      centerId: centerId,
      departmentId: selectedDepartmentForNewLecturer || null,
    };

    const result = await createLecturerInCenter(lecturerData);

    if (result.success) {
      toast.success(`Lecturer "${result.user.name}" created successfully!`);
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create lecturer.");
      toast.error(result.error || "Failed to create lecturer.");
    }
    setIsLoading(false);
  };

  const handleOpenAssignDialog = (lecturer) => {
    setSelectedLecturerToAssign(lecturer);
    setTargetDepartmentId(lecturer.departmentId || '');
    setFormError('');
    setIsAssignDialogOpen(true);
  };

  const handleAssignDepartment = async (event) => {
    event.preventDefault();
    if (!selectedLecturerToAssign || !targetDepartmentId) {
      setFormError("Lecturer and target department must be selected.");
      return;
    }
    setIsLoading(true);
    setFormError('');

    const result = await assignLecturerToDepartment({
      lecturerId: selectedLecturerToAssign.id,
      departmentId: targetDepartmentId,
      centerId: centerId,
    });

    if (result.success) {
      toast.success(`Lecturer ${selectedLecturerToAssign.name} assigned successfully!`);
      setIsAssignDialogOpen(false);
      resetAssignForm();
    } else {
      setFormError(result.error || "Failed to assign department.");
      toast.error(result.error || "Failed to assign department.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => { setIsCreateDialogOpen(isOpen); if (!isOpen) resetCreateForm(); }}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Lecturer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lecturer</DialogTitle>
            <DialogDescription>
              Create a new lecturer account for this center.
            </DialogDescription>
          </DialogHeader>
           {/* Create Lecturer Dialog Content remains the same */}
        </DialogContent>
      </Dialog>

      {selectedLecturerToAssign && (
        <Dialog open={isAssignDialogOpen} onOpenChange={(isOpen) => { setIsAssignDialogOpen(isOpen); if (!isOpen) resetAssignForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Department to Lecturer</DialogTitle>
              <DialogDescription>
                Assign or reassign this lecturer to a department.
              </DialogDescription>
            </DialogHeader>
            {/* Assign Department Dialog Content remains the same */}
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Center Lecturers</CardTitle>
          <CardDescription>Manage lecturers assigned to your center and view their course assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Assigned Courses</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturers.length > 0 ? (
                  lecturers.map((lecturer) => (
                    <TableRow key={lecturer.id}>
                      <TableCell className="font-medium">
                        <div>{lecturer.name}</div>
                        <div className="text-xs text-muted-foreground">{lecturer.email}</div>
                      </TableCell>
                      <TableCell>{lecturer.departmentName || <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={lecturer.assignedCoursesCount > 0 ? "default" : "secondary"}>
                          {lecturer.assignedCoursesCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lecturer.assignedProgramCodes.length > 0 ? (
                            lecturer.assignedProgramCodes.map(code => (
                              <Badge key={code} variant="outline">{code}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(lecturer)} disabled={departmentsForAssignment.length === 0}>
                          <Edit3 className="mr-1 h-3 w-3" /> Assign Dept.
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No lecturers found in this center.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {lecturers.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">Click "Add New Lecturer" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}