// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorDepartmentsTab.jsx
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createDepartment } from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import { PlusCircle, Building } from "lucide-react"; // Icons

export default function ManageCoordinatorDepartmentsTab({ centerId, initialDepartments = [], coordinatorUserId }) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update departments if initialDepartments prop changes (e.g., after revalidation)
  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  const resetForm = () => {
    setNewDepartmentName('');
    setFormError('');
  };

  const handleCreateDepartment = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newDepartmentName.trim()) {
      setFormError("Department name is required.");
      setIsLoading(false);
      return;
    }

    const result = await createDepartment({ name: newDepartmentName.trim(), centerId });

    if (result.success) {
      toast.success(`Department "${result.department.name}" created successfully!`);
      // The parent page (CoordinatorDashboardPage) should re-fetch or revalidate,
      // and the updated initialDepartments prop will update the state via useEffect.
      setIsDialogOpen(false);
      resetForm();
    } else {
      setFormError(result.error || "Failed to create department.");
      toast.error(result.error || "Failed to create department.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) resetForm(); // Reset form if dialog is closed
      }}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Department
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Enter the name for the new department in your center.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDepartment}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full"
                  placeholder="e.g., Department of Computer Science"
                  disabled={isLoading}
                  required
                />
              </div>
              {formError && (
                <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
                  {formError}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] hidden sm:table-cell"><Building className="h-4 w-4" /></TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Lecturers</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="hidden sm:table-cell"><Building className="h-5 w-5 text-muted-foreground"/></TableCell>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.lecturerCount || 0}</TableCell>
                  <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                  {/* <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button>
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No departments found in this center.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {departments.length === 0 && (
         <p className="text-center text-muted-foreground">Click "Add New Department" to get started.</p>
      )}
    </div>
  );
}
