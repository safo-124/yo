"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserPlus, User, Edit3, KeyRound, Mail, Shield, BookUser, Users, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError }) {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');

  // Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState('');

  // Edit state
  const [editingUser, setEditingUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState('');
  const [editUserDepartmentId, setEditUserDepartmentId] = useState('');

  // Password state
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
      setFormError("All fields are required.");
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
    } else {
      setFormError(result.error || "Failed to create user.");
      toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditUserRole(user.role);
    setEditUserCenterId(user.lecturerCenterId || '');
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

    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${editingUser.name}" updated successfully!`);
      setIsEditUserDialogOpen(false);
      resetEditForm();
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

  const getRoleBadge = (role) => {
    switch(role) {
      case 'REGISTRY':
        return <Badge variant="destructive">Registry</Badge>;
      case 'COORDINATOR':
        return <Badge variant="secondary">Coordinator</Badge>;
      case 'LECTURER':
        return <Badge>Lecturer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (fetchError) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{fetchError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span>New User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New User
              </DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate permissions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newUserName">Full Name</Label>
                  <Input
                    id="newUserName"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUserEmail">Email</Label>
                  <Input
                    id="newUserEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUserPassword">Password</Label>
                  <Input
                    id="newUserPassword"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUserRole">Role</Label>
                  <Select
                    value={newUserRole}
                    onValueChange={setNewUserRole}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUserRole === 'LECTURER' && (
                  <div className="space-y-2">
                    <Label htmlFor="selectedCenterForNewLecturer">Assign to Center</Label>
                    <Select
                      value={selectedCenterForNewLecturer}
                      onValueChange={setSelectedCenterForNewLecturer}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a center (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {centers.length > 0 ? (
                          centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No centers available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formError && (
                  <div className="p-3 bg-destructive/5 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive">{formError}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update permissions for {editingUser.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={editingUser.image} />
                    <AvatarFallback>
                      {editingUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{editingUser.name}</p>
                    <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserRole">Role</Label>
                  <Select
                    value={editUserRole}
                    onValueChange={setEditUserRole}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editUserRole === 'LECTURER' && (
                  <div className="space-y-2">
                    <Label htmlFor="editUserCenterId">Assign to Center</Label>
                    <Select
                      value={editUserCenterId}
                      onValueChange={setEditUserCenterId}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a center (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {centers.length > 0 ? (
                          centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No centers available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formError && (
                  <div className="p-3 bg-destructive/5 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive">{formError}</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChangePasswordDialog(editingUser)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      {editingUser && (
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                Set a new password for {editingUser.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newPasswordForUser">New Password</Label>
                  <Input
                    id="newPasswordForUser"
                    type="password"
                    value={newPasswordForUser}
                    onChange={(e) => setNewPasswordForUser(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                  />
                </div>
                {passwordFormError && (
                  <div className="p-3 bg-destructive/5 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive">{passwordFormError}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <User className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start by creating your first user account
            </p>
            <Button onClick={() => setIsCreateUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <Table className="w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[25%]">User</TableHead>
                      <TableHead className="w-[20%]">Email</TableHead>
                      <TableHead className="w-[15%]">Role</TableHead>
                      <TableHead className="w-[30%]">Assignment</TableHead>
                      <TableHead className="w-[10%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/10">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {user.role === 'COORDINATOR' && user.coordinatedCenter?.name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>Coordinates {user.coordinatedCenter.name}</span>
                            </div>
                          ) : user.role === 'LECTURER' && user.lecturerCenter?.name ? (
                            <div className="flex items-center gap-2">
                              <BookUser className="h-4 w-4 text-muted-foreground" />
                              <span>{user.lecturerCenter.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                            disabled={user.role === 'REGISTRY'}
                            className="gap-1"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{user.email}</p>
                  </div>
                  {user.role === 'COORDINATOR' && user.coordinatedCenter?.name && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p>Coordinates {user.coordinatedCenter.name}</p>
                    </div>
                  )}
                  {user.role === 'LECTURER' && user.lecturerCenter?.name && (
                    <div className="flex items-center gap-3">
                      <BookUser className="h-4 w-4 text-muted-foreground" />
                      <p>Center: {user.lecturerCenter.name}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenEditDialog(user)}
                      disabled={user.role === 'REGISTRY'}
                    >
                      <Edit3 className="mr-2 h-3.5 w-3.5" />
                      Edit User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}