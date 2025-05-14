// prisma/seed.js
const { PrismaClient, Role, Designation } = require('@prisma/client'); // Keep Role and Designation
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding: Ensuring Registry Admin User exists ...`);

  // --- Configuration for the Registry User ---
  const registryUserEmail = 'nanasafo122@gmail.com'; // Or your desired admin email
  const registryUserName = 'Registry Admin';
  // IMPORTANT: Use a strong, unique password and manage it securely.
  // Consider using an environment variable for the default password in real scenarios.
  const registryUserPassword = 'SecurePassword123!'; 

  console.log(`Checking if registry user '${registryUserEmail}' exists...`);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: registryUserEmail,
    },
  });

  if (existingUser) {
    console.log(`User '${registryUserEmail}' (ID: ${existingUser.id}) already exists. Current role: ${existingUser.role}. Skipping creation.`);
    // Optional: Update existing registry user if needed (e.g., ensure role and designation)
    if (existingUser.role !== Role.REGISTRY || existingUser.designation !== Designation.PROFESSOR) {
      const updatedAdmin = await prisma.user.update({
        where: { email: registryUserEmail },
        data: {
          role: Role.REGISTRY,
          designation: Designation.PROFESSOR, // Or whatever designation is appropriate
          // Do NOT update password here unless intended and the plain text is known/re-entered
        },
      });
      console.log(`Updated existing user '${updatedAdmin.email}' to ensure REGISTRY role and designation.`);
    }
  } else {
    console.log(`Creating registry user '${registryUserEmail}'...`);
    const hashedPassword = await bcrypt.hash(registryUserPassword, 10); // Hash the password

    const newUser = await prisma.user.create({
      data: {
        email: registryUserEmail,
        name: registryUserName,
        password: hashedPassword,
        role: Role.REGISTRY, 
        designation: Designation.PROFESSOR, // Set a default designation, adjust as needed
      },
    });
    console.log(`Registry user '${newUser.email}' created successfully with ID: ${newUser.id}`);
  }

  console.log(`Seeding process for Registry Admin User finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding process:', e);
    await prisma.$disconnect();
    process.exit(1);
  });