// app/(dashboard)/registry/_components/ManageCoursesTab.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  createProgram, getPrograms, createCourse, getCourses, getDepartments, getLecturersForAssignment, bulkUploadCourses, assignCoursesToLecturers, createDepartment,
  updateProgram, updateCourse, updateDepartment, // Import update actions
  deleteCourse, deleteProgram, deleteDepartment, // Import delete actions
  unassignCourseFromLecturers, // Import unassign action
  unassignCoursesFromLecturer // Import new unassign specific courses from lecturer action
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import {
  PlusCircle, BookOpen, GraduationCap, Building2, Layers, CalendarDays, BookText, Hash, Clock, FileWarning, Loader2,
  List, CheckSquare, Search, XCircle, Upload, UserPlus, Home, User, Edit2, Trash2, AlertTriangle // Added icons
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import ManageDepartmentsTab from './ManageDepartmentsTab';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900";
const dialogInputClass = `h-9 sm:h-10 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md ${focusRingClass}`;
const dialogSelectTriggerClass = `${dialogInputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
const dialogSelectContentClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-md shadow-lg";
const dialogLabelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";
const dialogErrorClass = `p-2 text-red-700 bg-red-50 border border-red-300 rounded-md text-xs flex items-center gap-1.5`;

// Enums as constants for UI dropdowns
const PROGRAM_CATEGORIES = [
  { value: "DIPLOMA", label: "Diploma" },
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
];

const COURSE_LEVELS = [
  { value: "LEVEL_100", label: "Level 100" },
  { value: "LEVEL_200", label: "Level 200" },
  { value: "LEVEL_300", label: "Level 300" },
  { value: "LEVEL_400", label: "Level 400" },
  { value: "LEVEL_500", label: "Level 500" },
  { value: "LEVEL_600", label: "Level 600" },
];

const ACADEMIC_SEMESTERS = [
  { value: "FIRST_SEMESTER", label: "First Semester" },
  { value: "SECOND_SEMESTER", label: "Second Semester" },
  { value: "THIRD_SEMESTER", label: "Third Semester" },
];

export default function ManageCoursesTab({ initialPrograms = [], initialDepartments = [], initialCourses = [], initialLecturers = [], initialCenters = [] }) {
  const [activeTab, setActiveTab] = useState("departments");
  // State variables are initialized directly from props.
  // These states will receive fresh values from the parent (Server Component) on re-renders caused by revalidatePath.
  const [departments, setDepartments] = useState(initialDepartments);
  const [programs, setPrograms] = useState(initialPrograms);
  const [courses, setCourses] = useState(initialCourses);
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [centers, setCenters] = useState(initialCenters); // State for centers

  // DEBUG LOGS for centers data flow (will appear in browser console)
  console.log("ManageCoursesTab: initialCenters prop received:", initialCenters);
  console.log("ManageCoursesTab: centers state initialized to:", centers);


  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isAssignCoursesDialogOpen, setIsAssignCoursesDialogOpen] = useState(false);

  // Edit dialog states
  const [isEditProgramDialogOpen, setIsEditProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null); // Program object being edited

  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // Course object being edited

  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null); // Department object being edited
  
  // Delete confirmation dialogs
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [courseAssignedLecturers, setCourseAssignedLecturers] = useState([]);
  const [isUnassigningCourse, setIsUnassigningCourse] = useState(false);
  
  const [isDeleteProgramDialogOpen, setIsDeleteProgramDialogOpen] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState(null);
  
  const [isDeleteDepartmentDialogOpen, setIsDeleteDepartmentDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState(null);


  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for Create Program
  const [newProgramCode, setNewProgramCode] = useState('');
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramCategory, setNewProgramCategory] = useState('');
  const [newProgramDepartmentIds, setNewProgramDepartmentIds] = useState([]); // For multiple department assignment

  // Form states for Create Course
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCreditHours, setNewCreditHours] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('');
  const [newAcademicSemester, setNewAcademicSemester] = useState('');
  const [newCourseProgramId, setNewCourseProgramId] = useState('');

  // Form state for Create Department
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentCenterIds, setNewDepartmentCenterIds] = useState([]); // For multiple center assignment


  // Bulk Upload states
  const [excelFile, setExcelFile] = useState(null);
  const [bulkUploadStatus, setBulkUploadStatus] = useState(null);

  // Assign Courses states
  const [selectedCoursesForAssignment, setSelectedCoursesForAssignment] = useState([]);
  const [selectedLecturerForAssignment, setSelectedLecturerForAssignment] = useState('');

  // Unassign Courses states
  const [isUnassignCoursesDialogOpen, setIsUnassignCoursesDialogOpen] = useState(false);
  const [selectedLecturerForUnassignment, setSelectedLecturerForUnassignment] = useState('');
  const [selectedCoursesForUnassignment, setSelectedCoursesForUnassignment] = useState([]);
  const [lecturerAssignedCourses, setLecturerAssignedCourses] = useState([]);

  // Filter programs for display
  const filteredPrograms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return programs;
    return programs.filter(program => {
      const codeMatch = program.programCode?.toLowerCase().includes(query);
      const titleMatch = program.programTitle?.toLowerCase().includes(query);
      const categoryMatch = program.programCategory?.toLowerCase().includes(query);
      const deptMatch = program.departmentName?.toLowerCase().includes(query);
      return codeMatch || titleMatch || categoryMatch || deptMatch;
    });
  }, [programs, searchQuery]);

  // Filter courses for display
  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return courses;
    return courses.filter(course => {
      const codeMatch = course.courseCode?.toLowerCase().includes(query);
      const titleMatch = course.courseTitle?.toLowerCase().includes(query);
      const levelMatch = course.level?.toLowerCase().includes(query);
      const semesterMatch = course.academicSemester?.toLowerCase().includes(query);
      const programTitleMatch = course.programTitle?.toLowerCase().includes(query);
      const programCodeMatch = course.programCode?.toLowerCase().includes(query);
      const deptMatch = course.departmentName?.toLowerCase().includes(query);
      const lecturerMatch = course.assignedLecturers?.some(l => l.name?.toLowerCase().includes(query));

      return codeMatch || titleMatch || levelMatch || semesterMatch || programTitleMatch || programCodeMatch || deptMatch || lecturerMatch;
    });
  }, [courses, searchQuery]);

  // Filter departments for display
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return departments;
    return departments.filter(department => {
      const nameMatch = department.name?.toLowerCase().includes(query);
      const centerMatch = department.centerName?.toLowerCase().includes(query);
      return nameMatch || centerMatch;
    });
  }, [departments, searchQuery]);


  const resetProgramForm = () => {
    setNewProgramCode(''); setNewProgramTitle(''); setNewProgramCategory(''); setNewProgramDepartmentIds([]);
    setFormError('');
  };

  const resetCourseForm = () => {
    setNewCourseCode(''); setNewCourseTitle(''); setNewCreditHours('');
    setNewCourseLevel(''); setNewAcademicSemester(''); setNewCourseProgramId('');
    setFormError('');
  };

  const resetDepartmentForm = () => {
    setNewDepartmentName(''); setNewDepartmentCenterIds([]);
    setFormError('');
  };

  // Reset Edit Program Form
  const resetEditProgramForm = () => {
    setEditingProgram(null);
    setFormError('');
  };

  // Reset Edit Course Form
  const resetEditCourseForm = () => {
    setEditingCourse(null);
    setFormError('');
  };

  // Reset Edit Department Form
  const resetEditDepartmentForm = () => {
    setEditingDepartment(null);
    setFormError('');
  };


  const handleCreateProgram = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newProgramCode.trim() || !newProgramTitle.trim() || !newProgramCategory || newProgramDepartmentIds.length === 0) {
      setFormError("All program fields are required. Please select at least one department."); return;
    }
    setIsLoadingForm(true);
    const result = await createProgram({
      programCode: newProgramCode.trim(),
      programTitle: newProgramTitle.trim(),
      programCategory: newProgramCategory,
      departmentIds: newProgramDepartmentIds,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Program "${result.program.programTitle}" created!`);
      const refetchResult = await getPrograms();
      if(refetchResult.success) {
        setPrograms(refetchResult.programs);
      } else {
        toast.error("Failed to re-fetch programs after creation.");
      }
      setIsProgramDialogOpen(false); resetProgramForm();
    } else {
      setFormError(result.error || "Failed to create program.");
      toast.error(result.error || "Failed to create program.");
    }
  };

  // Handle Update Program
  const handleUpdateProgram = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!editingProgram?.id || !editingProgram.programCode.trim() || !editingProgram.programTitle.trim() || !editingProgram.programCategory || !editingProgram.departmentId) {
      setFormError("All program fields are required for update."); return;
    }
    setIsLoadingForm(true);
    const result = await updateProgram({
      id: editingProgram.id,
      programCode: editingProgram.programCode.trim(),
      programTitle: editingProgram.programTitle.trim(),
      programCategory: editingProgram.programCategory,
      departmentId: editingProgram.departmentId,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Program "${result.program.programTitle}" updated!`);
      const refetchResult = await getPrograms();
      if(refetchResult.success) {
        setPrograms(refetchResult.programs);
      } else {
        toast.error("Failed to re-fetch programs after update.");
      }
      setIsEditProgramDialogOpen(false); resetEditProgramForm();
    } else {
      setFormError(result.error || "Failed to update program.");
      toast.error(result.error || "Failed to update program.");
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newCourseCode.trim() || !newCourseTitle.trim() || !newCreditHours || !newCourseLevel || !newAcademicSemester || !newCourseProgramId) {
      setFormError("All course fields are required."); return;
    }
    if (isNaN(parseFloat(newCreditHours)) || parseFloat(newCreditHours) <= 0) {
        setFormError("Credit hours must be a positive number."); return;
    }

    setIsLoadingForm(true);
    const result = await createCourse({
      courseCode: newCourseCode.trim(),
      courseTitle: newCourseTitle.trim(),
      creditHours: parseFloat(newCreditHours),
      level: newCourseLevel,
      academicSemester: newAcademicSemester,
      programId: newCourseProgramId,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Course "${result.course.courseCode}" created!`);
      const refetchResult = await getCourses();
      if(refetchResult.success) {
        setCourses(refetchResult.courses);
      } else {
        toast.error("Failed to re-fetch courses after creation.");
      }
      setIsCourseDialogOpen(false); resetCourseForm();
    } else {
      setFormError(result.error || "Failed to create course.");
      toast.error(result.error || "Failed to create course.");
    }
  };

  // Handle Update Course
  const handleUpdateCourse = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!editingCourse?.id || !editingCourse.courseCode.trim() || !editingCourse.courseTitle.trim() || !editingCourse.creditHours || !editingCourse.level || !editingCourse.academicSemester || !editingCourse.programId) {
      setFormError("All course fields are required for update."); return;
    }
    if (isNaN(parseFloat(editingCourse.creditHours)) || parseFloat(editingCourse.creditHours) <= 0) {
        setFormError("Credit hours must be a positive number."); return;
    }
    setIsLoadingForm(true);
    const result = await updateCourse({
      id: editingCourse.id,
      courseCode: editingCourse.courseCode.trim(),
      courseTitle: editingCourse.courseTitle.trim(),
      creditHours: parseFloat(editingCourse.creditHours),
      level: editingCourse.level,
      academicSemester: editingCourse.academicSemester,
      programId: editingCourse.programId,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Course "${result.course.courseCode}" updated!`);
      const refetchResult = await getCourses();
      if(refetchResult.success) {
        setCourses(refetchResult.courses);
      } else {
        toast.error("Failed to re-fetch courses after update.");
      }
      setIsEditCourseDialogOpen(false); resetEditCourseForm();
    } else {
      setFormError(result.error || "Failed to update course.");
      toast.error(result.error || "Failed to update course.");
    }
  };


  // Handle Create Department
  const handleCreateDepartment = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newDepartmentName.trim() || newDepartmentCenterIds.length === 0) {
      setFormError("Department name is required and at least one center must be selected."); return;
    }

    setIsLoadingForm(true);
    const result = await createDepartment({
      name: newDepartmentName.trim(),
      centerIds: newDepartmentCenterIds,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Department "${result.department.name}" created!`);
      const refetchDepartmentsResult = await getDepartments();
      const refetchProgramsResult = await getPrograms();
      if(refetchDepartmentsResult.success) {
        setDepartments(refetchDepartmentsResult.departments);
      } else {
        toast.error("Failed to re-fetch departments after creation.");
      }
      if(refetchProgramsResult.success) {
        setPrograms(refetchProgramsResult.programs);
      }
      setIsDepartmentDialogOpen(false); resetDepartmentForm();
    } else {
      setFormError(result.error || "Failed to create department.");
      toast.error(result.error || "Failed to create department.");
    }
  };

  // Handle Update Department
  const handleUpdateDepartment = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!editingDepartment?.id || !editingDepartment.name.trim() || !editingDepartment.centerId) {
      setFormError("Department ID, name, and Center are required for update."); return;
    }

    setIsLoadingForm(true);
    const result = await updateDepartment({
      id: editingDepartment.id,
      name: editingDepartment.name.trim(),
      centerId: editingDepartment.centerId,
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Department "${result.department.name}" updated!`);
      const refetchDepartmentsResult = await getDepartments();
      const refetchProgramsResult = await getPrograms();
      if(refetchDepartmentsResult.success) {
        setDepartments(refetchDepartmentsResult.departments);
      } else {
        toast.error("Failed to re-fetch departments after update.");
      }
      if(refetchProgramsResult.success) {
        setPrograms(refetchProgramsResult.programs);
      }
      setIsEditDepartmentDialogOpen(false); resetEditDepartmentForm();
    } else {
      setFormError(result.error || "Failed to update department.");
      toast.error(result.error || "Failed to update department.");
    }
  };

  // Handler for deleting a department
  const handleDeleteDepartment = async () => {
    if (!deletingDepartment?.id) {
      console.error("Cannot delete department: Missing ID");
      toast.error("Cannot delete: Missing department ID");
      return { success: false, error: "Missing department ID" };
    }
    
    try {
      const stringId = typeof deletingDepartment.id === 'object' ? deletingDepartment.id.id : deletingDepartment.id;
      console.log("Sending department ID for deletion:", stringId);
      
      const result = await deleteDepartment(stringId);
      
      console.log("Delete department result:", result);
      
      // Ensure we have a valid result object
      const safeResult = result || { success: false, error: "No response from server" };
      
      if (safeResult.success) {
        toast.success(`Department "${deletingDepartment.name}" deleted successfully!`);
        // Refetch departments to update the UI
        const refetchResult = await getDepartments();
        if(refetchResult.success) {
          setDepartments(refetchResult.departments);
        } else {
          toast.error("Failed to re-fetch departments after deletion.");
        }
        // Also refetch programs as they may be affected
        const refetchProgramsResult = await getPrograms();
        if(refetchProgramsResult.success) {
          setPrograms(refetchProgramsResult.programs);
        }
        setIsDeleteDepartmentDialogOpen(false);
        setDeletingDepartment(null);
      } else {
        toast.error(safeResult.error || "Failed to delete department.");
      }
      
      return safeResult;
    } catch (error) {
      console.error("Error deleting department:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error deleting department: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Handler for deleting a program
  const handleDeleteProgram = async () => {
    if (!deletingProgram?.id) {
      console.error("Cannot delete program: Missing ID");
      toast.error("Cannot delete: Missing program ID");
      return { success: false, error: "Missing program ID" };
    }
    
    try {
      const stringId = typeof deletingProgram.id === 'object' ? deletingProgram.id.id : deletingProgram.id;
      console.log("Sending program ID for deletion:", stringId);
      
      const result = await deleteProgram(stringId);
      
      console.log("Delete program result:", result);
      
      // Ensure we have a valid result object
      const safeResult = result || { success: false, error: "No response from server" };
      
      if (safeResult.success) {
        toast.success(`Program "${deletingProgram.programTitle}" deleted successfully!`);
        // Refetch programs to update the UI
        const refetchResult = await getPrograms();
        if(refetchResult.success) {
          setPrograms(refetchResult.programs);
        } else {
          toast.error("Failed to re-fetch programs after deletion.");
        }
        // Also refetch courses as they may be affected
        const refetchCoursesResult = await getCourses();
        if(refetchCoursesResult.success) {
          setCourses(refetchCoursesResult.courses);
        }
        setIsDeleteProgramDialogOpen(false);
        setDeletingProgram(null);
      } else {
        toast.error(safeResult.error || "Failed to delete program.");
      }
      
      return safeResult;
    } catch (error) {
      console.error("Error deleting program:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error deleting program: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Handler for unassigning a course from all lecturers
  const handleUnassignCourse = async () => {
    if (!deletingCourse?.id) {
      console.error("Cannot unassign course: Missing ID");
      toast.error("Cannot unassign: Missing course ID");
      return { success: false, error: "Missing course ID" };
    }
    
    try {
      setIsUnassigningCourse(true);
      const stringId = typeof deletingCourse.id === 'object' ? deletingCourse.id.id : deletingCourse.id;
      console.log("Unassigning course with ID:", stringId);
      
      const result = await unassignCourseFromLecturers(stringId);
      
      console.log("Unassign course result:", result);
      
      // Ensure we have a valid result object
      const safeResult = result || { success: false, error: "No response from server" };
      
      if (safeResult.success) {
        toast.success(`Course "${deletingCourse.courseCode}" unassigned from ${safeResult.unassignedCount} lecturer(s)`);
        // Update the assigned lecturers state
        setCourseAssignedLecturers([]);
        
        // Refetch courses to update the UI with the latest assignments
        const refetchResult = await getCourses();
        if(refetchResult.success) {
          setCourses(refetchResult.courses);
        }
      } else {
        toast.error(safeResult.error || "Failed to unassign course.");
      }
      
      setIsUnassigningCourse(false);
      return safeResult;
    } catch (error) {
      console.error("Error unassigning course:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error unassigning course: ${errorMessage}`);
      setIsUnassigningCourse(false);
      return { success: false, error: errorMessage };
    }
  };

  // Handler for deleting a course
  const handleDeleteCourse = async () => {
    if (!deletingCourse?.id) {
      console.error("Cannot delete course: Missing ID");
      toast.error("Cannot delete: Missing course ID");
      return { success: false, error: "Missing course ID" };
    }
    
    // Debug logging
    console.log("Deleting course with ID:", deletingCourse.id);
    console.log("deletingCourse object:", JSON.stringify(deletingCourse));
    
    try {
      const stringId = typeof deletingCourse.id === 'object' ? deletingCourse.id.id : deletingCourse.id;
      console.log("Sending ID for deletion:", stringId);
      
      const result = await deleteCourse(stringId);
      
      console.log("Delete course result:", result);
      
      // Ensure we have a valid result object
      const safeResult = result || { success: false, error: "No response from server" };
      
      if (safeResult.success) {
        toast.success(`Course "${deletingCourse.courseCode}" deleted successfully!`);
        // Refetch courses to update the UI
        const refetchResult = await getCourses();
        if(refetchResult.success) {
          setCourses(refetchResult.courses);
        } else {
          toast.error("Failed to re-fetch courses after deletion.");
        }
        setIsDeleteCourseDialogOpen(false);
        setDeletingCourse(null);
      } else {
        toast.error(safeResult.error || "Failed to delete course.");
      }
      
      return safeResult;
    } catch (error) {
      console.error("Error deleting course:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error deleting course: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };


  // Handler for bulk course upload
  const handleBulkUpload = async (event) => {
    event.preventDefault();
    setFormError('');
    setBulkUploadStatus(null);
    if (!excelFile) {
        setFormError("Please select an Excel file to upload.");
        return;
    }

    setIsLoadingForm(true);
    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                setFormError("Excel file is empty or could not be parsed.");
                setIsLoadingForm(false);
                return;
            }
            
            // Map JSON data to expected course format and perform basic client-side validation
            const parsedCourses = json.map((row, index) => ({
                courseCode: String(row['Course Code'] || '').trim(),
                courseTitle: String(row['Course Title'] || '').trim(),
                creditHours: parseFloat(row['Credit Hours'] || 0),
                level: String(row['Level'] || '').trim().toUpperCase().replace(' ', '_'),
                academicSemester: String(row['Academic Semester'] || '').trim().toUpperCase().replace(' ', '_'),
                programCode: String(row['Program Code'] || '').trim(),
            }));

            // Validate against enum values client-side for better UX
            const validLevels = COURSE_LEVELS.map(l => l.value);
            const validSemesters = ACADEMIC_SEMESTERS.map(s => s.value);

            const coursesToSend = [];
            const clientValidationErrors = [];

            for (const course of parsedCourses) {
                if (!course.courseCode || !course.courseTitle || isNaN(course.creditHours) || course.creditHours <= 0 || !course.level || !course.academicSemester || !course.programCode) {
                    clientValidationErrors.push({ data: course, error: "Missing/invalid required field (code, title, credits, level, semester, programCode)." });
                    continue;
                }
                if (!validLevels.includes(course.level)) {
                    clientValidationErrors.push({ data: course, error: `Invalid level '${course.level}'. Must be one of: ${validLevels.join(', ')}` });
                    continue;
                }
                if (!validSemesters.includes(course.academicSemester)) {
                    clientValidationErrors.push({ data: course, error: `Invalid semester '${course.academicSemester}'. Must be one of: ${validSemesters.join(', ')}` });
                    continue;
                }
                coursesToSend.push(course);
            }

            if (clientValidationErrors.length > 0) {
                setFormError(`Client-side validation failed for ${clientValidationErrors.length} records. Please check format.`);
                setBulkUploadStatus({ createdCount: 0, failedCount: clientValidationErrors.length, failedRecords: clientValidationErrors });
                setIsLoadingForm(false);
                return;
            }
            if (coursesToSend.length === 0) {
                setFormError("No valid course records found after parsing and client-side validation.");
                setIsLoadingForm(false);
                return;
            }


            // Call server action for bulk upload
            const result = await bulkUploadCourses(coursesToSend);
            setBulkUploadStatus(result);
            if (result.success || result.failedCount > 0) {
                toast.success(result.message || `Bulk upload finished. Created: ${result.createdCount}, Failed: ${result.failedCount}.`);
                const refetchResult = await getCourses();
                if(refetchResult.success) {
                    setCourses(refetchResult.courses);
                } else {
                    toast.error("Failed to re-fetch courses after bulk upload.");
                }
                setIsBulkUploadDialogOpen(false);
                setExcelFile(null);
            } else {
                setFormError(result.error || "Bulk upload failed on server.");
                toast.error(result.error || "Bulk upload failed on server.");
            }

         };
        reader.readAsArrayBuffer(excelFile);

      } catch (error) {
        console.error("Client: Bulk upload error:", error);
        setFormError(`Error processing file: ${error.message}`);
        toast.error(`Error processing file: ${error.message}`);
      } finally {
        setIsLoadingForm(false);
      }
    };

    // Handler for assigning courses to lecturers
    const handleAssignCourses = async (event) => {
      event.preventDefault();
      setFormError('');
      if (selectedCoursesForAssignment.length === 0 || !selectedLecturerForAssignment) {
        setFormError("Please select at least one course and a lecturer for assignment."); return;
      }
      setIsLoadingForm(true);
      const result = await assignCoursesToLecturers({
        courseIds: selectedCoursesForAssignment,
        lecturerId: selectedLecturerForAssignment,
      });
      setIsLoadingForm(false);

      if (result.success) {
        toast.success(result.message || "Courses assigned successfully!");
        const refetchResult = await getCourses();
        if(refetchResult.success) {
         setCourses(refetchResult.courses);
        } else {
         toast.error("Failed to re-fetch courses after assignment.");
        }
        setIsAssignCoursesDialogOpen(false);
        setSelectedCoursesForAssignment([]);
        setSelectedLecturerForAssignment('');
      } else {
        setFormError(result.error || "Failed to assign courses.");
        toast.error(result.error || "Failed to assign courses.");
      }
    };

    // Handler for unassigning courses from lecturers
    const handleUnassignCourses = async (event) => {
      event.preventDefault();
      setFormError('');
      if (selectedCoursesForUnassignment.length === 0 || !selectedLecturerForUnassignment) {
        setFormError("Please select at least one course and a lecturer for unassignment."); return;
      }
      setIsLoadingForm(true);
      const result = await unassignCoursesFromLecturer({
        courseIds: selectedCoursesForUnassignment,
        lecturerId: selectedLecturerForUnassignment,
      });
      setIsLoadingForm(false);

      if (result.success) {
        toast.success(result.message || "Courses unassigned successfully!");
        const refetchResult = await getCourses();
        if(refetchResult.success) {
         setCourses(refetchResult.courses);
        } else {
         toast.error("Failed to re-fetch courses after unassignment.");
        }
        setIsUnassignCoursesDialogOpen(false);
        setSelectedCoursesForUnassignment([]);
        setSelectedLecturerForUnassignment('');
        setLecturerAssignedCourses([]);
      } else {
        setFormError(result.error || "Failed to unassign courses.");
        toast.error(result.error || "Failed to unassign courses.");
      }
    };

    // Handler to fetch lecturer's assigned courses when lecturer is selected for unassignment
    const handleLecturerSelectionForUnassignment = async (lecturerId) => {
      setSelectedLecturerForUnassignment(lecturerId);
      setSelectedCoursesForUnassignment([]);
      
      if (lecturerId) {
        // Filter courses to show only those assigned to the selected lecturer
        const assignedCourses = courses.filter(course => 
          course.assignedLecturers && course.assignedLecturers.some(lecturer => lecturer.id === lecturerId)
        );
        setLecturerAssignedCourses(assignedCourses);
      } else {
        setLecturerAssignedCourses([]);
      }
    };

    const clearSearch = () => setSearchQuery('');

    return (
      <>
        <Card className="bg-white dark:bg-slate-800/90 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Search bar */}
            <div className="relative flex-grow sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /></div>
              <Input id="search-programs-courses" type="text" placeholder={`Search ${activeTab === 'programs' ? 'programs' : activeTab === 'courses' ? 'courses' : 'departments'}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-11 pr-10 w-full ${dialogInputClass}`} />
              {searchQuery && (<Button variant="ghost" size="sm" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 h-full" onClick={clearSearch}><XCircle className="h-4 w-4" /><span className="sr-only">Clear search</span></Button>)}
            </div>
          {/* Add New buttons */}
          <div className="flex gap-2 flex-wrap justify-end">
            {/* Add Department Dialog/Button */}
            <Dialog open={isDepartmentDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetDepartmentForm(); } setIsDepartmentDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md">
                  <PlusCircle className="mr-2 h-4 w-4" /><span>New Department</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-700" /> Create New Department</DialogTitle>
                  <DialogDescription>Add a new academic department and assign it to a center.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDepartment}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="departmentName" className={dialogLabelClass}>Department Name <span className="text-red-700">*</span></Label>
                      <Input id="departmentName" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} placeholder="e.g., Department of Computer Science" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="departmentCenters" className={dialogLabelClass}>Assign to Centers <span className="text-red-700">*</span></Label>
                      <div className="border border-slate-300 dark:border-slate-600 rounded-md p-3 max-h-32 overflow-y-auto bg-white dark:bg-slate-700/80">
                        {centers.length > 0 ? (
                          <div className="space-y-2">
                            {centers.map(center => (
                              <div key={center.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`center-${center.id}`}
                                  checked={newDepartmentCenterIds.includes(center.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewDepartmentCenterIds(prev => [...prev, center.id]);
                                    } else {
                                      setNewDepartmentCenterIds(prev => prev.filter(id => id !== center.id));
                                    }
                                  }}
                                  disabled={isLoadingForm}
                                />
                                <Label htmlFor={`center-${center.id}`} className="text-sm font-normal cursor-pointer">
                                  {center.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No centers found.</div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select one or more centers for this department
                      </p>
                    </div>
                    {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoadingForm}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Create Department</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Program Dialog/Button */}
            <Dialog open={isProgramDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetProgramForm(); } setIsProgramDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md">
                  <PlusCircle className="mr-2 h-4 w-4" /><span>New Program</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-700" /> Create New Program</DialogTitle>
                  <DialogDescription>Add a new academic program to the system.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProgram}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="programCode" className={dialogLabelClass}>Program Code <span className="text-red-700">*</span></Label>
                      <Input id="programCode" value={newProgramCode} onChange={(e) => setNewProgramCode(e.target.value)} placeholder="e.g., BSc-CS" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="programTitle" className={dialogLabelClass}>Program Title <span className="text-red-700">*</span></Label>
                      <Input id="programTitle" value={newProgramTitle} onChange={(e) => setNewProgramTitle(e.target.value)} placeholder="e.g., Bachelor of Science in Computer Science" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="programCategory" className={dialogLabelClass}>Program Category <span className="text-red-700">*</span></Label>
                      <Select value={newProgramCategory} onValueChange={setNewProgramCategory} disabled={isLoadingForm}>
                        <SelectTrigger id="programCategory" className={dialogSelectTriggerClass}><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {PROGRAM_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="programDepartments" className={dialogLabelClass}>Assign to Departments <span className="text-red-700">*</span></Label>
                      <div className="border border-slate-300 dark:border-slate-600 rounded-md p-3 max-h-32 overflow-y-auto bg-white dark:bg-slate-700/80">
                        {departments.length > 0 ? (
                          <div className="space-y-2">
                            {departments.map(dept => (
                              <div key={dept.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dept-${dept.id}`}
                                  checked={newProgramDepartmentIds.includes(dept.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewProgramDepartmentIds(prev => [...prev, dept.id]);
                                    } else {
                                      setNewProgramDepartmentIds(prev => prev.filter(id => id !== dept.id));
                                    }
                                  }}
                                  disabled={isLoadingForm}
                                />
                                <Label htmlFor={`dept-${dept.id}`} className="text-sm font-normal cursor-pointer">
                                  {dept.name}
                                  {dept.centers && dept.centers.length > 0 && (
                                    <span className="text-xs text-slate-500 ml-1">
                                      ({dept.centers.map(c => c.name).join(', ')})
                                    </span>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No departments found.</div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select one or more departments for this program
                      </p>
                    </div>
                    {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoadingForm}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Create Program</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Course Dialog/Button */}
            <Dialog open={isCourseDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetCourseForm(); } setIsCourseDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md">
                  <PlusCircle className="mr-2 h-4 w-4" /><span>New Course</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-violet-700" /> Create New Course</DialogTitle>
                  <DialogDescription>Add a new course to an existing program.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCourse}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="courseCode" className={dialogLabelClass}>Course Code <span className="text-red-700">*</span></Label>
                      <Input id="courseCode" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} placeholder="e.g., CSCD101" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="courseTitle" className={dialogLabelClass}>Course Title <span className="text-red-700">*</span></Label>
                      <Input id="courseTitle" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g., Introduction to Programming" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="creditHours" className={dialogLabelClass}>Credit Hours <span className="text-red-700">*</span></Label>
                      <Input id="creditHours" type="number" step="0.5" value={newCreditHours} onChange={(e) => setNewCreditHours(e.target.value)} placeholder="e.g., 3.0" disabled={isLoadingForm} className={dialogInputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="courseLevel" className={dialogLabelClass}>Level <span className="text-red-700">*</span></Label>
                      <Select value={newCourseLevel} onValueChange={setNewCourseLevel} disabled={isLoadingForm}>
                        <SelectTrigger id="courseLevel" className={dialogSelectTriggerClass}><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {COURSE_LEVELS.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="academicSemester" className={dialogLabelClass}>Academic Semester <span className="text-red-700">*</span></Label>
                      <Select value={newAcademicSemester} onValueChange={setNewAcademicSemester} disabled={isLoadingForm}>
                        <SelectTrigger id="academicSemester" className={dialogSelectTriggerClass}><SelectValue placeholder="Select semester" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {ACADEMIC_SEMESTERS.map(sem => <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="courseProgramId" className={dialogLabelClass}>Program <span className="text-red-700">*</span></Label>
                      <Select value={newCourseProgramId} onValueChange={setNewCourseProgramId} disabled={isLoadingForm || programs.length === 0}>
                        <SelectTrigger id="courseProgramId" className={dialogSelectTriggerClass}><SelectValue placeholder="Select program" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {programs.length > 0 ? programs.map(program => (
                            <SelectItem key={program.id} value={program.id}>{program.programTitle} ({program.programCode})</SelectItem>
                          )) : <div className="px-3 py-2 text-sm text-slate-500">No programs found.</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoadingForm}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Create Course</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Bulk Upload Courses Dialog/Button */}
<Dialog open={isBulkUploadDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { setExcelFile(null); setBulkUploadStatus(null); setFormError(''); } setIsBulkUploadDialogOpen(open); }}>
  <DialogTrigger asChild>
    <Button variant="outline" className="text-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium h-10 px-5 text-sm rounded-lg shadow-md">
      <Upload className="mr-2 h-4 w-4" />
      Bulk Upload Courses
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-blue-700" /> Bulk Upload Courses</DialogTitle>
      <DialogDescription>
        Upload an Excel file (.xlsx) to create multiple courses at once.
        <a href="/course_upload_template.xlsx" download className="text-blue-600 hover:underline font-medium block mt-2">
          Download the required template here.
        </a>
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleBulkUpload}>
      <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="excelFile" className={dialogLabelClass}>Excel File (.xlsx) <span className="text-red-700">*</span></Label>
          <Input 
            id="excelFile" 
            type="file" 
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
            onChange={(e) => setExcelFile(e.target.files[0])} 
            disabled={isLoadingForm} 
            className={dialogInputClass} 
          />
        </div>

        {/* This section displays the results after an upload attempt */}
        {bulkUploadStatus && (
          <div className={`p-3 rounded-md text-xs border ${bulkUploadStatus.failedCount > 0 ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700' : 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'}`}>
            <p className="font-semibold mb-2">{bulkUploadStatus.message}</p>
            {bulkUploadStatus.failedRecords && bulkUploadStatus.failedRecords.length > 0 && (
              <ScrollArea className="h-24 mt-2 pr-3">
                <p className="font-bold">Failed Records:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {bulkUploadStatus.failedRecords.map((rec, index) => (
                    <li key={index}>
                      <span className="font-semibold">Code: {rec.data.courseCode || 'N/A'}</span> - {rec.error}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        )}

        {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
        <Button type="submit" disabled={isLoadingForm || !excelFile}>
          {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          Upload and Create
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

            {/* Assign Courses Dialog/Button */}
            <Dialog open={isAssignCoursesDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { setSelectedCoursesForAssignment([]); setSelectedLecturerForAssignment(''); setFormError(''); } setIsAssignCoursesDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-blue-700 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-700/30 font-medium h-10 px-5 text-sm rounded-lg shadow-md"><UserPlus className="mr-2 h-4 w-4" />Assign Courses</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-700" /> Assign Courses to Lecturer</DialogTitle>
                  <DialogDescription>Select courses and assign them to a lecturer.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignCourses}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="selectCourses" className={dialogLabelClass}>Courses to Assign <span className="text-red-700">*</span></Label>
                      {/* Courses Multi-Select */}
                      <ScrollArea className="h-32 border rounded-md p-2 bg-slate-50 dark:bg-slate-700/30">
                        {courses.length > 0 ? (
                            <ul className="list-none space-y-1">
                              {courses.map(course => (
                                  <li key={course.id} className={`flex items-center justify-between p-1 rounded-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 ${selectedCoursesForAssignment.includes(course.id) ? 'bg-slate-200 dark:bg-slate-700 font-semibold' : ''}`}
                                    onClick={() => {
                                      setSelectedCoursesForAssignment(prev => prev.includes(course.id)
                                          ? prev.filter(id => id !== course.id)
                                          : [...prev, course.id]
                                      );
                                    }}>
                                    <span className="text-sm">{course.courseCode} - {course.courseTitle}</span>
                                    {selectedCoursesForAssignment.includes(course.id) && <CheckSquare className="h-4 w-4 text-green-600" />}
                                  </li>
                              ))}
                            </ul>
                        ) : (
                            <p className="text-sm italic text-slate-500 text-center py-6">No courses available for assignment.</p>
                        )}
                      </ScrollArea>
                      {selectedCoursesForAssignment.length > 0 && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                              Selected: {selectedCoursesForAssignment.length} course(s).
                          </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="selectLecturer" className={dialogLabelClass}>Assign to Lecturer <span className="text-red-700">*</span></Label>
                      <Select value={selectedLecturerForAssignment} onValueChange={setSelectedLecturerForAssignment} disabled={isLoadingForm || lecturers.length === 0}>
                        <SelectTrigger id="selectLecturer" className={dialogSelectTriggerClass}><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {lecturers.length > 0 ? lecturers.map(lecturer => (
                            <SelectItem key={lecturer.id} value={lecturer.id}>{lecturer.name} ({lecturer.email})</SelectItem>
                          )) : <div className="px-3 py-2 text-sm text-slate-500">No lecturers found.</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoadingForm || selectedCoursesForAssignment.length === 0 || !selectedLecturerForAssignment}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Assign Courses</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Unassign Courses Dialog/Button */}
            <Dialog open={isUnassignCoursesDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { setSelectedCoursesForUnassignment([]); setSelectedLecturerForUnassignment(''); setLecturerAssignedCourses([]); setFormError(''); } setIsUnassignCoursesDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-red-700 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-700/30 font-medium h-10 px-5 text-sm rounded-lg shadow-md"><User className="mr-2 h-4 w-4" />Unassign Courses</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5 text-red-700" /> Unassign Courses from Lecturer</DialogTitle>
                  <DialogDescription>Select a lecturer and the courses to unassign from them.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUnassignCourses}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="selectLecturerForUnassignment" className={dialogLabelClass}>Select Lecturer <span className="text-red-700">*</span></Label>
                      <Select value={selectedLecturerForUnassignment} onValueChange={handleLecturerSelectionForUnassignment} disabled={isLoadingForm || lecturers.length === 0}>
                        <SelectTrigger id="selectLecturerForUnassignment" className={dialogSelectTriggerClass}><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                        <SelectContent className={dialogSelectContentClass}>
                          {lecturers.length > 0 ? lecturers.map(lecturer => (
                            <SelectItem key={lecturer.id} value={lecturer.id}>{lecturer.name} ({lecturer.email})</SelectItem>
                          )) : <div className="px-3 py-2 text-sm text-slate-500">No lecturers found.</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedLecturerForUnassignment && (
                      <div className="space-y-1.5">
                        <Label htmlFor="selectCoursesForUnassignment" className={dialogLabelClass}>Assigned Courses to Unassign <span className="text-red-700">*</span></Label>
                        <ScrollArea className="h-32 border rounded-md p-2 bg-slate-50 dark:bg-slate-700/30">
                          {lecturerAssignedCourses.length > 0 ? (
                              <ul className="list-none space-y-1">
                                {lecturerAssignedCourses.map(course => (
                                    <li key={course.id} className={`flex items-center justify-between p-1 rounded-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 ${selectedCoursesForUnassignment.includes(course.id) ? 'bg-red-100 dark:bg-red-900/30 font-semibold' : ''}`}
                                      onClick={() => {
                                        setSelectedCoursesForUnassignment(prev => prev.includes(course.id)
                                            ? prev.filter(id => id !== course.id)
                                            : [...prev, course.id]
                                        );
                                      }}>
                                      <span className="text-sm">{course.courseCode} - {course.courseTitle}</span>
                                      {selectedCoursesForUnassignment.includes(course.id) && <CheckSquare className="h-4 w-4 text-red-600" />}
                                    </li>
                                ))}
                              </ul>
                          ) : (
                              <p className="text-sm italic text-slate-500 text-center py-6">This lecturer has no assigned courses to unassign.</p>
                          )}
                        </ScrollArea>
                        {selectedCoursesForUnassignment.length > 0 && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                Selected for unassignment: {selectedCoursesForUnassignment.length} course(s).
                            </p>
                        )}
                      </div>
                    )}
                    
                    {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                    <Button type="submit" variant="destructive" disabled={isLoadingForm || selectedCoursesForUnassignment.length === 0 || !selectedLecturerForUnassignment}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Unassign Courses</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Updated TabsList to include Departments tab */}
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-4 flex-shrink-0">
            <TabsTrigger value="departments" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Department Management</TabsTrigger>
            <TabsTrigger value="programs" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Program Management</TabsTrigger>
            <TabsTrigger value="courses" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Course Management</TabsTrigger>
          </TabsList>

          {/* FIX: Changed parent div to flex-1 flex-col to better control height for TabsContent children */}
          <div className="flex-1 flex flex-col">
            {/* Departments Tab Content */}
            <TabsContent value="departments" className="h-full mt-0 pt-0 data-[state=inactive]:hidden">
              <ManageDepartmentsTab />
            </TabsContent>

            {/* Programs Tab Content */}
            <TabsContent value="programs" className="h-full mt-0 pt-0 data-[state=inactive]:hidden">
              {/* ======================= EDIT PROGRAM DIALOG (ADD THIS) ======================= */}
{editingProgram && (
  <Dialog open={isEditProgramDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetEditProgramForm(); } setIsEditProgramDialogOpen(open); }}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Edit2 className="h-5 w-5 text-violet-700" /> Edit Program</DialogTitle>
        <DialogDescription>Update the details for the program: {editingProgram.programCode}.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleUpdateProgram}>
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="editProgramCode" className={dialogLabelClass}>Program Code <span className="text-red-700">*</span></Label>
            <Input
              id="editProgramCode"
              value={editingProgram.programCode || ''}
              onChange={(e) => setEditingProgram(prev => ({ ...prev, programCode: e.target.value }))}
              placeholder="e.g., BSc-CS"
              disabled={isLoadingForm}
              className={dialogInputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editProgramTitle" className={dialogLabelClass}>Program Title <span className="text-red-700">*</span></Label>
            <Input
              id="editProgramTitle"
              value={editingProgram.programTitle || ''}
              onChange={(e) => setEditingProgram(prev => ({ ...prev, programTitle: e.target.value }))}
              placeholder="e.g., Bachelor of Science in Computer Science"
              disabled={isLoadingForm}
              className={dialogInputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editProgramCategory" className={dialogLabelClass}>Program Category <span className="text-red-700">*</span></Label>
            <Select
              value={editingProgram.programCategory || ''}
              onValueChange={(val) => setEditingProgram(prev => ({ ...prev, programCategory: val }))}
              disabled={isLoadingForm}
            >
              <SelectTrigger id="editProgramCategory" className={dialogSelectTriggerClass}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className={dialogSelectContentClass}>
                {PROGRAM_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editProgramDepartmentId" className={dialogLabelClass}>Department <span className="text-red-700">*</span></Label>
            <Select
              value={editingProgram.departmentId || ''}
              onValueChange={(val) => setEditingProgram(prev => ({ ...prev, departmentId: val }))}
              disabled={isLoadingForm || departments.length === 0}
            >
              <SelectTrigger id="editProgramDepartmentId" className={dialogSelectTriggerClass}><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent className={dialogSelectContentClass}>
                {departments.length > 0 ? departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name} ({dept.centerName})</SelectItem>
                )) : <div className="px-3 py-2 text-sm text-slate-500">No departments found.</div>}
              </SelectContent>
            </Select>
          </div>
          {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
          <Button type="submit" disabled={isLoadingForm}>
            {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)}
{/* ================================================================================= */}
              {/* FIX: Moved p-4 inside ScrollArea's content div */}
              <ScrollArea className="h-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/90">
                <div className="p-4"> {/* Added padding inside ScrollArea's content */}
                  {isLoadingForm && activeTab === 'programs' && (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                        <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                        <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                    </div>
                  )}
                  {searchQuery && filteredPrograms.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                      <Search className="h-10 w-10 mb-3" />
                      <p className="font-semibold">No programs found for "{searchQuery}".</p>
                      <Button variant="link" onClick={clearSearch} className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Clear Search</Button>
                    </div>
                  )}
                  {!isLoadingForm && filteredPrograms.length === 0 && !searchQuery && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                      <GraduationCap className="h-10 w-10 mb-3" />
                      <p className="font-semibold">No programs added yet. Start by creating one.</p>
                      <Button onClick={() => setIsProgramDialogOpen(true)} variant="link" className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Add First Program</Button>
                    </div>
                  )}
                  {!isLoadingForm && filteredPrograms.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPrograms.map(program => (
                        <Card key={program.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 flex-shrink-0 text-violet-700 dark:text-violet-500" />
                              {program.programTitle}
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5" />{program.programCode}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-1 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                <span>Category: <Badge variant="secondary" className="capitalize">{program.programCategory.toLowerCase()}</Badge></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                <span>Dept: {program.departmentName}</span>
                            </div>
                            {program.centerName && (
                              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                  <CheckSquare className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                  <span>Center: {program.centerName}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                              <BookText className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                              <span>Courses: {program.courseCount}</span>
                            </div>
                            <div className="flex justify-end gap-1 mt-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProgram(program); setIsEditProgramDialogOpen(true); }}>
                                    <Edit2 className="h-4 w-4" />
                                    <span className="sr-only">Edit Program</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                  onClick={() => { setDeletingProgram(program); setIsDeleteProgramDialogOpen(true); }}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Program</span>
                                </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Courses Tab Content */}
            <TabsContent value="courses" className="h-full mt-0 pt-0 data-[state=inactive]:hidden">
              
              {/* ======================= EDIT COURSE DIALOG ======================= */}
              {editingCourse && (
                <Dialog open={isEditCourseDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetEditCourseForm(); } setIsEditCourseDialogOpen(open); }}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Edit2 className="h-5 w-5 text-violet-700" /> Edit Course</DialogTitle>
                      <DialogDescription>Update the details for the course: {editingCourse.courseCode}.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCourse}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="editCourseCode" className={dialogLabelClass}>Course Code <span className="text-red-700">*</span></Label>
                          <Input
                            id="editCourseCode"
                            value={editingCourse.courseCode || ''}
                            onChange={(e) => setEditingCourse(prev => ({ ...prev, courseCode: e.target.value }))}
                            placeholder="e.g., CSCD101"
                            disabled={isLoadingForm}
                            className={dialogInputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="editCourseTitle" className={dialogLabelClass}>Course Title <span className="text-red-700">*</span></Label>
                          <Input
                            id="editCourseTitle"
                            value={editingCourse.courseTitle || ''}
                            onChange={(e) => setEditingCourse(prev => ({ ...prev, courseTitle: e.target.value }))}
                            placeholder="e.g., Introduction to Programming"
                            disabled={isLoadingForm}
                            className={dialogInputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="editCreditHours" className={dialogLabelClass}>Credit Hours <span className="text-red-700">*</span></Label>
                          <Input
                            id="editCreditHours"
                            type="number"
                            step="0.5"
                            value={editingCourse.creditHours || ''}
                            onChange={(e) => setEditingCourse(prev => ({ ...prev, creditHours: e.target.value }))}
                            placeholder="e.g., 3.0"
                            disabled={isLoadingForm}
                            className={dialogInputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="editCourseLevel" className={dialogLabelClass}>Level <span className="text-red-700">*</span></Label>
                          <Select
                            value={editingCourse.level || ''}
                            onValueChange={(val) => setEditingCourse(prev => ({ ...prev, level: val }))}
                            disabled={isLoadingForm}
                          >
                            <SelectTrigger id="editCourseLevel" className={dialogSelectTriggerClass}><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent className={dialogSelectContentClass}>
                              {COURSE_LEVELS.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="editAcademicSemester" className={dialogLabelClass}>Academic Semester <span className="text-red-700">*</span></Label>
                          <Select
                            value={editingCourse.academicSemester || ''}
                            onValueChange={(val) => setEditingCourse(prev => ({ ...prev, academicSemester: val }))}
                            disabled={isLoadingForm}
                          >
                            <SelectTrigger id="editAcademicSemester" className={dialogSelectTriggerClass}><SelectValue placeholder="Select semester" /></SelectTrigger>
                            <SelectContent className={dialogSelectContentClass}>
                              {ACADEMIC_SEMESTERS.map(sem => <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="editCourseProgramId" className={dialogLabelClass}>Program <span className="text-red-700">*</span></Label>
                          <Select
                            value={editingCourse.programId || ''}
                            onValueChange={(val) => setEditingCourse(prev => ({ ...prev, programId: val }))}
                            disabled={isLoadingForm || programs.length === 0}
                          >
                            <SelectTrigger id="editCourseProgramId" className={dialogSelectTriggerClass}><SelectValue placeholder="Select program" /></SelectTrigger>
                            <SelectContent className={dialogSelectContentClass}>
                              {programs.length > 0 ? programs.map(program => (
                                <SelectItem key={program.id} value={program.id}>{program.programTitle} ({program.programCode})</SelectItem>
                              )) : <div className="px-3 py-2 text-sm text-slate-500">No programs found.</div>}
                            </SelectContent>
                          </Select>
                        </div>
                        {formError && (<div className={dialogErrorClass}><FileWarning className="h-4 w-4"/> {formError}</div>)}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingForm}>Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoadingForm}>
                          {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              {/* ================================================================================= */}

              {/* FIX: Moved p-4 inside ScrollArea's content div */}
              <ScrollArea className="h-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/90">
                <div className="p-4"> {/* Added padding inside ScrollArea's content */}
                    {isLoadingForm && activeTab === 'courses' && (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                            <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                            <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                        </div>
                    )}
                    {searchQuery && filteredCourses.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                          <Search className="h-10 w-10 mb-3" />
                          <p className="font-semibold">No courses found for "{searchQuery}".</p>
                          <Button variant="link" onClick={clearSearch} className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Clear Search</Button>
                        </div>
                    )}
                    {!isLoadingForm && courses.length === 0 && !searchQuery && (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                            <BookOpen className="h-10 w-10 mb-3" />
                            <p className="font-semibold">No courses added yet. Start by creating a program first.</p>
                            <Button onClick={() => setIsCourseDialogOpen(true)} variant="link" className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200" disabled={programs.length === 0}>Add First Course</Button>
                        </div>
                    )}
                    {!isLoadingForm && filteredCourses.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCourses.map(course => (
                                <Card key={course.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <BookText className="h-5 w-5 flex-shrink-0 text-violet-700 dark:text-violet-500" />
                                            {course.courseTitle}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <Hash className="h-3.5 w-3.5" />{course.courseCode}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1 text-sm">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <span>Credits: {course.creditHours}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                            <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <span>Level: <Badge variant="secondary" className="capitalize">{course.level.toLowerCase().replace('_', ' ')}</Badge></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                            <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <span>Semester: <Badge variant="secondary" className="capitalize">{course.academicSemester.toLowerCase().replace('_', ' ')}</Badge></span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                            <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <span>Program: {course.programTitle} ({course.programCode})</span>
                                        </div>
                                        {course.departmentName && (
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                                <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                                <span>Dept: {course.departmentName}</span>
                                            </div>
                                        )}
                                        {course.assignedLecturers && course.assignedLecturers.length > 0 && (
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                                <User className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                                <span>Assigned: {course.assignedLecturers.map(l => l.name).join(', ')}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="flex justify-end gap-1 mt-2 px-4 pb-3">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCourse(course); setIsEditCourseDialogOpen(true); }}>
                                            <Edit2 className="h-4 w-4" />
                                            <span className="sr-only">Edit Course</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                          onClick={() => { 
                                            console.log("Course to delete:", course);
                                            setDeletingCourse(course);
                                            setCourseAssignedLecturers([]);
                                            
                                            // Check if course has assigned lecturers
                                            if (course.assignedLecturers && course.assignedLecturers.length > 0) {
                                              setCourseAssignedLecturers(course.assignedLecturers);
                                            }
                                            
                                            setIsDeleteCourseDialogOpen(true); 
                                          }}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete Course</span>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      <Dialog open={isDeleteDepartmentDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { setDeletingDepartment(null); } setIsDeleteDepartmentDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700"><Trash2 className="h-5 w-5" /> Delete Department</DialogTitle>
            <DialogDescription>Are you sure you want to delete the department: <strong>{deletingDepartment?.name}</strong>?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Warning:</p>
                <p>This action cannot be undone. Deleting this department may also affect programs and courses associated with it.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDepartmentDialogOpen(false)} disabled={isLoadingForm} className="border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  console.log("Delete button clicked for department:", deletingDepartment?.id);
                  if (!deletingDepartment?.id) {
                    console.error("Missing department ID for deletion");
                    toast.error("Cannot delete: Missing department ID");
                    return;
                  }
                  setIsLoadingForm(true);
                  await handleDeleteDepartment();
                } catch (error) {
                  console.error("Error in delete button handler:", error);
                  toast.error("Error deleting department");
                } finally {
                  setIsLoadingForm(false);
                }
              }}
              disabled={isLoadingForm} 
              className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold"
            >
              {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
              {isLoadingForm ? "Deleting..." : "Yes, Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Confirmation Dialog */}
      <Dialog open={isDeleteProgramDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { setDeletingProgram(null); } setIsDeleteProgramDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700"><Trash2 className="h-5 w-5" /> Delete Program</DialogTitle>
            <DialogDescription>Are you sure you want to delete the program: <strong>{deletingProgram?.programTitle}</strong> ({deletingProgram?.programCode})?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Warning:</p>
                <p>This action cannot be undone. Deleting this program may also affect courses associated with it.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteProgramDialogOpen(false)} disabled={isLoadingForm} className="border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  console.log("Delete button clicked for program:", deletingProgram?.id);
                  if (!deletingProgram?.id) {
                    console.error("Missing program ID for deletion");
                    toast.error("Cannot delete: Missing program ID");
                    return;
                  }
                  setIsLoadingForm(true);
                  await handleDeleteProgram();
                } catch (error) {
                  console.error("Error in delete button handler:", error);
                  toast.error("Error deleting program");
                } finally {
                  setIsLoadingForm(false);
                }
              }}
              disabled={isLoadingForm} 
              className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold"
            >
              {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
              {isLoadingForm ? "Deleting..." : "Yes, Delete Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={isDeleteCourseDialogOpen} onOpenChange={(open) => { 
          if (!open && !isLoadingForm) { 
            setDeletingCourse(null); 
            setCourseAssignedLecturers([]);
          } 
          setIsDeleteCourseDialogOpen(open); 
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700"><Trash2 className="h-5 w-5" /> Delete Course</DialogTitle>
            <DialogDescription>Are you sure you want to delete the course: <strong>{deletingCourse?.courseTitle}</strong> ({deletingCourse?.courseCode})?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Show assigned lecturers if any */}
            {courseAssignedLecturers.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm mb-4">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" /> This course is currently assigned to lecturers:
                </div>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  {courseAssignedLecturers.map((lecturer, index) => (
                    <li key={index}>{lecturer.name}</li>
                  ))}
                </ul>
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleUnassignCourse} 
                    disabled={isUnassigningCourse || isLoadingForm} 
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isUnassigningCourse ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <UserPlus className="mr-2 h-3 w-3"/>}
                    {isUnassigningCourse ? "Unassigning..." : "Unassign All Lecturers"}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Warning:</p>
                <p>This action cannot be undone. This will remove all assignments and associations for this course.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteCourseDialogOpen(false)} disabled={isLoadingForm || isUnassigningCourse} className="border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  console.log("Delete button clicked for course:", deletingCourse?.id);
                  if (!deletingCourse?.id) {
                    console.error("Missing course ID for deletion");
                    toast.error("Cannot delete: Missing course ID");
                    return;
                  }
                  
                  // Check if we need to unassign first
                  if (courseAssignedLecturers.length > 0) {
                    toast.error("Please unassign all lecturers before deleting this course");
                    return;
                  }
                  
                  setIsLoadingForm(true);
                  await handleDeleteCourse();
                } catch (error) {
                  console.error("Error in delete button handler:", error);
                  toast.error("Error deleting course");
                } finally {
                  setIsLoadingForm(false);
                }
              }} 
              disabled={isLoadingForm || isUnassigningCourse || courseAssignedLecturers.length > 0} 
              className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold"
            >
              {isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
              {isLoadingForm ? "Deleting..." : "Yes, Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }