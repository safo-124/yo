// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorDepartmentsTab.jsx
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createDepartment } from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import {
  PlusCircle,
  Building2,
  Users,
  Search,
  LayoutGrid,
  List,
  Calendar,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Hash
} from "lucide-react";

// Color palette for department cards
const DEPT_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', accent: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', accent: 'bg-indigo-600', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', accent: 'bg-violet-600', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', accent: 'bg-purple-600', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', accent: 'bg-cyan-600', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', accent: 'bg-teal-600', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', accent: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800', accent: 'bg-sky-600', text: 'text-sky-700 dark:text-sky-300', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
];

export default function ManageCoordinatorDepartmentsTab({
  centerId,
  centerName,
  initialDepartments = [],
  coordinatorUserId,
  totalLecturers = 0,
}) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(d => d.name.toLowerCase().includes(q));
  }, [departments, searchQuery]);

  const resetForm = () => {
    setNewDepartmentName('');
    setFormError('');
  };

  const handleCreateDepartment = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newDepartmentName.trim()) {
      setFormError("Department name is required.");
      setIsLoading(false);
      return;
    }

    const result = await createDepartment({ name: newDepartmentName.trim(), centerId });

    if (result.success) {
      toast.success(`Department "${result.department.name}" created successfully!`);
      setIsDialogOpen(false);
      resetForm();
    } else {
      setFormError(result.error || "Failed to create department.");
      toast.error(result.error || "Failed to create department.");
    }
    setIsLoading(false);
  };

  const currentLecturers = departments.reduce((sum, d) => sum + (d.lecturerCount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Departments",
            value: departments.length,
            icon: Building2,
            gradient: "from-blue-600 to-indigo-600",
          },
          {
            label: "Total Lecturers",
            value: currentLecturers,
            icon: Users,
            gradient: "from-indigo-600 to-violet-600",
          },
          {
            label: "Avg per Dept",
            value: departments.length > 0 ? (currentLecturers / departments.length).toFixed(1) : '0',
            icon: TrendingUp,
            gradient: "from-violet-600 to-purple-600",
          },
          {
            label: "Center",
            value: centerName || 'N/A',
            icon: Sparkles,
            gradient: "from-purple-600 to-blue-600",
            isText: true,
          },
        ].map(({ label, value, icon: Icon, gradient, isText }, idx) => (
          <Card
            key={idx}
            className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/80">{label}</p>
                <p className={`font-bold truncate ${isText ? 'text-sm' : 'text-xl'}`} title={String(value)}>
                  {value}
                </p>
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
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Department */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm flex-1 sm:flex-initial">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                    <Building2 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  Create New Department
                </DialogTitle>
                <DialogDescription>
                  Add a new department to <span className="font-medium">{centerName}</span>.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDepartment}>
                <div className="py-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="departmentName" className="text-sm font-medium">Department Name</Label>
                    <Input
                      id="departmentName"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="w-full focus-visible:ring-blue-500"
                      placeholder="e.g., Department of Computer Science"
                      disabled={isLoading}
                      required
                      autoFocus
                    />
                  </div>
                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {formError}
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isLoading} className="border-slate-200">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create Department"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Hash className="h-3.5 w-3.5" />
          {filteredDepartments.length} of {departments.length} departments
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 ml-1 underline underline-offset-2"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredDepartments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((dept, idx) => {
            const color = DEPT_COLORS[idx % DEPT_COLORS.length];
            return (
              <Card
                key={dept.id}
                className={`${color.bg} ${color.border} border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group`}
              >
                {/* Color accent bar */}
                <div className={`h-1 ${color.accent}`} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-sm ${color.text} truncate`} title={dept.name}>
                        {dept.name}
                      </h3>
                    </div>
                    <div className={`flex-shrink-0 rounded-full p-1.5 ${color.badge}`}>
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{dept.lecturerCount || 0}</span> lecturer{(dept.lecturerCount || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Lecturer bar visualization */}
                  {currentLecturers > 0 && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color.accent} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(((dept.lecturerCount || 0) / Math.max(currentLecturers, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {currentLecturers > 0 ? `${(((dept.lecturerCount || 0) / currentLecturers) * 100).toFixed(0)}% of lecturers` : ''}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredDepartments.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-800">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3 w-12">#</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Department Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3 text-center">Lecturers</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept, idx) => {
                  const color = DEPT_COLORS[idx % DEPT_COLORS.length];
                  return (
                    <TableRow key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                      <TableCell className="px-4 py-3">
                        <span className="text-xs text-gray-400 font-mono">{idx + 1}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 rounded-lg p-1.5 ${color.badge}`}>
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-xs font-semibold ${color.badge} border-0`}>
                          {dept.lecturerCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(dept.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
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
      {filteredDepartments.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-base">No departments found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  No departments match &ldquo;{searchQuery}&rdquo;. Try a different search term.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-base">No departments yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Get started by creating your first department for this center.
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4 bg-blue-700 hover:bg-blue-800 text-white"
                  size="sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Create First Department
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
