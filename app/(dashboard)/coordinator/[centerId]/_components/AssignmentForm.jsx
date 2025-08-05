// app/(dashboard)/coordinator/[centerId]/assignments/_components/AssignmentForm.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { assignCoursesToLecturerByCoordinator } from '@/lib/actions/coordinator.actions.js';
import { Loader2 } from "lucide-react";

export function AssignmentForm({ lecturers = [], courses = [], coordinatorId }) {
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // When a new lecturer is selected, update the checkboxes
  useEffect(() => {
    if (selectedLecturerId) {
      const selectedLecturer = lecturers.find(l => l.id === selectedLecturerId);
      if (selectedLecturer) {
        setSelectedCourseIds(new Set(selectedLecturer.assignedCourseIds));
      }
    } else {
      setSelectedCourseIds(new Set()); // Clear selections if no lecturer is chosen
    }
  }, [selectedLecturerId, lecturers]);

  const handleCheckboxChange = (courseId, checked) => {
    setSelectedCourseIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedLecturerId) {
      toast.error("Please select a lecturer first.");
      return;
    }

    setIsLoading(true);
    const result = await assignCoursesToLecturerByCoordinator({
      lecturerId: selectedLecturerId,
      courseIds: Array.from(selectedCourseIds), // Convert Set to Array for the action
      coordinatorId: coordinatorId,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      // NOTE: Because of revalidatePath in the action, the page data will be stale.
      // A full page refresh is the simplest way to get fresh data after submission.
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };
  
  const selectedLecturerName = lecturers.find(l => l.id === selectedLecturerId)?.name || '...';

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="max-w-md space-y-2">
          <Label htmlFor="lecturer-select" className="font-semibold">
            1. Select a Lecturer
          </Label>
          <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
            <SelectTrigger id="lecturer-select">
              <SelectValue placeholder="Choose a lecturer to manage..." />
            </SelectTrigger>
            <SelectContent>
              {lecturers.length > 0 ? (
                lecturers.map(lecturer => (
                  <SelectItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.email})
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground">No lecturers found in this center.</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedLecturerId && (
          <div className="space-y-2">
            <Label className="font-semibold">
              2. Assign Courses for {selectedLecturerName}
            </Label>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="space-y-3">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <div key={course.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourseIds.has(course.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(course.id, checked)}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {course.courseCode} - {course.courseTitle}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No courses have been created in the system yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={!selectedLecturerId || isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Assignments
        </Button>
      </CardFooter>
    </Card>
  );
}