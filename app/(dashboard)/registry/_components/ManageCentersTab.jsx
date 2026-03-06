// app/(dashboard)/registry/_components/ManageCentersTab.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  createCenter, deleteCenterByRegistry, getAvailableDepartments,
  assignDepartmentsToCenter, updateCenter, unassignDepartmentsFromCenter
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import {
  PlusCircle, Building2, UserRound, Mail, CalendarDays, AlertTriangle, Loader2,
  Trash2, Edit3, Search, XCircle, Users, ShieldCheck, Plus,
  LayoutGrid, LayoutList, BookOpen, GraduationCap, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────────
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-background";

const DESIGNATIONS_DISPLAY_MAP = {
  ASSISTANT_LECTURER: "Asst. Lecturer", LECTURER: "Lecturer", SENIOR_LECTURER: "Snr. Lecturer",
  PROFESSOR: "Professor", ADMINISTRATIVE_STAFF: "Admin. Staff", TECHNICAL_STAFF: "Tech. Staff",
};
const getDesignationDisplay = (v) => DESIGNATIONS_DISPLAY_MAP[v] || v || null;

// Rotating department badge colors
const DEPT_COLORS = [
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700",
  "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700",
  "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700",
  "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-700",
  "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-700",
];

const getDeptColor = (index) => DEPT_COLORS[index % DEPT_COLORS.length];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const dialogInputClass = `h-9 sm:h-10 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md ${focusRingClass}`;
const dialogLabelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";

// ── Center Card ────────────────────────────────────────────────────────────────
function CenterCard({ center, onEdit, onDelete, isLoading, animationDelay = 0 }) {
  return (
    <Card
      className={cn(
        "group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl",
        "border-l-4 border-l-violet-500",
        "hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-800/30">
              <Building2 className="h-5 w-5 text-violet-700 dark:text-violet-400" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {center.name}
            </CardTitle>
          </div>
          {/* Inline actions — visible on hover */}
          <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onEdit(center)}
              className={`h-7 w-7 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ${focusRingClass}`}
              title="Edit center">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(center)}
              disabled={isLoading}
              className={`h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400 ${focusRingClass}`}
              title="Delete center">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 pb-4 px-5 text-sm">
        {/* Coordinator */}
        <div className="flex items-center gap-3">
          {center.coordinator ? (
            <>
              <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-700">
                <AvatarImage src={center.coordinator.image || undefined} />
                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                  {center.coordinator.name?.match(/\b(\w)/g)?.join('').toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm truncate">{center.coordinator.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{center.coordinator.email}</p>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">No coordinator assigned</span>
          )}
        </div>

        {/* Departments */}
        <div>
          {center.departments && center.departments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {center.departments.map((dept, idx) => (
                <Badge key={dept.id} variant="outline"
                  className={cn("text-[11px] px-2 py-0.5 font-normal border", getDeptColor(idx))}>
                  {dept.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No departments</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1" title="Lecturers">
            <GraduationCap className="h-3.5 w-3.5" /> {center.lecturerCount ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Departments">
            <BookOpen className="h-3.5 w-3.5" /> {center.departmentCount ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Staff Registry">
            <ShieldCheck className="h-3.5 w-3.5" /> {center.staffRegistryCount ?? 0}
          </span>
        </div>

        {/* Created date */}
        {center.createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(center.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Center Table View ──────────────────────────────────────────────────────────
function CenterTableView({ centers, onEdit, onDelete, isLoading }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/90">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <TableHead className="w-12 px-3" />
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Center</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Coordinator</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Departments</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-center">Stats</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-center">Created</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map((center, idx) => (
            <TableRow key={center.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}>
              <TableCell className="px-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-800/30 inline-flex">
                  <Building2 className="h-4 w-4 text-violet-700 dark:text-violet-400" />
                </div>
              </TableCell>
              <TableCell className="font-medium text-slate-800 dark:text-slate-100 text-sm">{center.name}</TableCell>
              <TableCell>
                {center.coordinator ? (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                        {center.coordinator.name?.match(/\b(\w)/g)?.join('').toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{center.coordinator.name}</p>
                      <p className="text-xs text-slate-400">{center.coordinator.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not Assigned</span>
                )}
              </TableCell>
              <TableCell>
                {center.departments?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {center.departments.map((dept, di) => (
                      <Badge key={dept.id} variant="outline"
                        className={cn("text-[10px] px-1.5 py-0.5 font-normal border", getDeptColor(di))}>
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">None</span>
                )}
              </TableCell>
              <TableCell className="text-center text-xs text-slate-600 dark:text-slate-400">
                <div className="flex flex-col gap-0.5">
                  <span title="Lecturers"><GraduationCap className="inline h-3 w-3 mr-0.5 opacity-70" />{center.lecturerCount ?? 0}</span>
                  <span title="Departments"><BookOpen className="inline h-3 w-3 mr-0.5 opacity-70" />{center.departmentCount ?? 0}</span>
                  <span title="Staff"><ShieldCheck className="inline h-3 w-3 mr-0.5 opacity-70" />{center.staffRegistryCount ?? 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-center text-xs text-slate-500">{formatDate(center.createdAt)}</TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(center)}
                    className={`h-7 w-7 text-slate-400 hover:text-blue-600 ${focusRingClass}`} title="Edit">
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(center)}
                    disabled={isLoading}
                    className={`h-7 w-7 text-slate-400 hover:text-red-600 ${focusRingClass}`} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ searchQuery, onClearSearch, onCreateCenter }) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-full mb-4">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No results for &quot;{searchQuery}&quot;</p>
        <p className="text-sm text-slate-500 mb-4">Try a different search term</p>
        <Button variant="link" onClick={onClearSearch} className="text-blue-600 hover:text-blue-800">Clear Search</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-5 bg-violet-50 dark:bg-violet-900/20 rounded-full mb-5">
        <Building2 className="h-12 w-12 text-violet-400 dark:text-violet-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No study centers yet</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        Create your first center to begin organizing academic programs, departments, and coordinators.
      </p>
      <Button onClick={onCreateCenter}
        className={`gap-2 bg-violet-700 hover:bg-violet-800 text-white font-medium h-9 px-4 text-sm rounded-lg shadow-sm ${focusRingClass}`}>
        <PlusCircle className="h-4 w-4" /> Create First Center
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ══ MAIN COMPONENT ═══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageCentersTab({ initialCenters = [], potentialCoordinators = [], currentUserId, stats = {} }) {
  const [allCenters, setAllCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [createAvailableDepartments, setCreateAvailableDepartments] = useState([]);
  const [createSelectedDepartments, setCreateSelectedDepartments] = useState([]);
  const [isLoadingCreateDepartments, setIsLoadingCreateDepartments] = useState(false);

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [editCenterName, setEditCenterName] = useState('');
  const [editSelectedCoordinatorId, setEditSelectedCoordinatorId] = useState('');
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editAvailableDepartments, setEditAvailableDepartments] = useState([]);
  const [editSelectedDepartments, setEditSelectedDepartments] = useState([]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const valid = Array.isArray(initialCenters) ? initialCenters : [];
    setAllCenters([...valid].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
  }, [initialCenters]);

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filteredCenters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allCenters;
    return allCenters.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.coordinator?.name?.toLowerCase().includes(q) ||
      c.coordinator?.email?.toLowerCase().includes(q) ||
      c.departments?.some(d => d.name?.toLowerCase().includes(q))
    );
  }, [allCenters, searchQuery]);

  // Live stats
  const liveStats = useMemo(() => ({
    totalCenters: allCenters.length,
    totalLecturers: allCenters.reduce((s, c) => s + (c.lecturerCount || 0), 0),
    totalDepartments: allCenters.reduce((s, c) => s + (c.departmentCount || 0), 0),
    totalStaffRegistry: allCenters.reduce((s, c) => s + (c.staffRegistryCount || 0), 0),
  }), [allCenters]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const clearSearch = () => setSearchQuery('');

  const resetCreateForm = () => {
    setNewCenterName(''); setSelectedCoordinatorId('');
    setCreateSelectedDepartments([]); setCreateAvailableDepartments([]); setFormError('');
  };

  const resetEditForm = () => {
    setEditingCenter(null); setEditCenterName(''); setEditSelectedCoordinatorId('');
    setEditSelectedDepartments([]); setEditAvailableDepartments([]); setFormError('');
  };

  const fetchDepartmentsForCreate = async () => {
    setIsLoadingCreateDepartments(true);
    try {
      const result = await getAvailableDepartments();
      if (result.success) setCreateAvailableDepartments(result.departments || []);
      else toast.error('Error fetching departments');
    } catch { toast.error('Error fetching departments'); }
    setIsLoadingCreateDepartments(false);
  };

  const handleCreateCenter = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newCenterName.trim() || !selectedCoordinatorId) {
      setFormError("Center name and coordinator are required."); return;
    }
    setIsLoadingCreate(true);
    const result = await createCenter({
      name: newCenterName.trim(), coordinatorId: selectedCoordinatorId,
      departmentIds: createSelectedDepartments
    });
    if (result.success && result.center) {
      toast.success(`Center "${result.center.name}" created!`);
      setAllCenters(prev => [...prev, {
        ...result.center,
        staffRegistryCount: result.center.staffRegistryCount || 0,
        lecturerCount: result.center.lecturerCount || 0,
        departmentCount: result.center.departmentCount || 0,
      }].sort((a, b) => a.name.localeCompare(b.name)));
      resetCreateForm(); setIsCreateDialogOpen(false);
    } else {
      setFormError(result.error || "Failed to create center."); toast.error(result.error || "Failed.");
    }
    setIsLoadingCreate(false);
  };

  const openEditDialog = async (center) => {
    setEditingCenter(center); setEditCenterName(center.name);
    setEditSelectedCoordinatorId(center.coordinator?.id || '');
    setEditSelectedDepartments(center.departments?.map(d => d.id) || []);
    setIsEditDialogOpen(true); setFormError('');
    try {
      const result = await getAvailableDepartments();
      if (result.success) setEditAvailableDepartments(result.departments || []);
      else toast.error(result.error || 'Failed to fetch departments');
    } catch { toast.error('Error fetching departments'); }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    if (!editCenterName.trim()) { setFormError('Center name is required.'); return; }
    if (!editSelectedCoordinatorId) { setFormError('Select a coordinator.'); return; }
    setIsLoadingEdit(true); setFormError('');
    try {
      const result = await updateCenter({
        centerId: editingCenter.id, name: editCenterName.trim(), coordinatorId: editSelectedCoordinatorId
      });
      if (!result.success) {
        setFormError(result.error || 'Failed.'); toast.error(result.error || 'Failed.');
        setIsLoadingEdit(false); return;
      }
      const currentIds = editingCenter.departments?.map(d => d.id) || [];
      const toAssign = editSelectedDepartments.filter(id => !currentIds.includes(id));
      const toUnassign = currentIds.filter(id => !editSelectedDepartments.includes(id));
      if (toAssign.length > 0) {
        const r = await assignDepartmentsToCenter(editingCenter.id, toAssign);
        if (!r.success) toast.error(`Assign error: ${r.error}`);
      }
      if (toUnassign.length > 0) {
        const r = await unassignDepartmentsFromCenter(editingCenter.id, toUnassign);
        if (!r.success) toast.error(`Unassign error: ${r.error}`);
      }
      toast.success('Center updated!');
      const updated = {
        ...result.center,
        departments: editAvailableDepartments.filter(d => editSelectedDepartments.includes(d.id)),
        departmentCount: editSelectedDepartments.length,
      };
      setAllCenters(prev => prev.map(c => c.id === editingCenter.id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
      setIsEditDialogOpen(false); resetEditForm();
    } catch {
      setFormError('Error updating center.'); toast.error('Error updating center.');
    }
    setIsLoadingEdit(false);
  };

  const openDeleteDialog = (center) => { setCenterToDelete(center); setIsDeleteDialogOpen(true); };

  const handleDeleteCenter = async () => {
    if (!centerToDelete || !currentUserId) { toast.error("Missing data."); setIsDeleteDialogOpen(false); return; }
    setIsLoadingDelete(true);
    const result = await deleteCenterByRegistry({ centerId: centerToDelete.id, registryUserId: currentUserId });
    if (result.success) {
      toast.success(result.message || `Center "${centerToDelete.name}" deleted.`);
      setAllCenters(prev => prev.filter(c => c.id !== centerToDelete.id));
      setIsDeleteDialogOpen(false); setCenterToDelete(null);
    } else { toast.error(result.error || "Failed."); }
    setIsLoadingDelete(false);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ══ RENDER ═════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* ── Header with stats ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Study Centers
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span><span className="font-semibold text-slate-700 dark:text-slate-300">{liveStats.totalCenters}</span> Centers</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span><span className="font-semibold text-slate-700 dark:text-slate-300">{liveStats.totalLecturers}</span> Lecturers</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span><span className="font-semibold text-slate-700 dark:text-slate-300">{liveStats.totalDepartments}</span> Departments</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span><span className="font-semibold text-slate-700 dark:text-slate-300">{liveStats.totalStaffRegistry}</span> Staff</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input type="text" placeholder="Search centers..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-8 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg ${focusRingClass}`} />
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600">
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')}
              className={cn("h-8 w-8 rounded-md", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
              title="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('table')}
              className={cn("h-8 w-8 rounded-md", viewMode === 'table' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
              title="Table view">
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>

          {/* New Center */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open && !isLoadingCreate) resetCreateForm();
            else if (open) fetchDepartmentsForCreate();
          }}>
            <DialogTrigger asChild>
              <Button className={`gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold h-9 px-4 text-sm rounded-lg shadow-sm hover:shadow-md transition-all ${focusRingClass}`}>
                <PlusCircle className="h-4 w-4" /><span className="hidden sm:inline">New Center</span><span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
              <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
                <DialogTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100 font-semibold">
                  <Building2 className="h-5 w-5 text-violet-700 dark:text-violet-400" /> Create New Center
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                  Register a center and assign a coordinator.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCenter}>
                <div className="grid gap-4 py-4 px-1">
                  <div className="space-y-1.5">
                    <Label className={dialogLabelClass}>Center Name *</Label>
                    <Input value={newCenterName} onChange={(e) => setNewCenterName(e.target.value)}
                      placeholder="e.g., Faculty of Engineering" disabled={isLoadingCreate} className={dialogInputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={dialogLabelClass}>Coordinator *</Label>
                    <Select value={selectedCoordinatorId} onValueChange={setSelectedCoordinatorId} disabled={isLoadingCreate}>
                      <SelectTrigger className={`${dialogInputClass} data-[placeholder]:text-slate-400`}>
                        <SelectValue placeholder="Select coordinator" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg max-h-60">
                        {potentialCoordinators.length > 0 ? potentialCoordinators.map((u) => (
                          <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                            <div className="flex items-center gap-2 py-1">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-xs">
                                  {u.name?.match(/\b(\w)/g)?.join('').toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm font-medium">{u.name}</span>
                                <span className="block text-xs text-slate-500">{u.email}{u.designation ? ` · ${getDesignationDisplay(u.designation)}` : ''}</span>
                              </div>
                            </div>
                          </SelectItem>
                        )) : (
                          <div className="px-3 py-2 text-sm text-slate-500">No coordinators available</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Departments */}
                  <div className="space-y-2">
                    <Label className={dialogLabelClass}>Departments (Optional)</Label>
                    {isLoadingCreateDepartments ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        <span className="ml-2 text-sm text-slate-500">Loading...</span>
                      </div>
                    ) : createAvailableDepartments.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-md p-3 bg-slate-50 dark:bg-slate-700/50 space-y-2">
                        {createAvailableDepartments.map(dept => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox id={`create-dept-${dept.id}`}
                              checked={createSelectedDepartments.includes(dept.id)}
                              onCheckedChange={() => setCreateSelectedDepartments(prev =>
                                prev.includes(dept.id) ? prev.filter(x => x !== dept.id) : [...prev, dept.id]
                              )}
                              disabled={isLoadingCreate} className="border-slate-300 dark:border-slate-500" />
                            <label htmlFor={`create-dept-${dept.id}`} className="flex-1 text-sm cursor-pointer text-slate-700 dark:text-slate-200">
                              {dept.name}
                              {dept.isAssigned && (
                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                  (Assigned to {dept.centers?.length || 0} center{dept.centers?.length !== 1 ? 's' : ''})
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-3">No departments available to assign.</p>
                    )}
                    {createSelectedDepartments.length > 0 && (
                      <p className="text-xs text-slate-500">{createSelectedDepartments.length} selected</p>
                    )}
                  </div>

                  {formError && (
                    <div className="p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}
                    </div>
                  )}
                </div>
                <DialogFooter className="flex justify-end gap-3 px-1 pb-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isLoadingCreate} className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoadingCreate}
                    className={`h-9 px-4 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-medium shadow ${focusRingClass}`}>
                    {isLoadingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoadingCreate ? "Creating..." : "Create Center"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {allCenters.length === 0 ? (
        <EmptyState searchQuery="" onClearSearch={clearSearch} onCreateCenter={() => setIsCreateDialogOpen(true)} />
      ) : filteredCenters.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onClearSearch={clearSearch} onCreateCenter={() => setIsCreateDialogOpen(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCenters.map((center, idx) => (
            <CenterCard
              key={center.id}
              center={center}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              isLoading={isLoadingDelete}
              animationDelay={idx * 50}
            />
          ))}
        </div>
      ) : (
        <CenterTableView
          centers={filteredCenters}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          isLoading={isLoadingDelete}
        />
      )}

      {/* ══ DIALOGS ═══════════════════════════════════════════════════════════ */}

      {/* Edit Center Dialog */}
      {editingCenter && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingEdit) resetEditForm(); setIsEditDialogOpen(open); }}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100 font-semibold">
                <Edit3 className="h-5 w-5 text-violet-700 dark:text-violet-400" /> Edit: {editingCenter.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">Update center details and departments.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCenter}>
              <div className="grid gap-4 py-4 px-1">
                <div className="space-y-1.5">
                  <Label className={dialogLabelClass}>Center Name *</Label>
                  <Input value={editCenterName} onChange={(e) => setEditCenterName(e.target.value)}
                    placeholder="Center name" disabled={isLoadingEdit} className={dialogInputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={dialogLabelClass}>Coordinator *</Label>
                  <Select value={editSelectedCoordinatorId} onValueChange={setEditSelectedCoordinatorId} disabled={isLoadingEdit}>
                    <SelectTrigger className={`${dialogInputClass} data-[placeholder]:text-slate-400`}>
                      <SelectValue placeholder="Select coordinator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                      {potentialCoordinators.length > 0 ? potentialCoordinators.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} — {u.email}{u.designation ? ` (${getDesignationDisplay(u.designation)})` : ''}
                        </SelectItem>
                      )) : (
                        <div className="px-3 py-2 text-sm text-slate-500">No coordinators available.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={dialogLabelClass}>Departments</Label>
                  <div className="border border-slate-200 dark:border-slate-600 rounded-md p-3 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-700/50">
                    {editAvailableDepartments.length > 0 ? (
                      <div className="space-y-2">
                        {editAvailableDepartments.map(dept => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox id={`edit-dept-${dept.id}`}
                              checked={editSelectedDepartments.includes(dept.id)}
                              onCheckedChange={() => setEditSelectedDepartments(prev =>
                                prev.includes(dept.id) ? prev.filter(x => x !== dept.id) : [...prev, dept.id]
                              )}
                              disabled={isLoadingEdit} />
                            <label htmlFor={`edit-dept-${dept.id}`} className="flex-1 text-sm cursor-pointer text-slate-700 dark:text-slate-200">
                              {dept.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-3">No departments available</p>
                    )}
                  </div>
                </div>
                {formError && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-end gap-3 px-1 pb-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoadingEdit} className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoadingEdit}
                  className={`h-9 px-4 text-sm rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-medium shadow ${focusRingClass}`}>
                  {isLoadingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4" />}
                  {isLoadingEdit ? "Updating..." : "Update Center"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-300 font-semibold">
              <AlertTriangle className="h-5 w-5" /> Delete Center
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400 py-2">
            Delete <strong className="text-slate-800 dark:text-slate-100">{centerToDelete?.name}</strong>? This cannot be undone and may affect associated users and claims.
          </p>
          <DialogFooter className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoadingDelete}
              className={`h-9 px-4 text-sm rounded-lg ${focusRingClass}`}>Cancel</Button>
            <Button onClick={handleDeleteCenter} disabled={isLoadingDelete}
              className={`h-9 px-4 text-sm rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium shadow ${focusRingClass}`}>
              {isLoadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isLoadingDelete ? "Deleting..." : "Delete Center"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
