// app/(dashboard)/registry/_components/ManageCoursesTab.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
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
  createProgram, getPrograms, createCourse, getCourses, getDepartments, getLecturersForAssignment, bulkUploadCourses, assignCoursesToLecturers, createDepartment
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import {
  PlusCircle, BookOpen, GraduationCap, Building2, Layers, CalendarDays, BookText, Hash, Clock, FileWarning, Loader2,
  List, CheckSquare, Search, XCircle, Upload, UserPlus, Home, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
// Import Table components for department listing
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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
  const [activeTab, setActiveTab] = useState("programs");
  const [departments, setDepartments] = useState(initialDepartments);
  const [programs, setPrograms] = useState(initialPrograms);
  const [courses, setCourses] = useState(initialCourses);
  const [lecturers, setLecturers] = useState(initialLecturers);
  const [centers, setCenters] = useState(initialCenters); // State for centers

  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isAssignCoursesDialogOpen, setIsAssignCoursesDialogOpen] = useState(false);

  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for Create Program
  const [newProgramCode, setNewProgramCode] = useState('');
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramCategory, setNewProgramCategory] = useState('');
  const [newProgramDepartmentId, setNewProgramDepartmentId] = useState('');

  // Form states for Create Course
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCreditHours, setNewCreditHours] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('');
  const [newAcademicSemester, setNewAcademicSemester] = useState('');
  const [newCourseProgramId, setNewCourseProgramId] = useState('');

  // Form state for Create Department (re-introduced newDepartmentCenterId state)
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentCenterId, setNewDepartmentCenterId] = useState(''); // Re-introduced for UI selection


  // Bulk Upload states
  const [excelFile, setExcelFile] = useState(null);
  const [bulkUploadStatus, setBulkUploadStatus] = useState(null);

  // Assign Courses states
  const [selectedCoursesForAssignment, setSelectedCoursesForAssignment] = useState([]);
  const [selectedLecturerForAssignment, setSelectedLecturerForAssignment] = useState('');

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
    setNewProgramCode(''); setNewProgramTitle(''); setNewProgramCategory(''); setNewProgramDepartmentId('');
    setFormError('');
  };

  const resetCourseForm = () => {
    setNewCourseCode(''); setNewCourseTitle(''); setNewCreditHours('');
    setNewCourseLevel(''); setNewAcademicSemester(''); setNewCourseProgramId('');
    setFormError('');
  };

  // Reset Department form (re-added newDepartmentCenterId to reset)
  const resetDepartmentForm = () => {
    setNewDepartmentName(''); setNewDepartmentCenterId('');
    setFormError('');
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!newProgramCode.trim() || !newProgramTitle.trim() || !newProgramCategory || !newProgramDepartmentId) {
      setFormError("All program fields are required."); return;
    }
    setIsLoadingForm(true);
    const result = await createProgram({
      programCode: newProgramCode.trim(),
      programTitle: newProgramTitle.trim(),
      programCategory: newProgramCategory,
      departmentId: newProgramDepartmentId,
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

  // Handle Create Department (re-introduced specific center selection)
  const handleCreateDepartment = async (event) => {
    event.preventDefault();
    setFormError('');
    // Re-added newDepartmentCenterId validation
    if (!newDepartmentName.trim() || !newDepartmentCenterId) {
      setFormError("Department name and Center are required."); return;
    }

    setIsLoadingForm(true);
    const result = await createDepartment({
      name: newDepartmentName.trim(),
      centerId: newDepartmentCenterId, // Use the selected center ID
    });
    setIsLoadingForm(false);
    if (result.success) {
      toast.success(`Department "${result.department.name}" created!`);
      // Re-fetch all departments and programs (as programs link to departments)
      const refetchDepartmentsResult = await getDepartments();
      const refetchProgramsResult = await getPrograms(); // Programs are linked to departments, so refresh
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

   const clearSearch = () => setSearchQuery('');

   return (
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
               <Button className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md"><Home className="mr-2 h-4 w-4" />New Department</Button>
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
                   {/* Re-introduced the 'Assign to Center' dropdown */}
                   <div className="space-y-1.5">
                     <Label htmlFor="departmentCenterId" className={dialogLabelClass}>Assign to Center <span className="text-red-700">*</span></Label>
                     <Select value={newDepartmentCenterId} onValueChange={setNewDepartmentCenterId} disabled={isLoadingForm || centers.length === 0}>
                       <SelectTrigger id="departmentCenterId" className={dialogSelectTriggerClass}><SelectValue placeholder="Select a center" /></SelectTrigger>
                       <SelectContent className={dialogSelectContentClass}>
                         {centers.length > 0 ? centers.map(center => (
                           <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                         )) : <div className="px-3 py-2 text-sm text-slate-500">No centers found.</div>}
                       </SelectContent>
                     </Select>
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
               <Button className="bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md"><PlusCircle className="mr-2 h-4 w-4" />New Program</Button>
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
                     <Label htmlFor="programDepartmentId" className={dialogLabelClass}>Department <span className="text-red-700">*</span></Label>
                     <Select value={newProgramDepartmentId} onValueChange={setNewProgramDepartmentId} disabled={isLoadingForm || departments.length === 0}>
                       <SelectTrigger id="programDepartmentId" className={dialogSelectTriggerClass}><SelectValue placeholder="Select department" /></SelectTrigger>
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
                   <Button type="submit" disabled={isLoadingForm}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Create Program</Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>

           {/* Add Course Dialog/Button */}
           <Dialog open={isCourseDialogOpen} onOpenChange={(open) => { if (!open && !isLoadingForm) { resetCourseForm(); } setIsCourseDialogOpen(open); }}>
             <DialogTrigger asChild>
               <Button className="bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-10 px-5 text-sm rounded-lg shadow-md"><PlusCircle className="mr-2 h-4 w-4" />New Course</Button>
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
               <Button variant="outline" className="text-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium h-10 px-5 text-sm rounded-lg shadow-md"><Upload className="mr-2 h-4 w-4" />Bulk Upload</Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-blue-700" /> Bulk Upload Courses</DialogTitle>
                 <DialogDescription>Upload multiple courses using an Excel file (.xlsx). Refer to template for format.</DialogDescription>
               </DialogHeader>
               <form onSubmit={handleBulkUpload}>
                 <div className="grid gap-4 py-4">
                   <div className="space-y-1.5">
                     <Label htmlFor="excelFile" className={dialogLabelClass}>Excel File (.xlsx) <span className="text-red-700">*</span></Label>
                     <Input id="excelFile" type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files[0])} disabled={isLoadingForm} className={dialogInputClass} />
                   </div>
                   {bulkUploadStatus && (
                     <div className={`p-2 rounded-md text-xs ${bulkUploadStatus.failedCount > 0 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
                       <p className="font-semibold">{bulkUploadStatus.message}</p>
                       {bulkUploadStatus.failedRecords && bulkUploadStatus.failedRecords.length > 0 && (
                         <ScrollArea className="h-24 mt-2 pr-2">
                           <p className="font-bold">Failed Records:</p>
                           <ul className="list-disc list-inside">
                             {bulkUploadStatus.failedRecords.map((rec, index) => (
                               <li key={index}>Row {index + 1}: {rec.error} (Code: {rec.data.courseCode || 'N/A'})</li>
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
                   <Button type="submit" disabled={isLoadingForm || !excelFile}>{isLoadingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Upload Courses</Button>
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
             {/* FIX: Moved p-4 inside ScrollArea's content div */}
             <ScrollArea className="h-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/90">
               <div className="p-4"> {/* Added padding inside ScrollArea's content */}
                 {isLoadingForm && activeTab === 'departments' && ( // Only show skeleton if form operation is ongoing AND this tab is active
                   <div className="space-y-4">
                       <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                       <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                       <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"/>
                   </div>
                 )}
                 {searchQuery && filteredDepartments.length === 0 && (
                   <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                     <Search className="h-10 w-10 mb-3" />
                     <p className="font-semibold">No departments found for "{searchQuery}".</p>
                     <Button variant="link" onClick={clearSearch} className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Clear Search</Button>
                   </div>
                 )}
                 {!isLoadingForm && filteredDepartments.length === 0 && !searchQuery && (
                   <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                     <Building2 className="h-10 w-10 mb-3" />
                     <p className="font-semibold">No departments added yet. Start by creating one.</p>
                     <Button onClick={() => setIsDepartmentDialogOpen(true)} variant="link" className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Add First Department</Button>
                   </div>
                 )}
                 {!isLoadingForm && filteredDepartments.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredDepartments.map(department => (
                       <Card key={department.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg hover:shadow-md transition-shadow">
                         <CardHeader className="pb-3">
                           <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                             <Building2 className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-500" />
                             {department.name}
                           </CardTitle>
                           <CardDescription className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                               <Home className="h-3.5 w-3.5" />Center: {department.centerName}
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-1 text-sm">
                           <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                             <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                             <span>Programs: {department.programCount}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                             <User className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                             <span>Lecturers: {department.lecturerCount}</span>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 )}
               </div>
             </ScrollArea>
           </TabsContent>

           {/* Programs Tab Content */}
           <TabsContent value="programs" className="h-full mt-0 pt-0 data-[state=inactive]:hidden">
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
   );
 }