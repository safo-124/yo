// app/(dashboard)/registry/_components/ManageUsersTab.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  createUserByRegistry,
  updateUserRoleAndAssignmentsByRegistry,
  updateUserPasswordByRegistry,
  deleteUserByRegistry,
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import {
  UserPlus, Edit3, KeyRound, Mail, Users as UsersIcon, Building2, AlertTriangle,
  Loader2, Trash2, Search, XCircle, Briefcase, University, Phone, Banknote,
  LayoutGrid, LayoutList, BookUser, Shield, ChevronDown, Calendar, Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Constants ──────────────────────────────────────────────────────────────────
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900";

const ROLES = [
  { value: "REGISTRY", label: "Registry (Admin)", color: "red", icon: Shield },
  { value: "STAFF_REGISTRY", label: "Staff Registry", color: "amber", icon: Building2 },
  { value: "COORDINATOR", label: "Coordinator", color: "blue", icon: University },
  { value: "LECTURER", label: "Lecturer", color: "violet", icon: BookUser },
];

const ROLE_STYLES = {
  REGISTRY: { bg: "bg-red-500", light: "bg-red-50 text-red-700 border-red-200", darkBadge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-200 dark:border-red-700", accent: "border-l-red-500" },
  STAFF_REGISTRY: { bg: "bg-amber-500", light: "bg-amber-50 text-amber-700 border-amber-200", darkBadge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-800/30 dark:text-amber-200 dark:border-amber-700", accent: "border-l-amber-500" },
  COORDINATOR: { bg: "bg-blue-500", light: "bg-blue-50 text-blue-700 border-blue-200", darkBadge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-700", accent: "border-l-blue-500" },
  LECTURER: { bg: "bg-violet-500", light: "bg-violet-50 text-violet-700 border-violet-200", darkBadge: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/30 dark:text-violet-200 dark:border-violet-700", accent: "border-l-violet-500" },
};

const DESIGNATIONS = [
  { value: "ASSISTANT_LECTURER", label: "Assistant Lecturer" },
  { value: "LECTURER", label: "Lecturer" },
  { value: "SENIOR_LECTURER", label: "Senior Lecturer" },
  { value: "PROFESSOR", label: "Professor" },
  { value: "ADMINISTRATIVE_STAFF", label: "Administrative Staff" },
  { value: "TECHNICAL_STAFF", label: "Technical Staff" },
];

const dialogInputClass = `h-9 sm:h-10 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md ${focusRingClass}`;
const dialogSelectTriggerClass = `${dialogInputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
const dialogSelectContentClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-md shadow-lg";
const dialogLabelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";
const dialogErrorClass = `p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5`;

// ── Helper Functions ───────────────────────────────────────────────────────────
const getRoleBadge = (role) => {
  const style = ROLE_STYLES[role];
  const baseClass = "text-xs px-2 py-0.5 rounded-full font-medium capitalize border whitespace-nowrap";
  if (!style) return <Badge variant="outline" className={`${baseClass} border-slate-300 text-slate-600`}>{role?.toLowerCase() || 'Unknown'}</Badge>;
  return <Badge variant="outline" className={`${baseClass} ${style.darkBadge}`}>{role === 'STAFF_REGISTRY' ? 'Staff Registry' : role?.charAt(0) + role?.slice(1).toLowerCase()}</Badge>;
};

const getDesignationDisplay = (val) => {
  const found = DESIGNATIONS.find(d => d.value === val);
  return found ? found.label : val || 'N/A';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function CenterMultiSelect({ selectedIds = [], onChange, disabled, centers = [] }) {
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
          className={`w-full justify-between ${dialogSelectTriggerClass} ${selectedIds.length === 0 ? "text-slate-400" : ""}`}
          disabled={disabled}>
          <span className="truncate max-w-[calc(100%-2rem)]">
            {selectedIds.length > 0
              ? (selectedIds.length === 1 ? centers.find(c => c.id === selectedIds[0])?.name : `${selectedIds.length} centers selected`)
              : "Select center(s)..."}
          </span>
          <University className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[--radix-popover-trigger-width] p-0 ${dialogSelectContentClass} max-h-60`}>
        <ScrollArea className="max-h-56">
          <Command>
            <CommandInput placeholder="Search centers..." className="h-9 text-xs" />
            <CommandList>
              <CommandEmpty>No centers found.</CommandEmpty>
              <CommandGroup>
                {centers.map((center) => (
                  <CommandItem key={center.id} value={center.name} onSelect={() => toggleCenter(center.id)}
                    className="text-sm flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 py-2">
                    <Checkbox checked={selectedIds.includes(center.id)} className="mr-2 h-4 w-4" />
                    <Label className="cursor-pointer flex-1 font-normal">{center.name}</Label>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function UserCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-700/50 rounded" />
      </div>
    </div>
  );
}

// ── User Card ──────────────────────────────────────────────────────────────────
function UserCard({ user, onEdit, onDelete, onChangePassword, isLoading, registryUserId, isSelected, onSelect, animationDelay = 0 }) {
  const style = ROLE_STYLES[user.role] || {};
  return (
    <Card
      className={cn(
        "group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl",
        "border-l-4", style.accent,
        "hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      {/* Bulk select checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(user.id)}
          className="h-4 w-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity data-[state=checked]:opacity-100"
          aria-label={`Select ${user.name}`}
        />
      </div>

      <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 pl-4">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-slate-100 dark:ring-slate-700">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className={cn("text-white text-sm sm:text-base font-semibold", style.bg)}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
                {user.name}
              </CardTitle>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1 items-center opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onChangePassword(user)}
              disabled={isLoading}
              className={`h-7 w-7 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 ${focusRingClass}`}
              title="Change password">
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(user)}
              disabled={user.role === 'REGISTRY' || isLoading}
              className={`h-7 w-7 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ${focusRingClass}`}
              title="Edit user">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(user)}
              disabled={(user.role === 'REGISTRY' && user.id === registryUserId) || isLoading}
              className={`h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400 ${focusRingClass}`}
              title="Delete user">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0 pb-3 sm:pb-4 px-4 sm:px-5 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Mail className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{user.email}</span>
        </div>
        {user.designation && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" /><span>{getDesignationDisplay(user.designation)}</span>
          </div>
        )}
        {user.role === 'COORDINATOR' && user.coordinatedCenterName && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" /><span>{user.coordinatedCenterName}</span>
          </div>
        )}
        {user.role === 'LECTURER' && user.lecturerCenterName && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <BookUser className="h-3.5 w-3.5 flex-shrink-0" /><span>{user.lecturerCenterName}</span>
          </div>
        )}
        {user.role === 'LECTURER' && user.departmentName && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <UsersIcon className="h-3.5 w-3.5 flex-shrink-0" /><span>{user.departmentName}</span>
          </div>
        )}
        {user.role === 'STAFF_REGISTRY' && user.staffRegistryAssignedCenterNames?.length > 0 && (
          <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
            <University className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{user.staffRegistryAssignedCenterNames.join(', ')}</span>
          </div>
        )}
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" /><span>{user.phoneNumber}</span>
          </div>
        )}
        {user.bankName && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Banknote className="h-3.5 w-3.5 flex-shrink-0" /><span>{user.bankName} - {user.accountNumber}</span>
          </div>
        )}
        {/* Created date */}
        {user.createdAt && (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-2">
            <Calendar className="h-3 w-3 flex-shrink-0" /><span>Joined {formatDate(user.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── User Table Row ─────────────────────────────────────────────────────────────
function UserTableView({ users, onEdit, onDelete, onChangePassword, isLoading, registryUserId, selectedIds, onSelect, onSelectAll }) {
  const allSelected = users.length > 0 && users.every(u => selectedIds.includes(u.id));
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/90">
      <div className="overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <TableHead className="w-10 px-4">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all" className="h-4 w-4" />
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">User</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Designation</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Assignment</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Joined</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, idx) => {
            const style = ROLE_STYLES[user.role] || {};
            const assignment = user.role === 'COORDINATOR' ? user.coordinatedCenterName
              : user.role === 'LECTURER' ? user.lecturerCenterName
              : user.role === 'STAFF_REGISTRY' ? user.staffRegistryAssignedCenterNames?.join(', ')
              : '—';
            return (
              <TableRow
                key={user.id}
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors animate-fade-in-up",
                  selectedIds.includes(user.id) && "bg-blue-50/50 dark:bg-blue-900/10"
                )}
                style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
              >
                <TableCell className="px-4">
                  <Checkbox checked={selectedIds.includes(user.id)} onCheckedChange={() => onSelect(user.id)} className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("text-white text-xs font-semibold", style.bg)}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{user.name}</div>
                      <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{user.email}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{getDesignationDisplay(user.designation)}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm max-w-[200px] truncate">{assignment || '—'}</TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => onChangePassword(user)} disabled={isLoading}
                      className={`h-7 w-7 text-slate-400 hover:text-amber-600 ${focusRingClass}`} title="Change password">
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} disabled={user.role === 'REGISTRY' || isLoading}
                      className={`h-7 w-7 text-slate-400 hover:text-blue-600 ${focusRingClass}`} title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user)}
                      disabled={(user.role === 'REGISTRY' && user.id === registryUserId) || isLoading}
                      className={`h-7 w-7 text-slate-400 hover:text-red-600 ${focusRingClass}`} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

