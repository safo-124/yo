"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added AlertDialog
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  createUserByRegistry,
  updateUserRoleAndAssignmentsByRegistry,
  updateUserPasswordByRegistry,
  deleteUserByRegistry, // Import the delete action
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserPlus, User, Edit3, KeyRound, Mail, Shield, BookUser, Users as UsersIcon, Building2, AlertTriangle, Loader2, Trash2 } from "lucide-react"; // Added Trash2
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError, registryUserId }) { // Added registryUserId prop
  const [users, setUsers] = useState(initialUsers);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false); // State for delete confirmation

  const [isLoading, setIsLoading] = useState(false); // General loading for dialog forms
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState('');

  const [actionUser, setActionUser] = useState(null); // User for Edit, Password Change, or Delete
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState('');

  const [newPasswordForUser, setNewPasswordForUser] = useState('');

  useEffect(() => {
    setUsers(initialUsers.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [initialUsers]);

  const resetCreateForm = () => { /* ... (same as before) ... */ 
    setNewUserName(''); setNewUserEmail(''); setNewUserPassword('');
    setNewUserRole(''); setSelectedCenterForNewLecturer(''); setFormError('');
  };
  const resetEditForm = () => { /* ... (same as before) ... */ 
    setActionUser(null); setEditUserRole('');
    setEditUserCenterId(''); setFormError('');
  };
  const resetPasswordChangeForm = () => { /* ... (same as before) ... */ 
    // setActionUser(null); // Keep actionUser if coming from Edit dialog
    setNewPasswordForUser(''); setPasswordFormError('');
  };

  const handleCreateUser = async (event) => { /* ... (same as before, ensure users state is updated correctly) ... */ 
    event.preventDefault();
    setFormError('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("All fields with * are required."); return;
    }
    if (newUserRole === 'LECTURER' && !selectedCenterForNewLecturer) {
        setFormError("Lecturers must be assigned to a center."); return;
    }
    if (newUserPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters."); return;
    }
    setIsLoading(true);
    const userData = {
      name: newUserName.trim(), email: newUserEmail.trim().toLowerCase(), password: newUserPassword.trim(), role: newUserRole,
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForNewLecturer || null : null,
    };
    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${result.user.name}" created successfully!`);
      const newUserForState = {
        ...result.user,
        lecturerCenterName: newUserRole === 'LECTURER' && selectedCenterForNewLecturer ? centers.find(c => c.id === selectedCenterForNewLecturer)?.name : null,
        coordinatedCenterName: null,
      };
      setUsers(prev => [newUserForState, ...prev].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setIsCreateUserDialogOpen(false); resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create user."); toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => { 
    setActionUser(user); setEditUserRole(user.role);
    setEditUserCenterId(user.lecturerCenterId || user.lecturerCenter?.id || ''); 
    setFormError(''); setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (event) => { /* ... (same as before, ensure users state is updated correctly) ... */ 
    event.preventDefault(); if (!actionUser) return;
    setFormError('');
    if (!editUserRole) { setFormError("Role is required."); return; }
    if (editUserRole === 'LECTURER' && !editUserCenterId) {
        setFormError("Lecturers must be assigned to a center."); return;
    }
    setIsLoading(true);
    const updateData = {
      userId: actionUser.id, newRole: editUserRole,
      newCenterId: editUserRole === 'LECTURER' ? editUserCenterId || null : null,
    };
    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success) {
      toast.success(`User "${actionUser.name}" updated successfully!`);
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === result.user.id 
        ? { ...u, ...result.user, 
            lecturerCenterName: result.user.role === 'LECTURER' && result.user.lecturerCenterId ? centers.find(c => c.id === result.user.lecturerCenterId)?.name : null,
            coordinatedCenterName: result.user.role === 'COORDINATOR' ? result.user.coordinatedCenterName : null // Assuming action returns this if applicable
          } 
        : u
      ).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setIsEditUserDialogOpen(false); resetEditForm();
    } else {
      setFormError(result.error || "Failed to update user."); toast.error(result.error || "Failed to update user.");
    }
  };
  
  const handleOpenChangePasswordDialog = (user) => { 
    setActionUser(user); 
    setPasswordFormError(''); setNewPasswordForUser('');
    setIsChangePasswordDialogOpen(true);
  };

  const handleChangePassword = async (event) => { /* ... (same as before) ... */ 
    event.preventDefault();
    if (!actionUser || !newPasswordForUser.trim()) { setPasswordFormError("New password is required."); return;}
    if (newPasswordForUser.trim().length < 6) { setPasswordFormError("Password must be at least 6 characters."); return; }
    setIsLoading(true); setPasswordFormError('');
    const result = await updateUserPasswordByRegistry({ userId: actionUser.id, newPassword: newPasswordForUser.trim() });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for user "${actionUser.name}" updated successfully!`);
      setIsChangePasswordDialogOpen(false); resetPasswordChangeForm(); setActionUser(null);
    } else {
      setPasswordFormError(result.error || "Failed to update password."); toast.error(result.error || "Failed to update password.");
    }
  };

  const handleOpenDeleteConfirmation = (user) => {
    setActionUser(user);
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!actionUser || !registryUserId) {
      toast.error("User or Registry permission missing.");
      setIsDeleteConfirmDialogOpen(false);
      return;
    }
    setIsLoading(true); // Use general isLoading for this modal action
    const result = await deleteUserByRegistry({ userIdToDelete: actionUser.id, registryUserId });
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message || `User "${actionUser.name}" deleted successfully!`);
      setUsers(prev => prev.filter(u => u.id !== actionUser.id));
      setIsDeleteConfirmDialogOpen(false);
      setActionUser(null);
    } else {
      toast.error(result.error || "Failed to delete user.");
    }
  };


  const getRoleBadge = (role) => { /* ... (same as before) ... */ 
    const baseClass = "text-xs px-2 py-0.5 rounded-full font-medium capitalize border";
    switch(role) {
      case 'REGISTRY': return <Badge variant="outline" className={`${baseClass} bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-200 dark:border-red-700`}>Registry</Badge>;
      case 'COORDINATOR': return <Badge variant="outline" className={`${baseClass} bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-700`}>Coordinator</Badge>;
      case 'LECTURER': return <Badge variant="outline" className={`${baseClass} bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/30 dark:text-violet-200 dark:border-violet-700`}>Lecturer</Badge>;
      default: return <Badge variant="outline" className={`${baseClass} border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400`}>{role || 'Unknown'}</Badge>;
    }
  };

  if (fetchError) { /* ... (same as before) ... */ 
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-white dark:bg-slate-900">
        <Card className="w-full max-w-md bg-red-50 dark:bg-red-800/20 border-red-300 dark:border-red-700/50 shadow-lg rounded-lg">
          <CardHeader className="flex flex-row items-center space-x-3 p-4 sm:p-5"><Shield className="h-6 w-6 text-red-700 dark:text-red-400 flex-shrink-0" /><CardTitle className="text-red-800 dark:text-red-200 text-lg font-semibold">Error Loading User Data</CardTitle></CardHeader>
          <CardContent className="p-4 sm:p-5"><p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p></CardContent>
        </Card>
      </div>
    );
  }

  const dialogInputClass = `h-9 sm:h-10 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${focusRingClass}`;
  const dialogSelectTriggerClass = `${dialogInputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const dialogSelectContentClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50";
  const dialogLabelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";
  const dialogErrorClass = `p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5 ${focusRingClass}`;

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-1">
        <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                <UsersIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-violet-700 dark:text-violet-500 flex-shrink-0" />
                User Management
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Create, view, and manage user accounts and roles.</p>
        </div>
        <Dialog open={isCreateUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) { resetCreateForm(); } setIsCreateUserDialogOpen(open); }}>
          {/* ... Create User Dialog (same as before) ... */}
          <DialogTrigger asChild>
            <Button className={`gap-1.5 sm:gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm shadow-md hover:shadow-lg ${focusRingClass}`}>
              <UserPlus className="h-4 w-4" />
              <span>New User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 pt-1 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
                <UserPlus className="h-5 w-5 text-violet-700 dark:text-violet-500" /> Create New User
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Add a new user to the system with appropriate permissions.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <ScrollArea className="max-h-[calc(80vh-160px)] sm:max-h-[65vh] pr-3 -mr-3"><div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label htmlFor="newUserName" className={dialogLabelClass}>Full Name <span className="text-red-700">*</span></Label><Input id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" disabled={isLoading} className={dialogInputClass} /></div>
                <div className="space-y-1.5"><Label htmlFor="newUserEmail" className={dialogLabelClass}>Email <span className="text-red-700">*</span></Label><Input id="newUserEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" disabled={isLoading} className={dialogInputClass} /></div>
                <div className="space-y-1.5"><Label htmlFor="newUserPassword" className={dialogLabelClass}>Password <span className="text-red-700">*</span></Label><Input id="newUserPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} /></div>
                <div className="space-y-1.5"><Label htmlFor="newUserRole" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label><Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}><SelectItem value="COORDINATOR" className="focus:bg-slate-100 dark:focus:bg-slate-700">Coordinator</SelectItem><SelectItem value="LECTURER" className="focus:bg-slate-100 dark:focus:bg-slate-700">Lecturer</SelectItem></SelectContent></Select></div>
                {newUserRole === 'LECTURER' && (<div className="space-y-1.5"><Label htmlFor="selectedCenterForNewLecturer" className={dialogLabelClass}>Assign to Center <span className="text-red-700">*</span></Label><Select value={selectedCenterForNewLecturer} onValueChange={setSelectedCenterForNewLecturer} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.length > 0 ? (centers.map((center) => (<SelectItem key={center.id} value={center.id} className="focus:bg-slate-100 dark:focus:bg-slate-700">{center.name}</SelectItem>))) : ( <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No centers available</div> )}</SelectContent></Select></div>)}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
              </div></ScrollArea>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Creating..." : "Create User"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {actionUser && ( // Changed from editingUser to actionUser for Edit Dialog
        <Dialog open={isEditUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetEditForm(); setIsEditUserDialogOpen(open); }}>
          {/* ... Edit User Dialog (same as before, but use actionUser) ... */}
          <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 pt-1 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300"><Edit3 className="h-5 w-5 text-violet-700 dark:text-violet-500" /> Edit User: <span className="font-normal text-slate-700 dark:text-slate-300">{actionUser.name}</span></DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Update role and assignments.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <ScrollArea className="max-h-[calc(80vh-200px)] sm:max-h-[70vh] pr-3 -mr-3"><div className="grid gap-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700"><Avatar className="h-10 w-10"><AvatarImage src={actionUser.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-base">{actionUser.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar><div><p className="font-medium text-sm text-slate-800 dark:text-slate-100">{actionUser.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{actionUser.email}</p></div></div>
                <div className="space-y-1.5"><Label htmlFor="editUserRole" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label><Select value={editUserRole} onValueChange={setEditUserRole} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}><SelectItem value="COORDINATOR" className="focus:bg-slate-100 dark:focus:bg-slate-700">Coordinator</SelectItem><SelectItem value="LECTURER" className="focus:bg-slate-100 dark:focus:bg-slate-700">Lecturer</SelectItem></SelectContent></Select></div>
                {editUserRole === 'LECTURER' && (<div className="space-y-1.5"><Label htmlFor="editUserCenterId" className={dialogLabelClass}>Assign to Center <span className="text-red-700">*</span></Label><Select value={editUserCenterId} onValueChange={setEditUserCenterId} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.length > 0 ? (centers.map((center) => (<SelectItem key={center.id} value={center.id} className="focus:bg-slate-100 dark:focus:bg-slate-700">{center.name}</SelectItem>))) : ( <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No centers available</div> )}</SelectContent></Select></div>)}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
                <Button type="button" variant="outline" onClick={() => handleOpenChangePasswordDialog(actionUser)} className={`gap-2 border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass} h-9 sm:h-10 text-xs sm:text-sm`} disabled={isLoading}><KeyRound className="h-4 w-4" />Change Password</Button>
              </div></ScrollArea>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {actionUser && ( // Changed from editingUser to actionUser for Password Dialog
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) { resetPasswordChangeForm(); /*setActionUser(null) if desired here*/ } setIsChangePasswordDialogOpen(open); }}>
          {/* ... Change Password Dialog (same as before, but use actionUser) ... */}
          <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 pt-1 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300"><KeyRound className="h-5 w-5 text-violet-700 dark:text-violet-500" /> Change Password for <span className="font-normal text-slate-700 dark:text-slate-300">{actionUser.name}</span></DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Set a new password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4 px-1"><div className="space-y-1.5"><Label htmlFor="newPasswordForUser" className={dialogLabelClass}>New Password <span className="text-red-700">*</span></Label><Input id="newPasswordForUser" type="password" value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} /></div>
                {passwordFormError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {passwordFormError}</div>)}
              </div>
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`h-9 text-xs sm:h-10 sm:text-sm bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium ${focusRingClass}`}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Updating..." : "Update Password"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {actionUser && (
        <AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-300 text-lg sm:text-xl">
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-500"/>
                Confirm User Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">
                Are you sure you want to delete the user <span className="font-semibold text-slate-700 dark:text-slate-200">{actionUser.name}</span> ({actionUser.email})? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 gap-2 sm:gap-2.5">
              <AlertDialogCancel 
                className={`h-9 text-xs sm:h-10 sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}
                disabled={isLoading}
                onClick={() => setActionUser(null)} // Clear actionUser on cancel
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteUser}
                disabled={isLoading}
                className={`h-9 text-xs sm:h-10 sm:text-sm bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 ${focusRingClass}`}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {isLoading ? 'Deleting...' : 'Confirm Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}


      {users.length === 0 && !isLoading ? (
        /* ... No users found card (same as before) ... */
        <Card className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 mt-6 sm:mt-8 shadow-none rounded-lg">
          <CardContent className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <UsersIcon className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 mb-5 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-800 dark:text-blue-300">No users found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-xs">Start by creating your first user account using the "New User" button above.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block pt-4">
            <Card className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
              <ScrollArea className="h-auto max-h-[calc(100vh-340px)]">
                <Table className="w-full min-w-[900px]"> 
                  <TableHeader className="bg-slate-100/90 dark:bg-slate-700/70 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-b-slate-200 dark:border-b-slate-600">
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-2.5 px-4 whitespace-nowrap">User</TableHead>
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-2.5 px-4 whitespace-nowrap">Email</TableHead>
                      <TableHead className="w-[15%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-2.5 px-4 whitespace-nowrap">Role</TableHead>
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-2.5 px-4 whitespace-nowrap">Assignment</TableHead>
                      <TableHead className="w-[10%] text-right text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-2.5 px-4 whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                        {/* ... TableCells as before, using user.coordinatedCenterName and user.lecturerCenterName ... */}
                        <TableCell className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={user.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-sm">{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar><span className="font-medium text-sm text-slate-900 dark:text-slate-100">{user.name}</span></div></TableCell>
                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap"><div className="flex items-center gap-2"> <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /> {user.email}</div></TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{user.role === 'COORDINATOR' && user.coordinatedCenterName ? (<div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><span>{user.coordinatedCenterName}</span></div>) : user.role === 'LECTURER' && user.lecturerCenterName ? (<div className="flex items-center gap-2"><BookUser className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><span>{user.lecturerCenterName}</span></div>) : (<span className="text-slate-400 dark:text-slate-500 italic">Not assigned</span>)}</TableCell>
                        <TableCell className="text-right px-4 py-3 whitespace-nowrap space-x-1.5">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY' || isLoading} className={`h-8 px-2.5 gap-1 text-xs border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}><Edit3 className="h-3.5 w-3.5" /><span>Edit</span></Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenDeleteConfirmation(user)} disabled={user.role === 'REGISTRY' || isLoading} className={`h-8 px-2.5 gap-1 text-xs border-red-500 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-800/30 focus-visible:ring-red-500 ${focusRingClass}`}><Trash2 className="h-3.5 w-3.5" /><span>Delete</span></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 pt-4">
            {users.map((user) => (
              <Card key={user.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
                <CardHeader className="pb-3 pt-4 px-3 sm:px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarImage src={user.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200">{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                        <div>
                            <CardTitle className="text-base font-semibold text-blue-800 dark:text-blue-300">{user.name}</CardTitle>
                            <div className="mt-1">{getRoleBadge(user.role)}</div>
                        </div>
                    </div>
                    {/* Actions for mobile card */}
                    <div className="flex flex-col space-y-1.5 items-end -mt-1 -mr-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY' || isLoading} className={`h-7 w-7 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 ${focusRingClass}`}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteConfirmation(user)} disabled={user.role === 'REGISTRY' || isLoading} className={`h-7 w-7 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 ${focusRingClass}`}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 pb-3 px-3 sm:px-4 text-xs">
                  {/* ... Mobile card content as before, using user.coordinatedCenterName and user.lecturerCenterName ... */}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>{user.email}</p></div>
                  {user.role === 'COORDINATOR' && user.coordinatedCenterName && (<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Coordinates: {user.coordinatedCenterName}</p></div>)}
                  {user.role === 'LECTURER' && user.lecturerCenterName && (<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><BookUser className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Center: {user.lecturerCenterName}</p></div>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}