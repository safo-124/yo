// Initial excel template generation on app startup
// This file is used by next.config.mjs to run before server start

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

async function generateInitialTemplate() {
  console.log('Generating initial course Excel template...');
  const prisma = new PrismaClient();

  try {
    // Get all courses
    const allCourses = await prisma.course.findMany({
      include: {
        program: {
          select: { programCode: true }
        }
      },
      orderBy: { courseCode: 'asc' }
    });
    
    // Create a worksheet with headers
    const headers = ['Course Code', 'Course Title', 'Credit Hours', 'Level', 'Academic Semester', 'Program Code'];
    
    // Create worksheet data with headers and existing courses
    const worksheetData = [
      headers,
      ...allCourses.map(course => [
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
    
    fs.writeFileSync(filePath, excelBuffer);
    console.log('Course Excel template generated successfully');
  } catch (error) {
    console.error('Error generating Excel template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateInitialTemplate();