// ── Bulk Action Bar ────────────────────────────────────────────────────────────
function BulkActionBar({ count, onDelete, onClear }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in-up">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
        {count} user{count > 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={onClear}
          className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300">
          Clear
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="h-8 text-xs gap-1.5">
          <Trash2 className="h-3.5 w-3.5" /> Delete Selected
        </Button>
      </div>
    </div>
  );
}

// ── Role-specific Empty States ─────────────────────────────────────────────────
function RoleEmptyState({ role, searchQuery, onClearSearch, onCreateUser }) {
  const roleInfo = ROLES.find(r => r.value === role);
  const style = ROLE_STYLES[role] || {};
  const Icon = roleInfo?.icon || UsersIcon;

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-full mb-4">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No results for &quot;{searchQuery}&quot;</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try a different search term</p>
        <Button variant="link" onClick={onClearSearch} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={cn("p-4 rounded-full mb-4", style.light || "bg-slate-100")}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
        No {roleInfo?.label || role}s yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        {role === 'REGISTRY' && "Registry admins manage the entire system. Add one to get started."}
        {role === 'STAFF_REGISTRY' && "Staff registry users manage claims at assigned centers."}
        {role === 'COORDINATOR' && "Coordinators oversee lecturers and departments at their center."}
        {role === 'LECTURER' && "Lecturers submit teaching claims for their assigned courses."}
      </p>
      <Button onClick={onCreateUser}
        className={`gap-2 bg-violet-700 hover:bg-violet-800 text-white font-medium h-9 px-4 text-sm rounded-lg shadow-sm ${focusRingClass}`}>
        <UserPlus className="h-4 w-4" />Add {roleInfo?.label?.split(' (')[0] || 'User'}
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ══ MAIN COMPONENT ═══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError, registryUserId, totalCenters = 0, roleCounts = {} }) {
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState(ROLES[0].value);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Dialog states
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');

  // Create form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [selectedCenterForNewLecturer, setSelectedCenterForNewLecturer] = useState('');
  const [newStaffRegistryAssignedCenterIds, setNewStaffRegistryAssignedCenterIds] = useState([]);
  const [newBankName, setNewBankName] = useState('');
  const [newBankBranch, setNewBankBranch] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  // Edit form state
  const [actionUser, setActionUser] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserDesignation, setEditUserDesignation] = useState('');
  const [editUserCenterId, setEditUserCenterId] = useState('');
  const [editStaffRegistryAssignedCenterIds, setEditStaffRegistryAssignedCenterIds] = useState([]);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankBranch, setEditBankBranch] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const valid = Array.isArray(initialUsers) ? initialUsers : [];
    setAllUsers(valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [initialUsers]);

  // ── Memos ──────────────────────────────────────────────────────────────────
  const searchFilteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(user => {
      return user.name?.toLowerCase().includes(q)
        || user.email?.toLowerCase().includes(q)
        || user.role?.toLowerCase().includes(q)
        || DESIGNATIONS.find(d => d.value === user.designation)?.label?.toLowerCase().includes(q)
        || user.lecturerCenterName?.toLowerCase().includes(q)
        || user.coordinatedCenterName?.toLowerCase().includes(q)
        || user.departmentName?.toLowerCase().includes(q)
        || user.staffRegistryAssignedCenterNames?.some(n => n?.toLowerCase().includes(q));
    });
  }, [allUsers, searchQuery]);

  const displayedUsers = useMemo(() => {
    return searchFilteredUsers.filter(user => user.role === activeRoleTab);
  }, [searchFilteredUsers, activeRoleTab]);

  // Live role counts (updates when users are added/deleted)
  const liveRoleCounts = useMemo(() => {
    const counts = { REGISTRY: 0, STAFF_REGISTRY: 0, COORDINATOR: 0, LECTURER: 0 };
    allUsers.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });
    return counts;
  }, [allUsers]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetCreateForm = () => {
    setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewConfirmPassword('');
    setNewUserRole(''); setNewUserDesignation('');
    setSelectedCenterForNewLecturer(''); setNewStaffRegistryAssignedCenterIds([]);
    setFormError('');
    setNewBankName(''); setNewBankBranch(''); setNewAccountName(''); setNewAccountNumber(''); setNewPhoneNumber('');
  };

  const resetEditForm = () => {
    setActionUser(null); setEditUserRole(''); setEditUserDesignation('');
    setEditUserCenterId(''); setEditStaffRegistryAssignedCenterIds([]);
    setFormError('');
    setEditBankName(''); setEditBankBranch(''); setEditAccountName(''); setEditAccountNumber(''); setEditPhoneNumber('');
  };

  const resetPasswordChangeForm = () => { setNewPasswordForUser(''); setPasswordFormError(''); };

  const clearSearch = () => setSearchQuery('');

  // Selection
  const toggleSelect = useCallback((id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    const allIds = displayedUsers.map(u => u.id);
    const allSelected = allIds.every(id => selectedUserIds.includes(id));
    setSelectedUserIds(prev => allSelected ? prev.filter(id => !allIds.includes(id)) : [...new Set([...prev, ...allIds])]);
  }, [displayedUsers, selectedUserIds]);

  const clearSelection = () => setSelectedUserIds([]);

  // CRUD
  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("Name, email, password, and role are required."); return;
    }
    if (newUserPassword.trim().length < 6) { setFormError("Password must be at least 6 characters."); return; }
    if (newUserPassword !== newConfirmPassword) { setFormError("Passwords do not match."); return; }
    if (newUserRole === 'LECTURER' && !selectedCenterForNewLecturer) {
      setFormError("Lecturers must be assigned to a center."); return;
    }
    if ((newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') &&
      (!newBankName.trim() || !newBankBranch.trim() || !newAccountName.trim() || !newAccountNumber.trim() || !newPhoneNumber.trim())) {
      setFormError(`For ${newUserRole.toLowerCase()}, bank details and phone number are required.`); return;
    }

    setIsLoading(true);
    const userData = {
      name: newUserName.trim(), email: newUserEmail.trim().toLowerCase(), password: newUserPassword.trim(), role: newUserRole,
      designation: newUserDesignation || null,
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForNewLecturer || null : null,
      bankName: (newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') ? newBankName.trim() || null : null,
      bankBranch: (newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') ? newBankBranch.trim() || null : null,
      accountName: (newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') ? newAccountName.trim() || null : null,
      accountNumber: (newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') ? newAccountNumber.trim() || null : null,
      phoneNumber: (newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') ? newPhoneNumber.trim() || null : null,
    };
    const result = await createUserByRegistry(userData);
    setIsLoading(false);
    if (result.success && result.user) {
      toast.success(`User "${result.user.name}" created successfully!`);
      setAllUsers(prev => [result.user, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsCreateUserDialogOpen(false); resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create user."); toast.error(result.error || "Failed to create user.");
    }
  };

  const handleOpenEditDialog = (user) => {
    setActionUser(user); setEditUserRole(user.role); setEditUserDesignation(user.designation || '');
    setEditUserCenterId(user.lecturerCenterId || '');
    setEditStaffRegistryAssignedCenterIds(user.staffRegistryAssignedCentersData?.map(c => c.id) || []);
    setEditBankName(user.bankName || ''); setEditBankBranch(user.bankBranch || '');
    setEditAccountName(user.accountName || ''); setEditAccountNumber(user.accountNumber || '');
    setEditPhoneNumber(user.phoneNumber || ''); setFormError(''); setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault(); if (!actionUser) return;
    setFormError('');
    if (!editUserRole) { setFormError("Role is required."); return; }
    if (editUserRole === 'LECTURER' && !editUserCenterId) {
      setFormError("Lecturers must be assigned to a center."); return;
    }
    if ((editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') &&
      (!editBankName.trim() || !editBankBranch.trim() || !editAccountName.trim() || !editAccountNumber.trim() || !editPhoneNumber.trim())) {
      setFormError(`For ${editUserRole.toLowerCase()}, bank details and phone number are required.`); return;
    }

    setIsLoading(true);
    const updateData = {
      userId: actionUser.id, newRole: editUserRole, newDesignation: editUserDesignation || null,
      newCenterId: editUserRole === 'LECTURER' ? editUserCenterId || null : null,
      newStaffRegistryCenterIds: editUserRole === 'STAFF_REGISTRY' ? editStaffRegistryAssignedCenterIds : undefined,
      newBankName: (editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') ? editBankName.trim() || null : null,
      newBankBranch: (editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') ? editBankBranch.trim() || null : null,
      newAccountName: (editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') ? editAccountName.trim() || null : null,
      newAccountNumber: (editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') ? editAccountNumber.trim() || null : null,
      newPhoneNumber: (editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') ? editPhoneNumber.trim() || null : null,
    };
    const result = await updateUserRoleAndAssignmentsByRegistry(updateData);
    setIsLoading(false);
    if (result.success && result.user) {
      toast.success(`User "${actionUser.name}" updated successfully!`);
      setAllUsers(prev => prev.map(u => u.id === result.user.id ? { ...u, ...result.user } : u)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsEditUserDialogOpen(false); resetEditForm();
      if (actionUser.role !== result.user.role) setActiveRoleTab(result.user.role);
    } else {
      setFormError(result.error || "Failed to update user."); toast.error(result.error || "Failed to update user.");
    }
  };

  const handleOpenChangePasswordDialog = (user) => {
    setActionUser(user); setPasswordFormError(''); setNewPasswordForUser(''); setIsChangePasswordDialogOpen(true);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!actionUser || !newPasswordForUser.trim()) { setPasswordFormError("New password is required."); return; }
    if (newPasswordForUser.trim().length < 6) { setPasswordFormError("Password must be at least 6 characters."); return; }
    setIsLoading(true); setPasswordFormError('');
    const result = await updateUserPasswordByRegistry({ userId: actionUser.id, newPassword: newPasswordForUser.trim() });
    setIsLoading(false);
    if (result.success) {
      toast.success(`Password for "${actionUser.name}" updated!`);
      setIsChangePasswordDialogOpen(false); resetPasswordChangeForm();
    } else {
      setPasswordFormError(result.error || "Failed to update password."); toast.error(result.error || "Failed.");
    }
  };

  const handleOpenDeleteConfirmation = (user) => { setActionUser(user); setIsDeleteConfirmDialogOpen(true); };

  const handleConfirmDeleteUser = async () => {
    if (!actionUser || !registryUserId) { toast.error("Missing permission."); setIsDeleteConfirmDialogOpen(false); return; }
    setIsLoading(true);
    const result = await deleteUserByRegistry({ userIdToDelete: actionUser.id, registryUserId });
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message || `User "${actionUser.name}" deleted!`);
      setAllUsers(prev => prev.filter(u => u.id !== actionUser.id));
      setSelectedUserIds(prev => prev.filter(id => id !== actionUser.id));
      setIsDeleteConfirmDialogOpen(false); setActionUser(null);
    } else { toast.error(result.error || "Failed to delete user."); }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;
    for (const uid of selectedUserIds) {
      const result = await deleteUserByRegistry({ userIdToDelete: uid, registryUserId });
      if (result.success) {
        successCount++;
        setAllUsers(prev => prev.filter(u => u.id !== uid));
      } else { failCount++; }
    }
    setIsLoading(false);
    setSelectedUserIds([]);
    setIsBulkDeleteDialogOpen(false);
    if (successCount > 0) toast.success(`${successCount} user${successCount > 1 ? 's' : ''} deleted.`);
    if (failCount > 0) toast.error(`${failCount} user${failCount > 1 ? 's' : ''} failed to delete.`);
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Users</h3>
        <p className="text-slate-600 dark:text-slate-400">{fetchError}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          Retry
        </Button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ══ RENDER ═════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8">
      {/* ── Header with stats ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shrink-0">
            <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
              User Management
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{allUsers.length} users</span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">·</span>
              <div className="hidden sm:flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {ROLES.map(r => (
                  <span key={r.value} className="text-xs text-slate-500 dark:text-slate-400">
                    {r.label.split(' (')[0]}: <span className="font-semibold text-slate-700 dark:text-slate-300">{liveRoleCounts[r.value]}</span>
                  </span>
                ))}
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Centers: <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCenters}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text" placeholder="Search users..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-8 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg w-full ${focusRingClass}`}
            />
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600">
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
          {/* View toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <Button variant="ghost" size="icon"
              onClick={() => setViewMode('grid')}
              className={cn("h-8 w-8 rounded-md", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
              title="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon"
              onClick={() => setViewMode('table')}
              className={cn("h-8 w-8 rounded-md", viewMode === 'table' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
              title="Table view">
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>

          {/* Add User */}
          <Dialog open={isCreateUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetCreateForm(); setIsCreateUserDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className={`gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold h-9 px-3 sm:px-4 text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex-shrink-0 ${focusRingClass}`}>
                <UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Add New User</span><span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
              <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
                <DialogTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100 font-semibold">
                  <UserPlus className="h-5 w-5 text-violet-700 dark:text-violet-400" /> Create New User
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Fill in the details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <CardContent className="grid gap-4 py-4 px-6 overflow-y-auto max-h-[calc(80vh-200px)] sm:max-h-[70vh]">
                  <div className="space-y-1.5"><Label htmlFor="newUserName-create" className={dialogLabelClass}>Full Name *</Label><Input id="newUserName-create" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" disabled={isLoading} className={dialogInputClass} /></div>
                  <div className="space-y-1.5"><Label htmlFor="newUserEmail-create" className={dialogLabelClass}>Email *</Label><Input id="newUserEmail-create" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" disabled={isLoading} className={dialogInputClass} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label htmlFor="newUserPassword-create" className={dialogLabelClass}>Password *</Label><Input id="newUserPassword-create" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Min 6 chars" disabled={isLoading} className={dialogInputClass} /></div>
                    <div className="space-y-1.5"><Label htmlFor="newConfirmPassword-create" className={dialogLabelClass}>Confirm *</Label><Input id="newConfirmPassword-create" type="password" value={newConfirmPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} placeholder="Re-enter" disabled={isLoading} className={dialogInputClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className={dialogLabelClass}>Role *</Label><Select value={newUserRole} onValueChange={setNewUserRole} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label className={dialogLabelClass}>Designation</Label><Select value={newUserDesignation} onValueChange={setNewUserDesignation} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{DESIGNATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  {newUserRole === 'LECTURER' && (
                    <div className="space-y-1.5"><Label className={dialogLabelClass}>Assign to Center *</Label><Select value={selectedCenterForNewLecturer} onValueChange={setSelectedCenterForNewLecturer} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                  )}
                  {(newUserRole === 'LECTURER' || newUserRole === 'COORDINATOR') && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label className={dialogLabelClass}>Bank Name *</Label><Input value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder="GCB Bank" disabled={isLoading} className={dialogInputClass} /></div>
                        <div className="space-y-1.5"><Label className={dialogLabelClass}>Bank Branch *</Label><Input value={newBankBranch} onChange={(e) => setNewBankBranch(e.target.value)} placeholder="Winneba" disabled={isLoading} className={dialogInputClass} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label className={dialogLabelClass}>Account Name *</Label><Input value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Name on account" disabled={isLoading} className={dialogInputClass} /></div>
                        <div className="space-y-1.5"><Label className={dialogLabelClass}>Account Number *</Label><Input value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} placeholder="1234567890" disabled={isLoading} className={dialogInputClass} /></div>
                      </div>
                      <div className="space-y-1.5"><Label className={dialogLabelClass}>Phone Number *</Label><Input type="tel" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} placeholder="+233241234567" disabled={isLoading} className={dialogInputClass} /></div>
                    </>
                  )}
                  {newUserRole === 'STAFF_REGISTRY' && (
                    <div className="space-y-1.5"><Label className={dialogLabelClass}>Assign Centers</Label><CenterMultiSelect selectedIds={newStaffRegistryAssignedCenterIds} onChange={setNewStaffRegistryAssignedCenterIds} disabled={isLoading} centers={centers} /></div>
                  )}
                  {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}</div>)}
                </CardContent>
                <DialogFooter className="flex justify-end gap-3 px-6 pb-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-medium shadow ${focusRingClass}`}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────────────── */}
      <BulkActionBar
        count={selectedUserIds.length}
        onDelete={() => setIsBulkDeleteDialogOpen(true)}
        onClear={clearSelection}
      />

      {/* ── Tabs + content ────────────────────────────────────────────────── */}
      {allUsers.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none rounded-xl">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center">
            <UsersIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No users in the system</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">Create the first user to get started.</p>
            <Button onClick={() => setIsCreateUserDialogOpen(true)} className={`gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold h-9 px-5 text-sm rounded-lg shadow-sm ${focusRingClass}`}>
              <UserPlus className="h-4 w-4" /> Create First User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeRoleTab} onValueChange={(v) => { setActiveRoleTab(v); setSelectedUserIds([]); }} className="flex flex-col">
          {/* Tab triggers with counts */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-4 sm:mb-5 flex-shrink-0">
            {ROLES.map(role => (
              <TabsTrigger
                key={role.value} value={role.value}
                className="px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:dark:bg-slate-700 data-[state=active]:dark:text-slate-100 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <span className="truncate">{role.label.split(' (')[0]}</span>
                <span className={cn(
                  "inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold transition-colors",
                  activeRoleTab === role.value
                    ? `${ROLE_STYLES[role.value].bg} text-white`
                    : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                )}>
                  {liveRoleCounts[role.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab panels */}
          {ROLES.map(role => (
            <TabsContent key={role.value} value={role.value} className="mt-0 data-[state=inactive]:hidden">
              {displayedUsers.length === 0 ? (
                <RoleEmptyState
                  role={role.value}
                  searchQuery={searchQuery}
                  onClearSearch={clearSearch}
                  onCreateUser={() => setIsCreateUserDialogOpen(true)}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
                  {displayedUsers.map((user, idx) => (
                    <UserCard
                      key={user.id} user={user}
                      onEdit={handleOpenEditDialog}
                      onDelete={handleOpenDeleteConfirmation}
                      onChangePassword={handleOpenChangePasswordDialog}
                      isLoading={isLoading}
                      registryUserId={registryUserId}
                      isSelected={selectedUserIds.includes(user.id)}
                      onSelect={toggleSelect}
                      animationDelay={idx * 50}
                    />
                  ))}
                </div>
              ) : (
                <UserTableView
                  users={displayedUsers}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteConfirmation}
                  onChangePassword={handleOpenChangePasswordDialog}
                  isLoading={isLoading}
                  registryUserId={registryUserId}
                  selectedIds={selectedUserIds}
                  onSelect={toggleSelect}
                  onSelectAll={toggleSelectAll}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* ══ DIALOGS ═══════════════════════════════════════════════════════════ */}

      {/* Edit User Dialog */}
      {actionUser && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetEditForm(); setIsEditUserDialogOpen(open); }}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100 font-semibold">
                <Edit3 className="h-5 w-5 text-violet-700 dark:text-violet-400" /> Edit: {actionUser.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Update role, assignments, and details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <CardContent className="grid gap-4 py-4 px-6 overflow-y-auto max-h-[calc(80vh-200px)] sm:max-h-[70vh]">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("text-white text-sm font-semibold", ROLE_STYLES[actionUser.role]?.bg || "bg-slate-500")}>
                      {actionUser.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{actionUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{actionUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className={dialogLabelClass}>Role *</Label><Select value={editUserRole} onValueChange={setEditUserRole} disabled={isLoading || actionUser.role === 'REGISTRY'}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{ROLES.filter(r => r.value !== 'REGISTRY' || actionUser.role === 'REGISTRY').map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><Label className={dialogLabelClass}>Designation</Label><Select value={editUserDesignation} onValueChange={setEditUserDesignation} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{DESIGNATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
                {editUserRole === 'LECTURER' && (
                  <div className="space-y-1.5"><Label className={dialogLabelClass}>Center *</Label><Select value={editUserCenterId} onValueChange={setEditUserCenterId} disabled={isLoading}><SelectTrigger className={dialogSelectTriggerClass}><SelectValue placeholder="Select center" /></SelectTrigger><SelectContent className={dialogSelectContentClass}>{centers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                )}
                {(editUserRole === 'LECTURER' || editUserRole === 'COORDINATOR') && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className={dialogLabelClass}>Bank Name *</Label><Input value={editBankName} onChange={(e) => setEditBankName(e.target.value)} placeholder="GCB Bank" disabled={isLoading} className={dialogInputClass} /></div>
                      <div className="space-y-1.5"><Label className={dialogLabelClass}>Bank Branch *</Label><Input value={editBankBranch} onChange={(e) => setEditBankBranch(e.target.value)} placeholder="Winneba" disabled={isLoading} className={dialogInputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className={dialogLabelClass}>Account Name *</Label><Input value={editAccountName} onChange={(e) => setEditAccountName(e.target.value)} placeholder="Name on account" disabled={isLoading} className={dialogInputClass} /></div>
                      <div className="space-y-1.5"><Label className={dialogLabelClass}>Account Number *</Label><Input value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value)} placeholder="1234567890" disabled={isLoading} className={dialogInputClass} /></div>
                    </div>
                    <div className="space-y-1.5"><Label className={dialogLabelClass}>Phone Number *</Label><Input type="tel" value={editPhoneNumber} onChange={(e) => setEditPhoneNumber(e.target.value)} placeholder="+233241234567" disabled={isLoading} className={dialogInputClass} /></div>
                  </>
                )}
                {editUserRole === 'STAFF_REGISTRY' && (
                  <div className="space-y-1.5"><Label className={dialogLabelClass}>Assigned Centers</Label><CenterMultiSelect selectedIds={editStaffRegistryAssignedCenterIds} onChange={setEditStaffRegistryAssignedCenterIds} disabled={isLoading} centers={centers} /></div>
                )}
                {formError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}</div>)}
                <Button type="button" variant="outline" onClick={() => handleOpenChangePasswordDialog(actionUser)}
                  className={`gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 h-9 text-sm rounded-lg ${focusRingClass}`} disabled={isLoading}>
                  <KeyRound className="h-4 w-4" />Change Password
                </Button>
              </CardContent>
              <DialogFooter className="flex justify-end gap-3 px-6 pb-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-medium shadow ${focusRingClass}`}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      {actionUser && (
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={(open) => { if (!open && !isLoading) resetPasswordChangeForm(); setIsChangePasswordDialogOpen(open); }}>
          <DialogContent className="sm:max-w-[420px] bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-3 pt-2 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-slate-100 font-semibold">
                <KeyRound className="h-5 w-5 text-amber-600" /> Change Password
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">Set a new password for {actionUser.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4 px-1">
                <div className="space-y-1.5">
                  <Label htmlFor="newPasswordForUser-change" className={dialogLabelClass}>New Password *</Label>
                  <Input id="newPasswordForUser-change" type="password" value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} placeholder="At least 6 characters" disabled={isLoading} className={dialogInputClass} />
                </div>
                {passwordFormError && (<div className={dialogErrorClass}><AlertTriangle className="h-4 w-4 flex-shrink-0" /> {passwordFormError}</div>)}
              </div>
              <DialogFooter className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isLoading} className={`h-9 px-4 text-sm rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium shadow ${focusRingClass}`}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoading ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      {actionUser && (
        <AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={(open) => { setIsDeleteConfirmDialogOpen(open); if (!open) setActionUser(null); }}>
          <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xl font-semibold">
                <AlertTriangle className="h-5 w-5" /> Delete User
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">
                Delete <span className="font-semibold text-slate-700 dark:text-slate-200">{actionUser.name}</span> ({actionUser.email})? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-3">
              <AlertDialogCancel className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`} disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteUser} disabled={isLoading}
                className={`h-9 px-4 text-sm rounded-lg bg-red-700 text-white hover:bg-red-800 shadow ${focusRingClass}`}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Bulk Delete Confirm Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xl font-semibold">
              <AlertTriangle className="h-5 w-5" /> Delete {selectedUserIds.length} Users
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">
              Are you sure you want to delete {selectedUserIds.length} selected user{selectedUserIds.length > 1 ? 's' : ''}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isLoading}
              className={`h-9 px-4 text-sm rounded-lg bg-red-700 text-white hover:bg-red-800 shadow ${focusRingClass}`}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoading ? 'Deleting...' : `Delete ${selectedUserIds.length} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
