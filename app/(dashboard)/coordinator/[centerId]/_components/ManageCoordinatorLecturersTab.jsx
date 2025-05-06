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
import {
  createLecturerInCenter,
  assignLecturerToDepartment
} from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import { UserPlus, Users, Edit3 } from "lucide-react"; // Icons

export default function ManageCoordinatorLecturersTab({
  centerId,
  initialLecturers = [],
  departmentsForAssignment = [], // Departments within this center
  coordinatorUserId
}) {
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // State for creating new lecturer
  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('');
  const [selectedDepartmentForNewLecturer, setSelectedDepartmentForNewLecturer] = useState('');

  // State for assigning department to existing lecturer
  const [selectedLecturerToAssign, setSelectedLecturerToAssign] = useState(null); // Stores lecturer object
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
      // Parent page revalidation will update initialLecturers prop, then useEffect updates local state.
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
    setTargetDepartmentId(lecturer.departmentId || ''); // Pre-fill if already assigned
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
      centerId: centerId, // For revalidation path
    });

    if (result.success) {
      toast.success(`Lecturer ${selectedLecturerToAssign.name} assigned to department successfully!`);
      setIsAssignDialogOpen(false);
      resetAssignForm();
      // Parent page revalidation will update data.
    } else {
      setFormError(result.error || "Failed to assign department.");
      toast.error(result.error || "Failed to assign department.");
    }
    setIsLoading(false);
  };


  return (
    <div className="space-y-6">
      {/* Create Lecturer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => {
        setIsCreateDialogOpen(isOpen);
        if (!isOpen) resetCreateForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Lecturer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Lecturer</DialogTitle>
            <DialogDescription>
              Enter details for the new lecturer in your center.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLecturer}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="lecturerName">Full Name</Label>
                <Input id="lecturerName" value={newLecturerName} onChange={(e) => setNewLecturerName(e.target.value)} placeholder="e.g., Dr. Ada Lovelace" disabled={isLoading} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lecturerEmail">Email Address</Label>
                <Input id="lecturerEmail" type="email" value={newLecturerEmail} onChange={(e) => setNewLecturerEmail(e.target.value)} placeholder="lecturer@example.com" disabled={isLoading} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lecturerPassword">Password</Label>
                <Input id="lecturerPassword" type="password" value={newLecturerPassword} onChange={(e) => setNewLecturerPassword(e.target.value)} placeholder="Min. 6 characters" disabled={isLoading} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lecturerNewDepartment">Assign to Department (Optional)</Label>
                <Select value={selectedDepartmentForNewLecturer} onValueChange={setSelectedDepartmentForNewLecturer} disabled={isLoading}>
                  <SelectTrigger id="lecturerNewDepartment"><SelectValue placeholder="Select a department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {departmentsForAssignment.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Lecturer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Lecturer to Department Dialog */}
      {selectedLecturerToAssign && (
        <Dialog open={isAssignDialogOpen} onOpenChange={(isOpen) => {
          setIsAssignDialogOpen(isOpen);
          if (!isOpen) resetAssignForm();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Department to {selectedLecturerToAssign.name}</DialogTitle>
              <DialogDescription>
                Select a department to assign this lecturer to.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignDepartment}>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="targetDepartment">Department</Label>
                  <Select value={targetDepartmentId} onValueChange={setTargetDepartmentId} disabled={isLoading} required>
                    <SelectTrigger id="targetDepartment"><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>
                      {departmentsForAssignment.length > 0 ? departmentsForAssignment.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      )) : <SelectItem value="" disabled>No departments available</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Assigning..." : "Assign Department"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Table of Lecturers */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] hidden sm:table-cell"><Users className="h-4 w-4" /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecturers.length > 0 ? (
              lecturers.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell className="hidden sm:table-cell"><Users className="h-5 w-5 text-muted-foreground"/></TableCell>
                  <TableCell className="font-medium">{lecturer.name}</TableCell>
                  <TableCell>{lecturer.email}</TableCell>
                  <TableCell>{lecturer.departmentName || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(lecturer)} disabled={departmentsForAssignment.length === 0}>
                      <Edit3 className="mr-1 h-3 w-3" /> Assign Dept.
                    </Button>
                    {/* Add more actions like Edit Lecturer Details if needed */}
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
         <p className="text-center text-muted-foreground">Click "Add New Lecturer" to get started.</p>
      )}
    </div>
  );
}
