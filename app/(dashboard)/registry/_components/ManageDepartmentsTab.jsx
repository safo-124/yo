// app/(dashboard)/registry/_components/ManageDepartmentsTab.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Building2, GraduationCap, Plus, Minus, BookOpen, 
  MapPin, Loader2, AlertCircle, CheckCircle2, Building, Users,
  ChevronDown, ChevronUp, ArrowRight, Layers
} from "lucide-react";
import { 
  getDepartmentsWithPrograms, 
  getAvailablePrograms, 
  assignProgramsToDepartments,
  unassignProgramsFromDepartments,
  unassignCentersFromDepartment,
} from '@/lib/actions/registry.actions';

export default function ManageDepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);

  // Center unassignment states
  const [isUnassignCentersDialogOpen, setIsUnassignCentersDialogOpen] = useState(false);
  const [selectedCentersForUnassignment, setSelectedCentersForUnassignment] = useState([]);
  const [departmentForCenterUnassignment, setDepartmentForCenterUnassignment] = useState(null);

  // Quick-assign states
  const [quickAssignProgramId, setQuickAssignProgramId] = useState('');
  const [quickAssignDeptId, setQuickAssignDeptId] = useState('');
  const [isQuickAssigning, setIsQuickAssigning] = useState(false);

  // Collapsible unassigned programs section
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchAllPrograms();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const result = await getDepartmentsWithPrograms();
      if (result.success) {
        setDepartments(result.departments || []);
      } else {
        toast.error(result.error || 'Failed to fetch departments');
      }
    } catch (error) {
      toast.error('Error fetching departments');
    }
    setIsLoading(false);
  };

  const fetchAllPrograms = async () => {
    try {
      const result = await getAvailablePrograms();
      if (result.success) {
        setAllPrograms(result.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleAssignPrograms = async () => {
    if (!selectedDepartment || selectedPrograms.length === 0) {
      toast.error('Please select programs to assign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await assignProgramsToDepartments(selectedPrograms, [selectedDepartment.id]);
      if (result.success) {
        toast.success(`${selectedPrograms.length} program(s) assigned successfully`);
        setIsAssignDialogOpen(false);
        setSelectedPrograms([]);
        setSelectedDepartment(null);
        fetchDepartments();
        fetchAllPrograms();
      } else {
        toast.error(result.error || 'Failed to assign programs');
      }
    } catch (error) {
      toast.error('Error assigning programs');
    }
    setIsLoading(false);
  };

  const handleUnassignPrograms = async () => {
    if (!selectedDepartment || selectedPrograms.length === 0) {
      toast.error('Please select programs to unassign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unassignProgramsFromDepartments(selectedPrograms, [selectedDepartment.id]);
      if (result.success) {
        toast.success(`${selectedPrograms.length} program(s) unassigned successfully`);
        setIsUnassignDialogOpen(false);
        setSelectedPrograms([]);
        setSelectedDepartment(null);
        fetchDepartments();
        fetchAllPrograms();
      } else {
        toast.error(result.error || 'Failed to unassign programs');
      }
    } catch (error) {
      toast.error('Error unassigning programs');
    }
    setIsLoading(false);
  };

  const handleUnassignCenters = async () => {
    if (!departmentForCenterUnassignment || selectedCentersForUnassignment.length === 0) {
      toast.error('Please select centers to unassign');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unassignCentersFromDepartment(
        departmentForCenterUnassignment.id, 
        selectedCentersForUnassignment
      );
      if (result.success) {
        toast.success(`${selectedCentersForUnassignment.length} center(s) unassigned successfully`);
        setIsUnassignCentersDialogOpen(false);
        setSelectedCentersForUnassignment([]);
        setDepartmentForCenterUnassignment(null);
        fetchDepartments();
      } else {
        toast.error(result.error || 'Failed to unassign centers');
      }
    } catch (error) {
      toast.error('Error unassigning centers');
    }
    setIsLoading(false);
  };

  const openAssignDialog = (department) => {
    setSelectedDepartment(department);
    setSelectedPrograms([]);
    setIsAssignDialogOpen(true);
  };

  const handleQuickAssign = async (programId, departmentId) => {
    if (!programId || !departmentId) return;
    setIsQuickAssigning(true);
    try {
      const result = await assignProgramsToDepartments([programId], [departmentId]);
      if (result.success) {
        toast.success('Program assigned successfully');
        setQuickAssignProgramId('');
        setQuickAssignDeptId('');
        fetchDepartments();
        fetchAllPrograms();
      } else {
        toast.error(result.error || 'Failed to assign program');
      }
    } catch {
      toast.error('Error assigning program');
    }
    setIsQuickAssigning(false);
  };

  const openUnassignDialog = (department) => {
    setSelectedDepartment(department);
    setSelectedPrograms([]);
    setIsUnassignDialogOpen(true);
  };

  const openUnassignCentersDialog = (department) => {
    setDepartmentForCenterUnassignment(department);
    setSelectedCentersForUnassignment([]);
    setIsUnassignCentersDialogOpen(true);
  };

  const toggleProgramSelection = (programId) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const toggleCenterSelection = (centerId) => {
    setSelectedCentersForUnassignment(prev => 
      prev.includes(centerId) 
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  // Get programs that are not assigned to the current department
  const getAvailableProgramsForDepartment = (department) => {
    const assignedProgramIds = new Set(department.programs?.map(p => p.id) || []);
    return allPrograms.filter(program => !assignedProgramIds.has(program.id));
  };

  // Get unassigned programs (not assigned to any department)
  const unassignedPrograms = allPrograms.filter(program => !program.isAssigned);
  const assignedProgramCount = allPrograms.length - unassignedPrograms.length;
  const assignmentPercent = allPrograms.length > 0 ? Math.round((assignedProgramCount / allPrograms.length) * 100) : 0;

  // Consistent color per department
  const getDeptColor = (name) => {
    const palettes = [
      { border: 'border-t-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', icon: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      { border: 'border-t-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20', icon: 'text-violet-600 dark:text-violet-400', badgeBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
      { border: 'border-t-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      { border: 'border-t-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
      { border: 'border-t-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', icon: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
      { border: 'border-t-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', icon: 'text-cyan-600 dark:text-cyan-400', badgeBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    ];
    if (!name) return palettes[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palettes[Math.abs(hash) % palettes.length];
  };

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <span className="ml-3 text-slate-600 dark:text-slate-400 font-medium">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* ── Header with stats ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            Department Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Assign programs to departments with many-to-many relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium px-3 py-1">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />{departments.length} Departments
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium px-3 py-1">
            <GraduationCap className="h-3.5 w-3.5 mr-1.5" />{allPrograms.length} Programs
          </Badge>
        </div>
      </div>

      {/* ── Unassigned Programs (collapsible with progress) ── */}
      {unassignedPrograms.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 overflow-hidden">
          <button
            onClick={() => setIsUnassignedExpanded(prev => !prev)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {unassignedPrograms.length} Unassigned Program{unassignedPrograms.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {assignedProgramCount}/{allPrograms.length} programs assigned ({assignmentPercent}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini progress bar */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all" style={{ width: `${assignmentPercent}%` }} />
                </div>
              </div>
              {isUnassignedExpanded ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
            </div>
          </button>
          
          {isUnassignedExpanded && (
            <div className="px-4 py-3 bg-white dark:bg-slate-800/50 border-t border-amber-200 dark:border-amber-800/50 space-y-3">
              {/* Quick assign row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Quick Assign:</span>
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <Select value={quickAssignProgramId} onValueChange={setQuickAssignProgramId}>
                    <SelectTrigger className="h-8 w-[240px] text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md">
                      <SelectValue placeholder="Select program..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {unassignedPrograms.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">{p.programCode} — {p.programTitle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                  <Select value={quickAssignDeptId} onValueChange={setQuickAssignDeptId}>
                    <SelectTrigger className="h-8 w-[200px] text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    disabled={!quickAssignProgramId || !quickAssignDeptId || isQuickAssigning}
                    onClick={() => handleQuickAssign(quickAssignProgramId, quickAssignDeptId)}
                    className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isQuickAssigning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    Assign
                  </Button>
                </div>
              </div>

              {/* Program badges */}
              <div className="flex flex-wrap gap-1.5">
                {unassignedPrograms.map(program => (
                  <Badge 
                    key={program.id} 
                    variant="outline" 
                    className="text-xs text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 cursor-pointer transition-colors"
                    onClick={() => { setQuickAssignProgramId(program.id); }}
                  >
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {program.programCode}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── All Assigned Banner ────────────────────────────── */}
      {unassignedPrograms.length === 0 && allPrograms.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">All {allPrograms.length} programs are assigned to departments</p>
        </div>
      )}

      {/* ── Department Cards Grid ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map(department => {
          const colors = getDeptColor(department.name);
          const programCount = department.programs?.length || 0;
          const centerCount = department.centers?.length || 0;
          
          return (
            <Card key={department.id} className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 border-t-4 ${colors.border} shadow-sm hover:shadow-lg transition-all`}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${colors.bg} shrink-0`}>
                      <Building2 className={`h-4.5 w-4.5 ${colors.icon}`} />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                      {department.name}
                    </CardTitle>
                  </div>
                </div>
                {/* Stat badges row */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge className={`text-[10px] px-2 py-0.5 font-medium ${colors.badgeBg}`}>
                    <GraduationCap className="h-3 w-3 mr-1" />{programCount} program{programCount !== 1 ? 's' : ''}
                  </Badge>
                  {centerCount > 0 && (
                    <Badge className="text-[10px] px-2 py-0.5 font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <MapPin className="h-3 w-3 mr-1" />{centerCount} center{centerCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-slate-300 dark:border-slate-600 text-slate-500">
                    <Users className="h-3 w-3 mr-1" />{department._count?.lecturers || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Programs List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Assigned Programs
                    </span>
                    <div className="flex gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAssignDialog(department)}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        title="Assign programs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      {programCount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openUnassignDialog(department)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Unassign programs"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {programCount > 0 ? (
                    <ScrollArea className={`${programCount > 3 ? 'h-28' : ''} rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40`}>
                      <div className="p-2 space-y-0.5">
                        {department.programs.map(program => (
                          <div key={program.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700/50 transition-colors group">
                            <GraduationCap className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                              {program.programCode} — {program.programTitle}
                            </span>
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize shrink-0 hidden group-hover:inline-flex">
                              {program.programCategory?.toLowerCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <BookOpen className="h-5 w-5 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs text-slate-400 dark:text-slate-500">No programs assigned</p>
                      <Button variant="link" size="sm" className="text-xs h-auto py-1 text-violet-600" onClick={() => openAssignDialog(department)}>
                        Assign programs
                      </Button>
                    </div>
                  )}
                </div>

                {/* Centers */}
                {centerCount > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Centers
                      </span>
                      {centerCount > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openUnassignCentersDialog(department)}
                          className="h-6 w-6 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          title="Unassign centers"
                        >
                          <Building className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {department.centers.map(center => (
                        <Badge key={center.id} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <MapPin className="h-2.5 w-2.5 mr-1" />
                          {center.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {departments.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No departments yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a department from the "Create" button above</p>
        </div>
      )}

      {/* Assign Programs Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-4">
            <DialogTitle className="text-white font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> Assign Programs</DialogTitle>
            <p className="text-violet-200 text-sm mt-0.5">
              Assign to <span className="font-semibold text-white">{selectedDepartment?.name}</span>
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {(() => {
              const availablePrograms = selectedDepartment ? getAvailableProgramsForDepartment(selectedDepartment) : [];
              return availablePrograms.length > 0 ? (
                <ScrollArea className="h-64 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="space-y-1.5">
                    {availablePrograms.map(program => (
                      <div key={program.id} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${selectedPrograms.includes(program.id) ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-white dark:hover:bg-slate-700/50'}`}>
                        <Checkbox
                          id={`assign-${program.id}`}
                          checked={selectedPrograms.includes(program.id)}
                          onCheckedChange={() => toggleProgramSelection(program.id)}
                        />
                        <label
                          htmlFor={`assign-${program.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-slate-200">{program.programCode} — {program.programTitle}</span>
                            <span className="text-xs text-slate-500 capitalize">{program.programCategory?.toLowerCase()}</span>
                            {program.isAssigned && (
                              <span className="text-xs text-blue-500">
                                Assigned to {program.departments?.length || 0} other dept(s)
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No programs available to assign</p>
                  <p className="text-xs text-slate-400">All programs are already assigned to this department</p>
                </div>
              );
            })()}
          </div>
          
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAssignPrograms}
              disabled={selectedPrograms.length === 0 || isLoading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-semibold shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Assign {selectedPrograms.length} Program(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Programs Dialog */}
      <Dialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4">
            <DialogTitle className="text-white font-bold flex items-center gap-2"><Minus className="h-4 w-4" /> Unassign Programs</DialogTitle>
            <p className="text-red-200 text-sm mt-0.5">
              Remove from <span className="font-semibold text-white">{selectedDepartment?.name}</span>
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {selectedDepartment?.programs?.length > 0 ? (
              <ScrollArea className="h-64 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40">
                <div className="space-y-1.5">
                  {selectedDepartment.programs.map(program => (
                    <div key={program.id} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${selectedPrograms.includes(program.id) ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-white dark:hover:bg-slate-700/50'}`}>
                      <Checkbox
                        id={`unassign-${program.id}`}
                        checked={selectedPrograms.includes(program.id)}
                        onCheckedChange={() => toggleProgramSelection(program.id)}
                      />
                      <label
                        htmlFor={`unassign-${program.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-slate-800 dark:text-slate-200">{program.programCode} — {program.programTitle}</span>
                          <span className="text-xs text-slate-500 capitalize">{program.programCategory?.toLowerCase()}</span>
                          {allPrograms.find(p => p.id === program.id)?.departments?.length > 1 && (
                            <span className="text-xs text-amber-600">
                              Also assigned to {allPrograms.find(p => p.id === program.id)?.departments?.length - 1} other dept(s)
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No programs assigned to this department</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setIsUnassignDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleUnassignPrograms}
              disabled={selectedPrograms.length === 0 || isLoading}
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Minus className="h-4 w-4 mr-2" />
              )}
              Unassign {selectedPrograms.length} Program(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Centers Dialog */}
      <Dialog 
        open={isUnassignCentersDialogOpen} 
        onOpenChange={setIsUnassignCentersDialogOpen}
      >
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
            <DialogTitle className="text-white font-bold flex items-center gap-2"><Building className="h-4 w-4" /> Unassign Centers</DialogTitle>
            {departmentForCenterUnassignment && (
              <p className="text-orange-100 text-sm mt-0.5">
                Remove from <span className="font-semibold text-white">{departmentForCenterUnassignment.name}</span>
              </p>
            )}
          </div>
          
          {departmentForCenterUnassignment && (
            <div className="p-4 space-y-4">
              {departmentForCenterUnassignment.centers?.length > 0 ? (
                <ScrollArea className="h-48 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="space-y-1.5">
                    {departmentForCenterUnassignment.centers.map(center => (
                      <div key={center.id} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${selectedCentersForUnassignment.includes(center.id) ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-white dark:hover:bg-slate-700/50'}`}>
                        <Checkbox
                          id={`center-${center.id}`}
                          checked={selectedCentersForUnassignment.includes(center.id)}
                          onCheckedChange={() => toggleCenterSelection(center.id)}
                        />
                        <label
                          htmlFor={`center-${center.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{center.name}</span>
                            {center.location && <span className="text-xs text-slate-500">{center.location}</span>}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No centers assigned to this department</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => setIsUnassignCentersDialogOpen(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUnassignCenters}
              disabled={isLoading || selectedCentersForUnassignment.length === 0}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Building className="h-4 w-4 mr-2" />
              )}
              Unassign {selectedCentersForUnassignment.length} Center(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}