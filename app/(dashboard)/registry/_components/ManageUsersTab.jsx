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
import { UserPlus, User, Edit3, KeyRound, Mail, Shield, BookUser, Users, Building2, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Color palette: Red-800, Blue-800, Violet-800, White
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError }) {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState('');
  // const [editUserDepartmentId, setEditUserDepartmentId] = useState(''); // Not used in current form

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
    // setEditUserDepartmentId('');
    setFormError('');
  };

  const resetPasswordChangeForm = () => {
    setNewPasswordForUser('');
    setPasswordFormError('');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("All fields are required."); return;
    }
    if (newUserPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters."); return;
    }
    setIsLoading(true);
    const userData = {
      name: newUserName.trim(), email: newUserEmail.trim(), password: newUserPassword.trim(), role: newUserRole,
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForNewLecturer || null : null,
    };
    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${result.user.name}" created successfully!`);
      setUsers(prev => [result.user, ...prev]);
      setIsCreateUserDialogOpen(false); resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create user."); toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user); setEditUserRole(user.role);
    setEditUserCenterId(user.lecturerCenterId || '');
    // setEditUserDepartmentId(user.departmentId || '');
    setFormError(''); setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault(); if (!editingUser) return;
    setFormError('');
    if (!editUserRole) {
      setFormError("Role is required."); return;
    }
    setIsLoading(true);
    const updateData = {
      userId: editingUser.id, newRole: editUserRole,
      newCenterId: editUserRole === 'LECTURER' ? editUserCenterId || null : null,
      // newDepartmentId: editUserRole === 'LECTURER' ? editUserDepartmentId || null : null, // Uncomment if department is part of edit
    };
    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${editingUser.name}" updated successfully!`);
      setUsers(prevUsers => prevUsers.map(u => u.id === result.user.id ? result.user : u));
      setIsEditUserDialogOpen(false); resetEditForm();
    } else {
      setFormError(result.error || "Failed to update user."); toast.error(result.error || "Failed to update user.");
    }
  };

  const handleOpenChangePasswordDialog = (user) => {
    setEditingUser(user); 
    setPasswordFormError(''); setNewPasswordForUser('');
    setIsChangePasswordDialogOpen(true);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!editingUser || !newPasswordForUser.trim()) {
      setPasswordFormError("New password is required."); return;
    }
    if (newPasswordForUser.trim().length < 6) {
      setPasswordFormError("Password must be at least 6 characters."); return;
    }
    setIsLoading(true); setPasswordFormError('');
    const result = await updateUserPasswordByRegistry({ userId: editingUser.id, newPassword: newPasswordForUser.trim() });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for user "${editingUser.name}" updated successfully!`);
      setIsChangePasswordDialogOpen(false); resetPasswordChangeForm();
    } else {
      setPasswordFormError(result.error || "Failed to update password."); toast.error(result.error || "Failed to update password.");
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'REGISTRY':
        return <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-200 dark:border-red-700 hover:bg-red-100 text-xs">Registry</Badge>;
      case 'COORDINATOR':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-100 text-xs">Coordinator</Badge>;
      case 'LECTURER':
        return <Badge className="bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/30 dark:text-violet-200 dark:border-violet-700 hover:bg-violet-100 text-xs">Lecturer</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400 text-xs">{role}</Badge>;
    }
  };

  if (fetchError) {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-white dark:bg-slate-900">
        <Card className="w-full max-w-md bg-red-50 dark:bg-red-800/20 border-red-300 dark:border-red-700/50 shadow-lg rounded-lg">
          <CardHeader className="flex flex-row items-center space-x-3">
            <Shield className="h-6 w-6 text-red-700 dark:text-red-400" />
            <CardTitle className="text-red-800 dark:text-red-200 text-lg">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{fetchError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dialogInputClass = `bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${focusRingClass}`;
  const dialogSelectTriggerClass = `bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-blue-600 text-slate-900 dark:text-slate-50 data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500 ${focusRingClass}`;
  const dialogSelectContentClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50";
  const dialogLabelClass = "font-medium text-slate-700 dark:text-slate-300";
  const dialogErrorClass = "p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-1">
        <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                <Users className="mr-2 h-6 w-6 text-violet-700 dark:text-violet-500" />
                User Management
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Create, view, and manage user accounts and roles.</p>
        </div>
        <Dialog open={isCreateUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetCreateForm(); setIsCreateUserDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className={`gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm shadow-md hover:shadow-lg ${focusRingClass}`}>
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>New User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
                <UserPlus className="h-5 w-5 text-violet-700 dark:text-violet-500" />
                Create New User
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Add a new user to the system with appropriate permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                <div className="space-y-1.5">
                  <Label htmlFor="newUserName" className={dialogLabelClass}>Full Name <span className="text-red-700">*</span></Label>
                  <Input id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" disabled={isLoading} className={dialogInputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newUserEmail" className={dialogLabelClass}>Email <span className="text-red-700">*</span></Label>
                  <Input id="newUserEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" disabled={isLoading} className={dialogInputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newUserPassword" className={dialogLabelClass}>Password <span className="text-red-700">*</span></Label>
                  <Input id="newUserPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newUserRole" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading}>
                    <SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent className={dialogSelectContentClass}>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUserRole === 'LECTURER' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="selectedCenterForNewLecturer" className={dialogLabelClass}>Assign to Center</Label>
                    <Select value={selectedCenterForNewLecturer} onValueChange={setSelectedCenterForNewLecturer} disabled={isLoading}>
                      <SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center (optional)" /></SelectTrigger>
                      <SelectContent className={dialogSelectContentClass}>
                        {centers.length > 0 ? (
                          centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))
                        ) : ( <div className="px-2 py-1.5 text-sm text-slate-500 dark:text-slate-400">No centers available</div> )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
              </div>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Creating..." : "Create User"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {editingUser && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetEditForm(); setIsEditUserDialogOpen(open); }}>
          <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
                <Edit3 className="h-5 w-5 text-violet-700 dark:text-violet-500" /> Edit User
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Update permissions for {editingUser.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <Avatar className="h-10 w-10"><AvatarImage src={editingUser.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200">{editingUser.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{editingUser.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{editingUser.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editUserRole" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label>
                  <Select value={editUserRole} onValueChange={setEditUserRole} disabled={isLoading}>
                    <SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent className={dialogSelectContentClass}>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editUserRole === 'LECTURER' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="editUserCenterId" className={dialogLabelClass}>Assign to Center</Label>
                    <Select value={editUserCenterId} onValueChange={setEditUserCenterId} disabled={isLoading}>
                      <SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center (optional)" /></SelectTrigger>
                      <SelectContent className={dialogSelectContentClass}>
                        {centers.length > 0 ? (
                          centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))
                        ) : ( <div className="px-2 py-1.5 text-sm text-slate-500 dark:text-slate-400">No centers available</div> )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
                <Button type="button" variant="outline" onClick={() => handleOpenChangePasswordDialog(editingUser)} className={`gap-2 border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass}`} disabled={isLoading}><KeyRound className="h-4 w-4" />Change Password</Button>
              </div>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {editingUser && (
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetPasswordChangeForm(); setIsChangePasswordDialogOpen(open); }}>
          <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
                <KeyRound className="h-5 w-5 text-violet-700 dark:text-violet-500" /> Change Password
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Set a new password for {editingUser.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4 px-1">
                <div className="space-y-1.5">
                  <Label htmlFor="newPasswordForUser" className={dialogLabelClass}>New Password <span className="text-red-700">*</span></Label>
                  <Input id="newPasswordForUser" type="password" value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} />
                </div>
                {passwordFormError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {passwordFormError}</div>)}
              </div>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Updating..." : "Update Password"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {users.length === 0 && !isLoading ? (
        <Card className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 mt-6 sm:mt-8 shadow-none">
          <CardContent className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 mb-5 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-800 dark:text-blue-300">No users found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-xs">Start by creating your first user account using the button above.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block pt-4">
            <Card className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
              <ScrollArea className="h-auto max-h-[calc(100vh-280px)]">
                {/* ADDED min-w-* class for horizontal scroll AND whitespace-nowrap to cells */}
                <Table className="w-full min-w-[900px]"> 
                  <TableHeader className="bg-slate-100/80 dark:bg-slate-700/60 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-b-slate-200 dark:border-b-slate-700">
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4 whitespace-nowrap">User</TableHead>
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4 whitespace-nowrap">Email</TableHead>
                      <TableHead className="w-[15%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4 whitespace-nowrap">Role</TableHead>
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4 whitespace-nowrap">Assignment</TableHead>
                      <TableHead className="w-[10%] text-right text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4 whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors">
                        <TableCell className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9"><AvatarImage src={user.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-sm">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-2"> <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" /> {user.email}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {user.role === 'COORDINATOR' && user.coordinatedCenter?.name ? (<div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span>{user.coordinatedCenter.name}</span></div>)
                          : user.role === 'LECTURER' && user.lecturerCenter?.name ? (<div className="flex items-center gap-2"><BookUser className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span>{user.lecturerCenter.name}</span></div>)
                          : (<span className="text-slate-400 dark:text-slate-500 italic">Not assigned</span>)}
                        </TableCell>
                        <TableCell className="text-right px-4 py-3 whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY'} className={`gap-1 text-xs border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}><Edit3 className="h-3.5 w-3.5" /><span>Edit</span></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>

          <div className="md:hidden space-y-3 pt-4">
            {users.map((user) => (
              <Card key={user.id} className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarImage src={user.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                        <div>
                            <CardTitle className="text-base font-semibold text-blue-800 dark:text-blue-300">{user.name}</CardTitle>
                            <div className="mt-1">{getRoleBadge(user.role)}</div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY'} className={`text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 ${focusRingClass}`}><Edit3 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0 pb-4 px-4 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300"><Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>{user.email}</p></div>
                  {user.role === 'COORDINATOR' && user.coordinatedCenter?.name && (<div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300"><Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Coordinates: {user.coordinatedCenter.name}</p></div>)}
                  {user.role === 'LECTURER' && user.lecturerCenter?.name && (<div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300"><BookUser className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Center: {user.lecturerCenter.name}</p></div>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}