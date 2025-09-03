'use server';

import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';

/**
 * Generates an Excel template file for course uploads with current courses data
 * This function must be called from a server action or route handler
 * @param {Array} courses - Array of course objects from the database
 * @returns {Promise<boolean>} True if successful
 */
export async function generateCourseExcelTemplate(courses) {
  try {
    // Create a worksheet with headers
    const headers = ['Course Code', 'Course Title', 'Credit Hours', 'Level', 'Academic Semester', 'Program Code'];
    
    // Create worksheet data with headers and existing courses
    const worksheetData = [
      headers,
      ...courses.map(course => [
        course.courseCode,
        course.courseTitle,
        course.creditHours,
        course.level,
        course.academicSemester,
        course.program?.programCode || ''
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Save to public directory
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, 'course_upload_template.xlsx');
    
    await fs.writeFile(filePath, excelBuffer);
    console.log(`[${new Date().toISOString()}] Course Excel template updated successfully`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating Excel template:`, error);
    return false;
  }
}
