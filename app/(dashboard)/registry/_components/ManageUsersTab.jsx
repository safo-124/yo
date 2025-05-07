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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  createUserByRegistry,
  updateUserRoleAndAssignmentsByRegistry,
  updateUserPasswordByRegistry,
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserPlus, Users, Edit3, KeyRound } from "lucide-react"; // Icons

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError }) {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');


  // Form state for new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState(''); // Empty string for placeholder

  // State for editing existing user
  const [editingUser, setEditingUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState(''); // Empty string for placeholder
  const [editUserDepartmentId, setEditUserDepartmentId] = useState('');

  // State for changing password
  const [newPasswordForUser, setNewPasswordForUser] = useState('');


  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('');
    setSelectedCenterForNewLecturer('');
    setFormError('');
  };

  const resetEditForm = () => {
    setEditingUser(null);
    setEditUserRole('');
    setEditUserCenterId('');
    setEditUserDepartmentId('');
    setFormError('');
  };

  const resetPasswordChangeForm = () => {
    setNewPasswordForUser('');
    setPasswordFormError('');
  }

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
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForNewLecturer || null : null,
    };

    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${result.user.name}" created successfully!`);
      setIsCreateUserDialogOpen(false);
      resetCreateForm();
      // Parent page revalidation will update initialUsers prop, then useEffect updates local state.
    } else {
      setFormError(result.error || "Failed to create user.");
      toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditUserRole(user.role);
    setEditUserCenterId(user.lecturerCenterId || ''); // Use empty string if null/undefined
    setEditUserDepartmentId(user.departmentId || '');
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
      newCenterId: editUserRole === 'LECTURER' ? editUserCenterId || null : null,
      newDepartmentId: editUserRole === 'LECTURER' ? editUserDepartmentId || null : null,
    };

    if (!updateData.newRole) {
        setFormError("Role is required.");
        setIsLoading(false);
        return;
    }
    // Making center assignment optional on edit for now
    // if (updateData.newRole === 'LECTURER' && !updateData.newCenterId) {
    //     setFormError("Center assignment is required for lecturers.");
    //     setIsLoading(false);
    //     return;
    // }


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
    if (!editingUser || editingUser.id !== user.id) {
        setEditingUser(user);
    }
    setPasswordFormError('');
    setNewPasswordForUser('');
    setIsChangePasswordDialogOpen(true);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!editingUser || !newPasswordForUser.trim()) {
      setPasswordFormError("New password is required.");
      return;
    }
    if (newPasswordForUser.trim().length < 6) {
      setPasswordFormError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    setPasswordFormError('');

    const result = await updateUserPasswordByRegistry({
      userId: editingUser.id,
      newPassword: newPasswordForUser.trim(),
    });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for user "${editingUser.name}" updated successfully!`);
      setIsChangePasswordDialogOpen(false);
      resetPasswordChangeForm();
    } else {
      setPasswordFormError(result.error || "Failed to update password.");
      toast.error(result.error || "Failed to update password.");
    }
  };


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
              <div className="space-y-1"><Label htmlFor="newUserName">Full Name</Label><Input id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required disabled={isLoading} /></div>
              <div className="space-y-1"><Label htmlFor="newUserEmail">Email</Label><Input id="newUserEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required disabled={isLoading} /></div>
              <div className="space-y-1"><Label htmlFor="newUserPassword">Password</Label><Input id="newUserPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required disabled={isLoading} /></div>
              <div className="space-y-1">
                <Label htmlFor="newUserRole">Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading} required>
                  <SelectTrigger id="newUserRole"><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUserRole === 'LECTURER' && (
                <div className="space-y-1">
                  <Label htmlFor="selectedCenterForNewLecturer">Assign to Center (Optional)</Label>
                  {/* Ensure value is controlled and use empty string for placeholder state */}
                  <Select value={selectedCenterForNewLecturer} onValueChange={setSelectedCenterForNewLecturer} disabled={isLoading}>
                    <SelectTrigger id="selectedCenterForNewLecturer"><SelectValue placeholder="Select a center (optional)" /></SelectTrigger>
                    <SelectContent>
                      {/* REMOVED: <SelectItem value="">None</SelectItem> */}
                      {centers.length > 0 ? (
                         centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))
                      ) : (
                         <div className="px-2 py-1.5 text-sm text-muted-foreground">No centers available.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formError && <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{formError}</p>}
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
              <DialogDescription>Modify user role and assignments. Email cannot be changed here.</DialogDescription>
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
                    <SelectTrigger id="editUserRole"><SelectValue placeholder="Select new role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editUserRole === 'LECTURER' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="editUserCenterId">Assign to Center (Optional)</Label>
                      {/* Ensure value is controlled and use empty string for placeholder state */}
                      <Select value={editUserCenterId} onValueChange={setEditUserCenterId} disabled={isLoading}>
                        <SelectTrigger id="editUserCenterId"><SelectValue placeholder="Select a center (optional)" /></SelectTrigger>
                        <SelectContent>
                          {/* REMOVED: <SelectItem value="">None</SelectItem> */}
                          {centers.length > 0 ? (
                             centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))
                          ) : (
                             <div className="px-2 py-1.5 text-sm text-muted-foreground">No centers available.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Department assignment could be added here if needed */}
                  </>
                )}
                {formError && <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{formError}</p>}
                <Button type="button" variant="outline" onClick={() => handleOpenChangePasswordDialog(editingUser)} className="w-full mt-2" disabled={isLoading}>
                  <KeyRound className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      {editingUser && isChangePasswordDialogOpen && (
          <Dialog open={isChangePasswordDialogOpen} onOpenChange={(isOpen) => {
              setIsChangePasswordDialogOpen(isOpen);
              if (!isOpen) resetPasswordChangeForm();
          }}>
              <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                      <DialogTitle>Change Password for {editingUser.name}</DialogTitle>
                      <DialogDescription>Enter a new password for the user.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword}>
                      <div className="grid gap-4 py-4">
                          <div className="space-y-1">
                              <Label htmlFor="newPasswordForUser">New Password</Label>
                              <Input id="newPasswordForUser" type="password" value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} required disabled={isLoading} />
                          </div>
                          {passwordFormError && <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{passwordFormError}</p>}
                      </div>
                      <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                          <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Set New Password"}</Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
      )}


      {/* Table of Users */}
      <Card>
        <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage all user accounts in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Associated Center/Dept.</TableHead>
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
                            ? `Center: ${user.lecturerCenter.name}${user.department?.name ? ` / Dept: ${user.department.name}` : ''}`
                            : user.role === 'LECTURER' && !user.lecturerCenter?.name && user.lecturerCenterId
                                ? `(Center ID: ${user.lecturerCenterId})`
                                : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY'}>
                            <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
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
