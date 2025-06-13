// app/(dashboard)/registry/_components/ManageUsersTab.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, // Table components are still imported but not used for the main user list display
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  createUserByRegistry,
  updateUserRoleAndAssignmentsByRegistry,
  updateUserPasswordByRegistry,
  deleteUserByRegistry,
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserPlus, User, Edit3, KeyRound, Mail, Shield, BookUser, Users as UsersIcon, Building2, AlertTriangle, Loader2, Trash2, Search, XCircle, Briefcase, University, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Import Shadcn UI Tabs components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900";

const ROLES = [
  { value: "REGISTRY", label: "Registry (Admin)" }, // Prioritize Registry at the top
  { value: "STAFF_REGISTRY", label: "Staff Registry" },
  { value: "COORDINATOR", label: "Coordinator" },
  { value: "LECTURER", label: "Lecturer" },
];

const DESIGNATIONS = [
  { value: "ASSISTANT_LECTURER", label: "Assistant Lecturer" },
  { value: "LECTURER", label: "Lecturer" },
  { value: "SENIOR_LECTURER", label: "Senior Lecturer" },
  { value: "PROFESSOR", label: "Professor" },
];

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError, registryUserId }) {
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState(ROLES[0].value); // State for active tab

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState('');
  const [newStaffRegistryAssignedCenterIds, setNewStaffRegistryAssignedCenterIds] = useState([]);

  const [actionUser, setActionUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserDesignation, setEditUserDesignation] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState('');
  const [editStaffRegistryAssignedCenterIds, setEditStaffRegistryAssignedCenterIds] = useState([]);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');

  useEffect(() => {
    const validInitialUsers = Array.isArray(initialUsers) ? initialUsers : [];
    setAllUsers(validInitialUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [initialUsers]);

  // First filter: by search query (global search)
  const searchFilteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allUsers;
    return allUsers.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      const roleMatch = user.role?.toLowerCase().includes(query);
      const designationLabel = DESIGNATIONS.find(d => d.value === user.designation)?.label;
      const designationMatch = designationLabel?.toLowerCase().includes(query);
      const lecturerCenterMatch = user.lecturerCenterName?.toLowerCase().includes(query);
      const coordinatedCenterMatch = user.coordinatedCenterName?.toLowerCase().includes(query);
      const departmentMatch = user.departmentName?.toLowerCase().includes(query);
      const staffAssignedCentersMatch = user.staffRegistryAssignedCenterNames?.some(name => name?.toLowerCase().includes(query));
      return nameMatch || emailMatch || roleMatch || designationMatch || lecturerCenterMatch || coordinatedCenterMatch || departmentMatch || staffAssignedCentersMatch;
    });
  }, [allUsers, searchQuery]);

  // Second filter: by active role tab
  const displayedUsers = useMemo(() => {
    return searchFilteredUsers.filter(user => user.role === activeRoleTab);
  }, [searchFilteredUsers, activeRoleTab]);

  const resetCreateForm = () => {
    setNewUserName(''); setNewUserEmail(''); setNewUserPassword('');
    setNewUserRole(''); setNewUserDesignation('');
    setSelectedCenterForNewLecturer(''); setNewStaffRegistryAssignedCenterIds([]);
    setFormError('');
  };
  const resetEditForm = () => {
    setActionUser(null); setEditUserRole(''); setEditUserDesignation('');
    setEditUserCenterId(''); setEditStaffRegistryAssignedCenterIds([]);
    setFormError('');
  };
  const resetPasswordChangeForm = () => {
    setNewPasswordForUser(''); setPasswordFormError('');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("Name, email, password, and role are required."); return;
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
      designation: newUserDesignation || null,
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForNewLecturer || null : null,
    };
    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success && result.user) {
      toast.success(`User "${result.user.name}" created successfully!`);
      setAllUsers(prev => [result.user, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsCreateUserDialogOpen(false); resetCreateForm();
      // If user was created in the current active tab, no need to change tab
      // If user was created in a different tab, switch to that tab automatically or keep current.
      // For now, keep current tab.
    } else {
      setFormError(result.error || "Failed to create user."); toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setActionUser(user);
    setEditUserRole(user.role);
    setEditUserDesignation(user.designation || '');
    setEditUserCenterId(user.lecturerCenterId || '');
    setEditStaffRegistryAssignedCenterIds(user.staffRegistryAssignedCentersData?.map(c => c.id) || []);
    setFormError('');
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault(); if (!actionUser) return;
    setFormError('');
    if (!editUserRole) { setFormError("Role is required."); return; }
    if (editUserRole === 'LECTURER' && !editUserCenterId) {
      setFormError("Lecturers must be assigned to a center."); return;
    }
    setIsLoading(true);
    const updateData = {
      userId: actionUser.id,
      newRole: editUserRole,
      newDesignation: editUserDesignation || null,
      newCenterId: editUserRole === 'LECTURER' ? editUserCenterId || null : null,
      newStaffRegistryCenterIds: editUserRole === 'STAFF_REGISTRY' ? editStaffRegistryAssignedCenterIds : undefined,
    };
    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success && result.user) {
      toast.success(`User "${actionUser.name}" updated successfully!`);
      setAllUsers(prevUsers => prevUsers.map(u => u.id === result.user.id ? { ...u, ...result.user } : u)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsEditUserDialogOpen(false); resetEditForm();
      // If user role changed, consider changing active tab to reflect the change
      if (actionUser.role !== result.user.role) {
        setActiveRoleTab(result.user.role);
      }
    } else {
      setFormError(result.error || "Failed to update user."); toast.error(result.error || "Failed to update user.");
    }
  };

  const handleOpenChangePasswordDialog = (user) => { setActionUser(user); setPasswordFormError(''); setNewPasswordForUser(''); setIsChangePasswordDialogOpen(true); };
  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!actionUser || !newPasswordForUser.trim()) { setPasswordFormError("New password is required."); return; }
    if (newPasswordForUser.trim().length < 6) { setPasswordFormError("Password must be at least 6 characters."); return; }
    setIsLoading(true); setPasswordFormError('');
    const result = await updateUserPasswordByRegistry({ userId: actionUser.id, newPassword: newPasswordForUser.trim() });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for user "${actionUser.name}" updated successfully!`);
      setIsChangePasswordDialogOpen(false); resetPasswordChangeForm();
    } else {
      setPasswordFormError(result.error || "Failed to update password."); toast.error(result.error || "Failed to update password.");
    }
  };
  const handleOpenDeleteConfirmation = (user) => { setActionUser(user); setIsDeleteConfirmDialogOpen(true); };
  const handleConfirmDeleteUser = async () => {
    if (!actionUser || !registryUserId) { toast.error("User or Registry permission missing."); setIsDeleteConfirmDialogOpen(false); return; }
    setIsLoading(true);
    const result = await deleteUserByRegistry({ userIdToDelete: actionUser.id, registryUserId });
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message || `User "${actionUser.name}" deleted successfully!`);
      setAllUsers(prev => prev.filter(u => u.id !== actionUser.id));
      setIsDeleteConfirmDialogOpen(false); setActionUser(null);
    } else {
      toast.error(result.error || "Failed to delete user.");
    }
  };

  const getRoleBadge = (role) => {
    const baseClass = "text-xs px-2 py-0.5 rounded-full font-medium capitalize border whitespace-nowrap";
    switch (role) {
      case 'REGISTRY': return <Badge variant="outline" className={`${baseClass} bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-200 dark:border-red-700`}>Registry</Badge>;
      case 'STAFF_REGISTRY': return <Badge variant="outline" className={`${baseClass} bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800/30 dark:text-yellow-200 dark:border-yellow-700`}>Staff Registry</Badge>;
      case 'COORDINATOR': return <Badge variant="outline" className={`${baseClass} bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-700`}>Coordinator</Badge>;
      case 'LECTURER': return <Badge variant="outline" className={`${baseClass} bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/30 dark:text-violet-200 dark:border-violet-700`}>Lecturer</Badge>;
      default: return <Badge variant="outline" className={`${baseClass} border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400`}>{role?.toLowerCase() || 'Unknown'}</Badge>;
    }
  };

  const getDesignationDisplay = (designationValue) => {
    const found = DESIGNATIONS.find(d => d.value === designationValue);
    return found ? found.label : designationValue || 'N/A';
  };

  const clearSearch = () => setSearchQuery('');

  const dialogInputClass = `h-9 sm:h-10 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md ${focusRingClass}`;
  const dialogSelectTriggerClass = `${dialogInputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const dialogSelectContentClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-md shadow-lg";
  const dialogLabelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";
  const dialogErrorClass = `p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5 ${focusRingClass}`;

  const CenterMultiSelect = ({ selectedIds = [], onChange, disabled }) => {
    const [openPopover, setOpenPopover] = useState(false);
    const toggleCenter = (centerId) => {
      const newSelection = selectedIds.includes(centerId)
        ? selectedIds.filter(id => id !== centerId)
        : [...selectedIds, centerId];
      onChange(newSelection);
    };
    return (
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={openPopover}
            className={`w-full justify-between ${dialogSelectTriggerClass} ${selectedIds.length === 0 ? "text-slate-400 dark:text-slate-500" : ""}`}
            disabled={disabled}>
            <span className="truncate max-w-[calc(100%-2rem)]">{selectedIds.length > 0 ? (selectedIds.length === 1 ? centers.find(c => c.id === selectedIds[0])?.name : `${selectedIds.length} centers selected`) : "Select center(s)..."}</span>
            <University className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-[--radix-popover-trigger-width] p-0 ${dialogSelectContentClass} max-h-60`}>
          <ScrollArea className="max-h-56"><Command>
            <CommandInput placeholder="Search centers..." className="h-9 text-xs" />
            <CommandList><CommandEmpty>No centers found.</CommandEmpty><CommandGroup>
              {(centers || []).map((center) => (
                <CommandItem key={center.id} value={center.name} onSelect={() => { toggleCenter(center.id); }} className="text-sm flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 py-2">
                  <Checkbox checked={selectedIds.includes(center.id)} className="mr-2 h-4 w-4" id={`ms-center-select-${center.id}`} />
                  <Label htmlFor={`ms-center-select-${center.id}`} className="cursor-pointer flex-1 font-normal">{center.name}</Label>
                </CommandItem>
              ))}
            </CommandGroup></CommandList>
          </Command></ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Users</h3>
        <p className="text-slate-600 dark:text-slate-400">{fetchError}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-300 flex items-center mb-1">
            <UsersIcon className="mr-3 h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500 flex-shrink-0" />User Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Create, view, and manage user accounts, roles, and designations efficiently.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /></div>
            <Input id="search-users" type="text" placeholder="Search by name, email, role, or assignment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-11 pr-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus-visible:ring-blue-600 rounded-lg h-10 text-base ${focusRingClass}`} />
            {searchQuery && (<Button variant="ghost" size="sm" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 h-full" onClick={clearSearch}><XCircle className="h-4 w-4" /><span className="sr-only">Clear search</span></Button>)}
          </div>
          <Dialog open={isCreateUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) { resetCreateForm(); } setIsCreateUserDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className={`gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold h-10 px-5 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${focusRingClass}`}>
                <UserPlus className="h-4 w-4" /><span>Add New User</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
              <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
                <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl text-blue-800 dark:text-blue-300 font-semibold">
                  <UserPlus className="h-6 w-6 text-violet-700 dark:text-violet-500" /> Create New User
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Fill in the details below to create a new user account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <ScrollArea className="max-h-[calc(80vh-200px)] sm:max-h-[70vh] pr-4 -mr-4">
                  <div className="grid gap-5 py-4">
                    <div className="space-y-1.5"><Label htmlFor="newUserName-create" className={dialogLabelClass}>Full Name <span className="text-red-700">*</span></Label><Input id="newUserName-create" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" disabled={isLoading} className={dialogInputClass} /></div>
                    <div className="space-y-1.5"><Label htmlFor="newUserEmail-create" className={dialogLabelClass}>Email <span className="text-red-700">*</span></Label><Input id="newUserEmail-create" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" disabled={isLoading} className={dialogInputClass} /></div>
                    <div className="space-y-1.5"><Label htmlFor="newUserPassword-create" className={dialogLabelClass}>Password <span className="text-red-700">*</span></Label><Input id="newUserPassword-create" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} /></div>
                    <div className="space-y-1.5"><Label htmlFor="newUserRole-create" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label><Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading}><SelectTrigger id="newUserRole-create" className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{ROLES.map(role => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label htmlFor="newUserDesignation-create" className={dialogLabelClass}>Designation</Label><Select value={newUserDesignation} onValueChange={setNewUserDesignation} disabled={isLoading}><SelectTrigger id="newUserDesignation-create" className={dialogSelectTriggerClass}><SelectValue placeholder="Select designation (optional)" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{DESIGNATIONS.map(des => <SelectItem key={des.value} value={des.value}>{des.label}</SelectItem>)}</SelectContent></Select></div>
                    {newUserRole === 'LECTURER' && (<div className="space-y-1.5"><Label htmlFor="selectedCenterForNewLecturer-create" className={dialogLabelClass}>Assign to Center <span className="text-red-700">*</span></Label><Select value={selectedCenterForNewLecturer} onValueChange={setSelectedCenterForNewLecturer} disabled={isLoading}><SelectTrigger id="selectedCenterForNewLecturer-create" className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.length > 0 ? (centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))) : (<div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No centers available</div>)}</SelectContent></Select></div>)}
                    {newUserRole === 'STAFF_REGISTRY' && (<div className="space-y-1.5"><Label htmlFor="newStaffRegistryAssignedCenterIds-create" className={dialogLabelClass}>Assign Centers (Staff Registry)</Label><CenterMultiSelect selectedIds={newStaffRegistryAssignedCenterIds} onChange={setNewStaffRegistryAssignedCenterIds} disabled={isLoading} /></div>)}
                    {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
                  </div>
                </ScrollArea>
                <DialogFooter className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow ${focusRingClass}`}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1">
        {/* Conditional rendering for overall empty states before tabs */}
        {allUsers.length === 0 && !isLoading ? (
          <Card className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none rounded-xl h-full">
            <CardContent className="h-full py-16 sm:py-20 flex flex-col items-center justify-center text-center">
              <UsersIcon className="h-14 w-14 sm:h-20 sm:w-20 text-slate-400 dark:text-slate-500 mb-6 sm:mb-8" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-blue-800 dark:text-blue-300">No users in the system</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-sm">Start by creating the first user account to populate the system.</p>
              <Button onClick={() => setIsCreateUserDialogOpen(true)} className={`gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold h-10 px-5 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${focusRingClass}`}>
                <UserPlus className="h-4 w-4" /><span>Create First User</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Tabs container for roles
          <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-4 flex-shrink-0">
              {ROLES.map(role => (
                <TabsTrigger
                  key={role.value}
                  value={role.value}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm data-[state=active]:dark:bg-slate-900 data-[state=active]:dark:text-blue-300 data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-md transition-all duration-200"
                >
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content for each role */}
            <div className="flex-1 overflow-hidden"> {/* Ensures this area scrolls if content exceeds height */}
              {ROLES.map(role => (
                <TabsContent key={role.value} value={role.value} className="h-full mt-0 pt-0 data-[state=inactive]:hidden">
                  <ScrollArea className="h-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/90 p-4">
                    {displayedUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                        {searchQuery ? (
                          <>
                            <Search className="h-10 w-10 mb-3" />
                            <p className="font-semibold">No users found for "{searchQuery}" in {role.label}s.</p>
                            <Button variant="link" onClick={clearSearch} className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Clear Search</Button>
                          </>
                        ) : (
                          <>
                            <UsersIcon className="h-10 w-10 mb-3" />
                            <p className="font-semibold">No {role.label.toLowerCase()}s exist.</p>
                            {/* You might add a "Create New User" button here if appropriate for starting a role with no users */}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedUsers.map(user => (
                          <Card key={user.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
                            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-11 w-11">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-base">{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300">{user.name}</CardTitle>
                                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                                  </div>
                                </div>
                                <div className="flex flex-row gap-2 items-center -mt-1 -mr-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)} disabled={user.role === 'REGISTRY' || isLoading} className={`h-8 w-8 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 ${focusRingClass}`}>
                                    <Edit3 className="h-4 w-4" />
                                    <span className="sr-only">Edit user</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteConfirmation(user)} disabled={(user.role === 'REGISTRY' && user.id === registryUserId) || isLoading} className={`h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 ${focusRingClass}`}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete user</span>
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2.5 pt-0 pb-4 px-4 sm:px-5 text-sm">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>{user.email}</p></div>
                              {user.designation && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Briefcase className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Designation: {getDesignationDisplay(user.designation)}</p></div>}
                              {user.role === 'COORDINATOR' && user.coordinatedCenterName && (<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Coordinates: {user.coordinatedCenterName}</p></div>)}
                              {user.role === 'LECTURER' && user.lecturerCenterName && (<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><BookUser className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /><p>Center: {user.lecturerCenterName}</p></div>)}
                              {user.role === 'LECTURER' && user.departmentName && (<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><UsersIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" /> Dept: {user.departmentName}</div>)}
                              {user.role === 'STAFF_REGISTRY' && user.staffRegistryAssignedCenterNames?.length > 0 ? (<div className="flex items-start gap-2 text-slate-600 dark:text-slate-300"><University className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" /><p>Assigned Centers: {user.staffRegistryAssignedCenterNames.join(', ')}</p></div>)
                                : user.role === 'STAFF_REGISTRY' ? (<div className="flex items-start gap-2 text-slate-500 dark:text-slate-400"><University className="h-4 w-4 flex-shrink-0 mt-0.5" /><p>No centers assigned</p></div>) : null}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </div>

      {actionUser && (<Dialog open={isEditUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetEditForm(); setIsEditUserDialogOpen(open); }}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
          <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl text-blue-800 dark:text-blue-300 font-semibold">
              <Edit3 className="h-6 w-6 text-violet-700 dark:text-violet-500" /> Edit User: <span className="font-normal text-slate-700 dark:text-slate-300">{actionUser.name}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Update user details, role, and assignments.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <ScrollArea className="max-h-[calc(80vh-200px)] sm:max-h-[70vh] pr-4 -mr-4">
              <div className="grid gap-5 py-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={actionUser.image || undefined} />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-base">{actionUser.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-base text-slate-800 dark:text-slate-100">{actionUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{actionUser.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="editUserRole-edit" className={dialogLabelClass}>Role <span className="text-red-700">*</span></Label><Select value={editUserRole} onValueChange={setEditUserRole} disabled={isLoading || actionUser.role === 'REGISTRY'}><SelectTrigger id="editUserRole-edit" className={dialogSelectTriggerClass}><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{ROLES.filter(r => r.value !== 'REGISTRY' || actionUser.role === 'REGISTRY').map(role => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label htmlFor="editUserDesignation-edit" className={dialogLabelClass}>Designation</Label><Select value={editUserDesignation} onValueChange={setEditUserDesignation} disabled={isLoading}><SelectTrigger id="editUserDesignation-edit" className={dialogSelectTriggerClass}><SelectValue placeholder="Select designation (optional)" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{DESIGNATIONS.map(des => <SelectItem key={des.value} value={des.value}>{des.label}</SelectItem>)}</SelectContent></Select></div>
                {editUserRole === 'LECTURER' && (<div className="space-y-1.5"><Label htmlFor="editUserCenterId-edit" className={dialogLabelClass}>Assign to Center <span className="text-red-700">*</span></Label><Select value={editUserCenterId} onValueChange={setEditUserCenterId} disabled={isLoading}><SelectTrigger id="editUserCenterId-edit" className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.length > 0 ? (centers.map((center) => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))) : (<div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No centers available</div>)}</SelectContent></Select></div>)}
                {editUserRole === 'STAFF_REGISTRY' && (<div className="space-y-1.5"><Label htmlFor="editStaffRegistryAssignedCenterIds-edit" className={dialogLabelClass}>Assigned Centers (Staff Registry)</Label><CenterMultiSelect selectedIds={editStaffRegistryAssignedCenterIds} onChange={setEditStaffRegistryAssignedCenterIds} disabled={isLoading} /></div>)}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</div>)}
                <Button type="button" variant="outline" onClick={() => handleOpenChangePasswordDialog(actionUser)} className={`gap-2 border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass} h-10 px-5 text-sm rounded-lg`} disabled={isLoading}>
                  <KeyRound className="h-4 w-4" />Change Password
                </Button>
              </div>
            </ScrollArea>
            <DialogFooter className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow ${focusRingClass}`}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>)}

      {actionUser && (<Dialog open={isChangePasswordDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) { resetPasswordForm(); } setIsChangePasswordDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
          <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl text-blue-800 dark:text-blue-300 font-semibold">
              <KeyRound className="h-6 w-6 text-violet-700 dark:text-violet-500" /> Change Password for <span className="font-normal text-slate-700 dark:text-slate-300">{actionUser.name}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Set a new, secure password for this user.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="grid gap-5 py-4 px-1">
              <div className="space-y-1.5">
                <Label htmlFor="newPasswordForUser-change" className={dialogLabelClass}>New Password <span className="text-red-700">*</span></Label>
                <Input id="newPasswordForUser-change" type="password" value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} />
              </div>
              {passwordFormError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {passwordFormError}</div>)}
            </div>
            <DialogFooter className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium shadow ${focusRingClass}`}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>)}

      {actionUser && (<AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={(open) => {setIsDeleteConfirmDialogOpen(open); if(!open) setActionUser(null);}}>
        <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-300 text-xl sm:text-2xl font-semibold">
              <AlertTriangle className="h-6 w-6 text-red-700 dark:text-red-500"/>Confirm User Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">
              Are you sure you want to delete the user <span className="font-semibold text-slate-700 dark:text-slate-200">{actionUser.name}</span> ({actionUser.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:gap-3">
            <AlertDialogCancel className={`h-10 px-5 text-sm rounded-lg ${focusRingClass}`} disabled={isLoading} onClick={() => setActionUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteUser} disabled={isLoading} className={`h-10 px-5 text-sm rounded-lg bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 shadow ${focusRingClass}`}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{isLoading ? 'Deleting...' : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>)}
    </div>
  );
}