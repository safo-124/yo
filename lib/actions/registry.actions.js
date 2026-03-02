// lib/actions/registry.actions.js - Barrel re-export for backward compatibility
// Note: "use server" is declared in each individual module file

// Centers
export { getPotentialCoordinators, createCenter, updateCenter, getCenters, deleteCenterByRegistry, getPublicCenters, assignDepartmentsToCenter, unassignDepartmentsFromCenter, getCentersWithDepartments } from './registry/centers.actions';

// Users
export { createUserByRegistry, getAllUsers, updateUserRoleAndAssignmentsByRegistry, updateUserPasswordByRegistry, deleteUserByRegistry } from './registry/users.actions';

// Courses
export { createCourse, getCourses, updateCourse, deleteCourse, bulkUploadCourses, getLecturersForAssignment, assignCoursesToLecturers, unassignCourseFromLecturers, unassignCoursesFromLecturer } from './registry/courses.actions';

// Programs
export { createProgram, getPrograms, updateProgram, deleteProgram, getAvailablePrograms, assignProgramsToDepartments, unassignProgramsFromDepartments } from './registry/programs.actions';

// Departments
export { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentsWithPrograms, getAvailableDepartments, unassignCentersFromDepartment } from './registry/departments.actions';

// Claims
export { getAllClaimsSystemWide, getClaimsForStaffRegistry, processClaimByRegistry, processClaimByStaffRegistry, deleteClaimByRegistry } from './registry/claims.actions';

// Requests
export { getPendingSignupRequests, approveSignupRequest, rejectSignupRequest } from './registry/requests.actions';

// Summaries
export { getLecturerMonthlyClaimSummary, getMonthlyClaimsSummaryByGrouping, getSystemOverviewData, getAssignedCentersForStaffRegistry, getStaffRegistryDashboardStats } from './registry/summaries.actions';
