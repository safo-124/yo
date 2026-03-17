// scripts/importCODeLCourses.js
// One-time script to import CODeL programs & courses from the Excel file.
// Usage: node scripts/importCODeLCourses.js

const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const path = require("path");

const prisma = new PrismaClient();

// ─── Map OSIS programme names → short program codes + category ───────────────
const PROGRAM_MAP = {
  "BACHELOR OF EDUCATION (UPPER PRIMARY) BY DISTANCE": {
    code: "BED-UP",
    title: "Bachelor of Education (Upper Primary) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF EDUCATION (JUNIOR HIGH SCHOOL) BY DISTANCE": {
    code: "BED-JHS",
    title: "Bachelor of Education (Junior High School) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF EDUCATION (BASIC EDUCATION) BY DISTANCE": {
    code: "BED-BE",
    title: "Bachelor of Education (Basic Education) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF EDUCATION (EARLY GRADE) BY DISTANCE": {
    code: "BED-EG",
    title: "Bachelor of Education (Early Grade) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF EDUCATION EARLY CHILDHOOD BY DISTANCE": {
    code: "BED-EC",
    title: "Bachelor of Education Early Childhood by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF ARTS (ENGLISH EDUCATION) BY DISTANCE": {
    code: "BA-ENG",
    title: "Bachelor of Arts (English Education) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF ARTS (SOCIAL STUDIES EDUCATION) BY DISTANCE": {
    code: "BA-SS",
    title: "Bachelor of Arts (Social Studies Education) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF BUSINESS ADMNISTRATION (ACCOUNTING) BY DISTANCE": {
    // Note: typo in Excel ("ADMNISTRATION") is intentional to match data
    code: "BBA-ACC",
    title: "Bachelor of Business Administration (Accounting) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT) BY DISTANCE": {
    code: "BBA-HRM",
    title: "Bachelor of Business Administration (Human Resource Management) by Distance",
    category: "UNDERGRADUATE",
  },
  "BACHELOR OF SCIENCE (MATHEMATICS EDUCATION) BY DISTANCE": {
    code: "BSC-MATH",
    title: "Bachelor of Science (Mathematics Education) by Distance",
    category: "UNDERGRADUATE",
  },
  "DIPLOMA IN BASIC EDUCATION BY DISTANCE": {
    code: "DIP-BE",
    title: "Diploma in Basic Education by Distance",
    category: "DIPLOMA",
  },
  "DIPLOMA IN EARLY GRADE BY DISTANCE": {
    code: "DIP-EG",
    title: "Diploma in Early Grade by Distance",
    category: "DIPLOMA",
  },
  "DIPLOMA IN EDUCATION BY DISTANCE": {
    code: "DIP-ED",
    title: "Diploma in Education by Distance",
    category: "DIPLOMA",
  },
};

// ─── Level & semester converters ─────────────────────────────────────────────
function toLevel(val) {
  const num = parseInt(String(val), 10);
  if ([100, 200, 300, 400, 500, 600].includes(num)) return `LEVEL_${num}`;
  return null;
}

function toSemester(val) {
  if (!val) return null;
  const s = String(val).trim().toUpperCase();
  if (s === "FIRST") return "FIRST_SEMESTER";
  if (s === "SECOND") return "SECOND_SEMESTER";
  if (s === "THIRD") return "THIRD_SEMESTER";
  return null;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  CODeL Course Importer");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ─── 1. Read Excel ─────────────────────────────────────────────────────
  const filePath = path.join(__dirname, "..", "public", "CODeL_New_Course_Codes_and_Titles_FINAL_23_03_2026.xlsx");
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets["Curriculum per Programme"];
  if (!ws) {
    console.error("ERROR: Sheet 'Curriculum per Programme' not found.");
    process.exit(1);
  }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Read ${rows.length - 1} rows from Excel.\n`);

  // ─── 2. Create programs (skip if already exists) ───────────────────────
  console.log("── Creating Programs ──────────────────────────────────────────");
  const programCodeToId = {};
  let programsCreated = 0;
  let programsSkipped = 0;

  for (const [, info] of Object.entries(PROGRAM_MAP)) {
    const existing = await prisma.program.findUnique({
      where: { programCode: info.code },
    });
    if (existing) {
      programCodeToId[info.code] = existing.id;
      programsSkipped++;
      console.log(`  SKIP  ${info.code} (already exists)`);
    } else {
      const created = await prisma.program.create({
        data: {
          programCode: info.code,
          programTitle: info.title,
          programCategory: info.category,
        },
      });
      programCodeToId[info.code] = created.id;
      programsCreated++;
      console.log(`  NEW   ${info.code} — ${info.title}`);
    }
  }
  console.log(`\n  Programs: ${programsCreated} created, ${programsSkipped} already existed.\n`);

  // ─── 3. Parse & import courses ─────────────────────────────────────────
  console.log("── Importing Courses ─────────────────────────────────────────");
  // Headers: [NEW CODE, COURSE TITLE, OSIS PROGRAMME, LEVEL, SEMESTER]
  const coursesToCreate = [];
  const skippedRows = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawCode = row[0];
    const rawTitle = row[1];
    const rawProgramName = row[2];
    const rawLevel = row[3];
    const rawSemester = row[4];

    // Skip section headers / empty rows — valid codes start with 2-5 letters then digits
    if (!rawCode || typeof rawCode !== "string" || !/^[A-Z]{2,5}\d{3}/.test(rawCode.trim())) {
      continue; // section header like "B. Ed (UPPER PRIMARY) – LEVEL L100"
    }

    const courseCode = rawCode.trim();
    const courseTitle = typeof rawTitle === "string" ? rawTitle.trim() : "";
    const programInfo = PROGRAM_MAP[String(rawProgramName || "").trim().toUpperCase()];
    const level = toLevel(rawLevel);
    const semester = toSemester(rawSemester);

    if (!courseTitle) {
      skippedRows.push({ row: i + 1, courseCode, reason: "Missing course title" });
      continue;
    }
    if (!programInfo) {
      skippedRows.push({ row: i + 1, courseCode, reason: `Unknown program: "${rawProgramName}"` });
      continue;
    }
    if (!level) {
      skippedRows.push({ row: i + 1, courseCode, reason: `Invalid level: "${rawLevel}"` });
      continue;
    }
    if (!semester) {
      skippedRows.push({ row: i + 1, courseCode, reason: `Invalid semester: "${rawSemester}"` });
      continue;
    }

    coursesToCreate.push({
      courseCode,
      courseTitle,
      creditHours: 3, // default — can be edited later in the app
      level,
      academicSemester: semester,
      programId: programCodeToId[programInfo.code],
      _programCode: programInfo.code,
    });
  }

  console.log(`  Parsed ${coursesToCreate.length} valid courses to import.`);
  if (skippedRows.length > 0) {
    console.log(`  Skipped ${skippedRows.length} rows due to issues:`);
    skippedRows.forEach((s) => console.log(`    Row ${s.row}: [${s.courseCode}] ${s.reason}`));
  }
  console.log();

  // ─── 4. Batch create in transaction ────────────────────────────────────
  let created = 0;
  let duplicates = 0;
  const failed = [];

  // Insert courses one by one (outside transaction to avoid timeouts)
  for (let i = 0; i < coursesToCreate.length; i++) {
    const course = coursesToCreate[i];
    try {
      await prisma.course.create({
        data: {
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          creditHours: course.creditHours,
          level: course.level,
          academicSemester: course.academicSemester,
          programId: course.programId,
        },
      });
      created++;
    } catch (err) {
      if (err.code === "P2002") {
        duplicates++;
      } else {
        failed.push({ courseCode: course.courseCode, error: err.message });
      }
    }
    if ((i + 1) % 50 === 0 || i === coursesToCreate.length - 1) {
      process.stdout.write(`  Progress: ${i + 1}/${coursesToCreate.length}\r`);
    }
  }

  // ─── 5. Summary ────────────────────────────────────────────────────────
  console.log("\n\n═══════════════════════════════════════════════════════════════");
  console.log("  IMPORT COMPLETE");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Programs created:  ${programsCreated}`);
  console.log(`  Programs existed:  ${programsSkipped}`);
  console.log(`  Courses created:   ${created}`);
  console.log(`  Duplicates:        ${duplicates}`);
  if (failed.length > 0) {
    console.log(`  Failed:            ${failed.length}`);
    failed.forEach((f) => console.log(`    ${f.courseCode}: ${f.error}`));
  }
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
