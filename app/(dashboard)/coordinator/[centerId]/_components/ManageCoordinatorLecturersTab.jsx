// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorLecturersTab.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  createLecturerInCenter,
  assignLecturerToDepartment
} from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  Edit3,
  Search,
  LayoutGrid,
  List,
  Building2,
  BookOpen,
  GraduationCap,
  Mail,
  User,
  Layers,
  Hash
} from "lucide-react";

// Color palette for lecturer cards
const CARD_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/15', border: 'border-blue-200 dark:border-blue-800', accent: 'bg-blue-600', icon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { bg: 'bg-indigo-50 dark:bg-indigo-900/15', border: 'border-indigo-200 dark:border-indigo-800', accent: 'bg-indigo-600', icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { bg: 'bg-violet-50 dark:bg-violet-900/15', border: 'border-violet-200 dark:border-violet-800', accent: 'bg-violet-600', icon: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { bg: 'bg-purple-50 dark:bg-purple-900/15', border: 'border-purple-200 dark:border-purple-800', accent: 'bg-purple-600', icon: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/15', border: 'border-cyan-200 dark:border-cyan-800', accent: 'bg-cyan-600', icon: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { bg: 'bg-teal-50 dark:bg-teal-900/15', border: 'border-teal-200 dark:border-teal-800', accent: 'bg-teal-600', icon: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
];

