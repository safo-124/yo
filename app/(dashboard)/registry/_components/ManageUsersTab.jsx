// app/(dashboard)/registry/_components/ManageUsersTab.jsx
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Ensure Card components are imported
import {
  createUserByRegistry,
  updateUserRoleAndAssignmentsByRegistry,
  updateUserPasswordByRegistry
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserPlus, Users, Edit, KeyRound } from "lucide-react"; // Icons

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError }) {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // State for creating new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newSelectedCenterForLecturer, setNewSelectedCenterForLecturer] = useState('');

  // State for editing existing user
  const [editingUser, setEditingUser] = useState(null); // Stores the full user object being edited
  const [editUserRole, setEditUserRole] = useState('');
  const [editSelectedCenter, setEditSelectedCenter] = useState('');
  const [editSelectedDepartment, setEditSelectedDepartment] = useState(''); // For future use if assigning dept directly

  // State for changing password
  const [userForPasswordChange, setUserForPasswordChange] = useState(null);
  const [newPasswordForChange, setNewPasswordForChange] = useState('');


  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('');
    setNewSelectedCenterForLecturer('');
    setFormError('');
  };

  const resetEditForm = () => {
    setEditingUser(null);
    setEditUserRole('');
    setEditSelectedCenter('');
    setEditSelectedDepartment('');
    setFormError('');
  };

  const resetChangePasswordForm = () => {
    setUserForPasswordChange(null);
    setNewPasswordForChange('');
    setFormError('');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("Name, email, password, and role are required.");
      setIsLoading(false);
      return;
    }
    if (newUserPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const userData = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      role: newUserRole,
      lecturerCenterId: newUserRole === 'LECTURER' ? newSelectedCenterForLecturer || null : null,
    };

    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${result.user.name}" created successfully!`);
      // Parent page revalidation will update initialUsers prop, then useEffect updates local state.
      setIsCreateUserDialogOpen(false);
      resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create user.");
      toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditUserRole(user.role);
    setEditSelectedCenter(user.lecturerCenterId || '');
    // setEditSelectedDepartment(user.departmentId || ''); // If managing department here
    setFormError('');
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    setFormError('');
    setIsLoading(true);

    const updateData = {
      userId: editingUser.id,
      newRole: editUserRole,
      newCenterId: editUserRole === 'LECTURER' ? editSelectedCenter || null : null,
      // newDepartmentId: editUserRole === 'LECTURER' ? editSelectedDepartment || null : null, // If managing dept
    };

    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${editingUser.name}" updated successfully!`);
      setIsEditUserDialogOpen(false);
      resetEditForm();
      // Parent page revalidation will update data.
    } else {
      setFormError(result.error || "Failed to update user.");
      toast.error(result.error || "Failed to update user.");
    }
  };

  const handleOpenChangePasswordDialog = (user) => {
    setUserForPasswordChange(user);
    setNewPasswordForChange('');
    setFormError('');
    setIsChangePasswordDialogOpen(true);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!userForPasswordChange || !newPasswordForChange.trim()) {
      setFormError("New password is required.");
      return;
    }
    if (newPasswordForChange.trim().length < 6) {
      setFormError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFormError('');

    const result = await updateUserPasswordByRegistry({
      userId: userForPasswordChange.id,
      newPassword: newPasswordForChange.trim(),
    });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for ${userForPasswordChange.name} updated successfully!`);
      setIsChangePasswordDialogOpen(false);
      resetChangePasswordForm();
    } else {
      setFormError(result.error || "Failed to update password.");
      toast.error(result.error || "Failed to update password.");
    }
  };

  if (fetchError) {
    return <p className="text-red-600">Error loading user data: {fetchError}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={(isOpen) => {
        setIsCreateUserDialogOpen(isOpen);
        if (!isOpen) resetCreateForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Enter details for the new Coordinator or Lecturer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              {/* ... Create User Form Fields (same as manage_users_tab_v1) ... */}
              <div className="space-y-1">
                <Label htmlFor="newUserName">Full Name</Label>
                <Input id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newUserEmail">Email</Label>
                <Input id="newUserEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newUserPassword">Password</Label>
                <Input id="newUserPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required disabled={isLoading} placeholder="Min. 6 characters" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newUserRole">Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading} required>
                  <SelectTrigger id="newUserRole"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUserRole === 'LECTURER' && (
                <div className="space-y-1">
                  <Label htmlFor="newLecturerCenter">Assign to Center (Optional)</Label>
                  <Select value={newSelectedCenterForLecturer} onValueChange={setNewSelectedCenterForLecturer} disabled={isLoading}>
                    <SelectTrigger id="newLecturerCenter"><SelectValue placeholder="Select center" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {centers.map(center => <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={(isOpen) => {
          setIsEditUserDialogOpen(isOpen);
          if (!isOpen) resetEditForm();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
              <DialogDescription>Update user role and assignments.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label>Email (Read-only)</Label>
                  <Input value={editingUser.email} readOnly disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="editUserRole">Role</Label>
                  <Select value={editUserRole} onValueChange={setEditUserRole} disabled={isLoading} required>
                    <SelectTrigger id="editUserRole"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                      {/* REGISTRY role changes should be handled with extreme care, maybe not here */}
                    </SelectContent>
                  </Select>
                </div>
                {editUserRole === 'LECTURER' && (
                  <div className="space-y-1">
                    <Label htmlFor="editLecturerCenter">Assign to Center</Label>
                    <Select value={editSelectedCenter} onValueChange={setEditSelectedCenter} disabled={isLoading}>
                      <SelectTrigger id="editLecturerCenter"><SelectValue placeholder="Select center" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Unassign)</SelectItem>
                        {centers.map(center => <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Add department assignment here if needed when role is LECTURER */}
                {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update User"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      {userForPasswordChange && (
         <Dialog open={isChangePasswordDialogOpen} onOpenChange={(isOpen) => {
          setIsChangePasswordDialogOpen(isOpen);
          if (!isOpen) resetChangePasswordForm();
        }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Change Password for {userForPasswordChange.name}</DialogTitle>
              <DialogDescription>Enter a new password for the user.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="newPasswordChange">New Password</Label>
                  <Input id="newPasswordChange" type="password" value={newPasswordForChange} onChange={(e) => setNewPasswordForChange(e.target.value)} required disabled={isLoading} placeholder="Min. 6 characters" />
                </div>
                {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Change Password"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}


      {/* Table of Users */}
      <Card>
        <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>View and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Associated Center</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.length > 0 ? (
                    users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                        {user.role === 'COORDINATOR' && user.coordinatedCenter?.name
                            ? `Coordinates: ${user.coordinatedCenter.name}`
                            : user.role === 'LECTURER' && user.lecturerCenter?.name
                            ? `Lecturer at: ${user.lecturerCenter.name}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{user.department?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY'}> {/* Disable editing REGISTRY itself */}
                                <Edit className="mr-1 h-3 w-3" /> Edit Role
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleOpenChangePasswordDialog(user)}>
                                <KeyRound className="mr-1 h-3 w-3" /> Password
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No users found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
            {users.length === 0 && !fetchError && (
                <p className="text-center text-muted-foreground mt-4">Click "Add New User" to get started.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
