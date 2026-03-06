// app/(dashboard)/coordinator/[centerId]/_components/AssignmentForm.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { assignCoursesToLecturerByCoordinator } from '@/lib/actions/coordinator.actions.js';
import {
  Loader2,
  BookUser,
  Users,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  GraduationCap,
  User,
  Hash
} from "lucide-react";

export function AssignmentForm({ lecturers = [], courses = [], coordinatorId, maxCoursesAllowed = 3, centerId }) {
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    if (selectedLecturerId) {
      const selectedLecturer = lecturers.find(l => l.id === selectedLecturerId);
      if (selectedLecturer) {
        setSelectedCourseIds(new Set(selectedLecturer.assignedCourseIds));
      }
    } else {
      setSelectedCourseIds(new Set());
    }
    setLimitExceeded(false);
    setCourseSearch('');
  }, [selectedLecturerId, lecturers]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter(c =>
      c.courseCode?.toLowerCase().includes(q) ||
      c.courseTitle?.toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

  const handleCheckboxChange = (courseId, checked) => {
    setSelectedCourseIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        if (newSet.size >= maxCoursesAllowed) {
          toast.warning(`Maximum ${maxCoursesAllowed} courses allowed per user`);
          setLimitExceeded(true);
          return prev;
        }
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
        setLimitExceeded(false);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedLecturerId) {
      toast.error("Please select a user first.");
      return;
    }

    setIsLoading(true);
    const result = await assignCoursesToLecturerByCoordinator({
      lecturerId: selectedLecturerId,
      courseIds: Array.from(selectedCourseIds),
      coordinatorId,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const selectedLecturer = lecturers.find(l => l.id === selectedLecturerId);

  // Stats
  const totalAssigned = lecturers.reduce((sum, l) => sum + (l.assignedCourseIds?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Lecturers", value: lecturers.length, icon: Users, gradient: "from-blue-600 to-indigo-600" },
          { label: "Available Courses", value: courses.length, icon: BookOpen, gradient: "from-indigo-600 to-violet-600" },
          { label: "Total Assigned", value: totalAssigned, icon: CheckCircle2, gradient: "from-violet-600 to-purple-600" },
          { label: "Max per User", value: maxCoursesAllowed, icon: Hash, gradient: "from-purple-600 to-blue-600" },
        ].map(({ label, value, icon: Icon, gradient }, idx) => (
          <Card key={idx} className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-md hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/80">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step 1: Select Lecturer */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <User className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Select a Lecturer or Coordinator</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose who to manage course assignments for</p>
            </div>
          </div>

          <div className="max-w-md">
            <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
              <SelectTrigger className="h-10 focus:ring-blue-500 bg-white dark:bg-slate-900">
                <SelectValue placeholder="Choose a user to manage..." />
              </SelectTrigger>
              <SelectContent>
                {lecturers.length > 0 ? (
                  lecturers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <span className="flex items-center gap-2">
                        {user.name}
                        {user.isCoordinator && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                            Coordinator
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-center text-gray-500">
                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    No users found in this center.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected lecturer info card */}
          {selectedLecturer && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <GraduationCap className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{selectedLecturer.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {selectedLecturer.isCoordinator ? 'Coordinator' : 'Lecturer'} · {selectedLecturer.assignedCourseIds?.length || 0} courses assigned
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Assign Courses (conditionally shown) */}
      {selectedLecturerId && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-2">
                  <BookOpen className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Assign Courses
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select courses for {selectedLecturer?.name || 'this user'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs ${
                    selectedCourseIds.size >= maxCoursesAllowed
                      ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                  } border`}
                >
                  {selectedCourseIds.size} / {maxCoursesAllowed} selected
                </Badge>
              </div>
            </div>

            {limitExceeded && (
              <div className="flex items-center gap-2 text-sm p-3 bg-amber-50 dark:bg-amber-900/15 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Maximum of {maxCoursesAllowed} courses allowed per user (set by registry).
              </div>
            )}

            {/* Course search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses by code or title..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
              />
            </div>

            {/* Course list */}
            <ScrollArea className="h-72 w-full rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="p-3 space-y-1">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map(course => {
                    const isChecked = selectedCourseIds.has(course.id);
                    const isDisabled = !isChecked && selectedCourseIds.size >= maxCoursesAllowed;
                    return (
                      <label
                        key={course.id}
                        htmlFor={`course-${course.id}`}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleCheckboxChange(course.id, checked)}
                          disabled={isDisabled}
                          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            <span className="font-mono text-indigo-700 dark:text-indigo-300">{course.courseCode}</span>
                            <span className="mx-1.5 text-gray-300">·</span>
                            {course.courseTitle}
                          </p>
                        </div>
                        {isChecked && (
                          <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      {courseSearch ? `No courses matching "${courseSearch}"` : 'No courses available in the system.'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveChanges}
                disabled={!selectedLecturerId || isLoading}
                className="bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state when no lecturer selected */}
      {!selectedLecturerId && (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-4 mb-4">
              <BookUser className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Select a user to begin</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Choose a lecturer or coordinator above to view and manage their course assignments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