export default function ManageCoordinatorLecturersTab({
  centerId,
  centerName,
  initialLecturers = [],
  departmentsForAssignment = [],
  coordinatorUserId
}) {
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Create form state
  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('');
  const [selectedDepartmentForNewLecturer, setSelectedDepartmentForNewLecturer] = useState('');

  // Assign form state
  const [selectedLecturerToAssign, setSelectedLecturerToAssign] = useState(null);
  const [targetDepartmentId, setTargetDepartmentId] = useState('');

  useEffect(() => {
    setLecturers(initialLecturers);
  }, [initialLecturers]);

  const filteredLecturers = useMemo(() => {
    if (!searchQuery.trim()) return lecturers;
    const q = searchQuery.toLowerCase();
    return lecturers.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.departmentName?.toLowerCase().includes(q)
    );
  }, [lecturers, searchQuery]);

  const resetCreateForm = () => {
    setNewLecturerName('');
    setNewLecturerEmail('');
    setNewLecturerPassword('');
    setSelectedDepartmentForNewLecturer('');
    setFormError('');
  };

  const resetAssignForm = () => {
    setSelectedLecturerToAssign(null);
    setTargetDepartmentId('');
    setFormError('');
  };

  const handleCreateLecturer = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newLecturerName.trim() || !newLecturerEmail.trim() || !newLecturerPassword.trim()) {
      setFormError("Name, email, and password are required.");
      setIsLoading(false);
      return;
    }
    if (newLecturerPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const result = await createLecturerInCenter({
      name: newLecturerName.trim(),
      email: newLecturerEmail.trim(),
      password: newLecturerPassword.trim(),
      centerId,
      departmentId: selectedDepartmentForNewLecturer || null,
    });

    if (result.success) {
      toast.success(`Lecturer "${result.user.name}" created successfully!`);
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } else {
      setFormError(result.error || "Failed to create lecturer.");
      toast.error(result.error || "Failed to create lecturer.");
    }
    setIsLoading(false);
  };

  const handleOpenAssignDialog = (lecturer) => {
    setSelectedLecturerToAssign(lecturer);
    setTargetDepartmentId(lecturer.departmentId || '');
    setFormError('');
    setIsAssignDialogOpen(true);
  };

  const handleAssignDepartment = async (event) => {
    event.preventDefault();
    if (!selectedLecturerToAssign || !targetDepartmentId) {
      setFormError("Please select a department.");
      return;
    }
    setIsLoading(true);
    setFormError('');

    const result = await assignLecturerToDepartment({
      lecturerId: selectedLecturerToAssign.id,
      departmentId: targetDepartmentId,
      centerId,
    });

    if (result.success) {
      toast.success(`${selectedLecturerToAssign.name} assigned successfully!`);
      setIsAssignDialogOpen(false);
      resetAssignForm();
    } else {
      setFormError(result.error || "Failed to assign department.");
      toast.error(result.error || "Failed to assign department.");
    }
    setIsLoading(false);
  };

  // Stats
  const withDept = lecturers.filter(l => l.departmentName).length;
  const withCourses = lecturers.filter(l => (l.assignedCoursesCount || 0) > 0).length;

  return (
    <div className="space-y-5">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Lecturers", value: lecturers.length, icon: Users, gradient: "from-blue-600 to-indigo-600" },
          { label: "With Department", value: withDept, icon: Building2, gradient: "from-indigo-600 to-violet-600" },
          { label: "With Courses", value: withCourses, icon: BookOpen, gradient: "from-violet-600 to-purple-600" },
          { label: "Center", value: centerName || 'N/A', icon: GraduationCap, gradient: "from-purple-600 to-blue-600", isText: true },
        ].map(({ label, value, icon: Icon, gradient, isText }, idx) => (
          <Card key={idx} className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-md hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/80">{label}</p>
                <p className={`font-bold truncate ${isText ? 'text-sm' : 'text-xl'}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lecturers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-500 hover:text-gray-700'}`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-500 hover:text-gray-700'}`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Lecturer Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetCreateForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm flex-1 sm:flex-initial">
                <UserPlus className="mr-2 h-4 w-4" /> Add Lecturer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                    <UserPlus className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  Add New Lecturer
                </DialogTitle>
                <DialogDescription>
                  Create a new lecturer account for <span className="font-medium">{centerName}</span>.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLecturer}>
                <div className="py-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="lecturerName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="lecturerName"
                      value={newLecturerName}
                      onChange={(e) => setNewLecturerName(e.target.value)}
                      placeholder="e.g., Dr. John Doe"
                      disabled={isLoading}
                      required
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturerEmail" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="lecturerEmail"
                      type="email"
                      value={newLecturerEmail}
                      onChange={(e) => setNewLecturerEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      disabled={isLoading}
                      required
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturerPassword" className="text-sm font-medium">Password</Label>
                    <Input
                      id="lecturerPassword"
                      type="password"
                      value={newLecturerPassword}
                      onChange={(e) => setNewLecturerPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      disabled={isLoading}
                      required
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  {departmentsForAssignment.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Department (Optional)</Label>
                      <Select value={selectedDepartmentForNewLecturer} onValueChange={setSelectedDepartmentForNewLecturer}>
                        <SelectTrigger className="focus:ring-blue-500">
                          <SelectValue placeholder="Select a department..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentsForAssignment.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {formError}
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading} className="bg-blue-700 hover:bg-blue-800 text-white">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : "Create Lecturer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Assign Department Dialog */}
      {selectedLecturerToAssign && (
        <Dialog open={isAssignDialogOpen} onOpenChange={(open) => { setIsAssignDialogOpen(open); if (!open) resetAssignForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-2">
                  <Building2 className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                </div>
                Assign Department
              </DialogTitle>
              <DialogDescription>
                Assign <span className="font-medium">{selectedLecturerToAssign.name}</span> to a department.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignDepartment}>
              <div className="py-4 space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedLecturerToAssign.name}</p>
                  <p className="text-xs text-gray-500">{selectedLecturerToAssign.email}</p>
                  {selectedLecturerToAssign.departmentName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedLecturerToAssign.departmentName}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Department</Label>
                  <Select value={targetDepartmentId} onValueChange={setTargetDepartmentId}>
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Choose department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsForAssignment.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {formError}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || !targetDepartmentId} className="bg-indigo-700 hover:bg-indigo-800 text-white">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assigning...
                    </span>
                  ) : "Assign Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Search Results Count */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Hash className="h-3.5 w-3.5" />
          {filteredLecturers.length} of {lecturers.length} lecturers
          <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1">
            Clear
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredLecturers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLecturers.map((lecturer, idx) => {
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <Card key={lecturer.id} className={`${color.bg} ${color.border} border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden`}>
                <div className={`h-1 ${color.accent}`} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{lecturer.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        {lecturer.email}
                      </p>
                    </div>
                    <div className={`flex-shrink-0 rounded-full p-1.5 ${color.icon}`}>
                      <User className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white/50 dark:bg-slate-800/50">
                      <Building2 className="h-2.5 w-2.5 mr-1" />
                      {lecturer.departmentName || 'No Dept'}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${(lecturer.assignedCoursesCount || 0) > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-white/50 dark:bg-slate-800/50'}`}>
                      <BookOpen className="h-2.5 w-2.5 mr-1" />
                      {lecturer.assignedCoursesCount || 0} course{(lecturer.assignedCoursesCount || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {(lecturer.assignedProgramCodes?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lecturer.assignedProgramCodes.map(code => (
                        <Badge key={code} variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAssignDialog(lecturer)}
                      disabled={departmentsForAssignment.length === 0}
                      className="w-full h-7 text-xs border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:hover:bg-indigo-900/20"
                    >
                      <Edit3 className="mr-1.5 h-3 w-3" /> Assign Department
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredLecturers.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-800">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Lecturer</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Department</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3 text-center">Courses</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Programs</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLecturers.map((lecturer, idx) => {
                  const color = CARD_COLORS[idx % CARD_COLORS.length];
                  return (
                    <TableRow key={lecturer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 rounded-full p-1.5 ${color.icon}`}>
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{lecturer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lecturer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {lecturer.departmentName ? (
                          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800/50">
                            <Building2 className="h-3 w-3 mr-1" />
                            {lecturer.departmentName}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge className={`text-xs ${(lecturer.assignedCoursesCount || 0) > 0 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'} border-0`}>
                          {lecturer.assignedCoursesCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(lecturer.assignedProgramCodes?.length || 0) > 0 ? (
                            lecturer.assignedProgramCodes.map(code => (
                              <Badge key={code} variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                                {code}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignDialog(lecturer)}
                          disabled={departmentsForAssignment.length === 0}
                          className="h-7 text-xs border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:hover:bg-indigo-900/20"
                        >
                          <Edit3 className="mr-1 h-3 w-3" /> Assign Dept.
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredLecturers.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">No lecturers found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  No lecturers match &ldquo;{searchQuery}&rdquo;.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">No lecturers yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Add your first lecturer to start managing your center.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" /> Add First Lecturer
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
