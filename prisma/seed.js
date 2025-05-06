    // prisma/seed.js
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    // const { v4: uuidv4 } = require('uuid'); // REMOVE THIS LINE - no longer needed

    const prisma = new PrismaClient();

    async function main() {
      // --- Configuration for the Registry User ---
      const registryUserEmail = 'nanasafo122@gmail.com'; // Or your desired admin email
      const registryUserName = 'Registry Admin';
      const registryUserPassword = 'SecurePassword123!'; // IMPORTANT: Use the actual plain text password here, it will be hashed

      console.log(`Checking if registry user '${registryUserEmail}' exists...`);

      const existingUser = await prisma.user.findUnique({
        where: {
          email: registryUserEmail,
        },
      });

      if (existingUser) {
        console.log(`User '${registryUserEmail}' already exists. Skipping creation.`);
      } else {
        console.log(`Creating registry user '${registryUserEmail}'...`);
        const hashedPassword = await bcrypt.hash(registryUserPassword, 10); // Hash the password

        const newUser = await prisma.user.create({
          data: {
            // NO 'id' field here - Prisma will add it automatically due to @default(cuid()) in schema
            email: registryUserEmail,
            name: registryUserName,
            password: hashedPassword,
            role: 'REGISTRY', // This must match the enum value in your schema.prisma
          },
        });
        console.log(`Registry user '${newUser.email}' created successfully with ID: ${newUser.id}`);
      }
    }

    main()
      .then(async () => {
        console.log('Seeding process finished.');
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error('Error during seeding process:', e);
        await prisma.$disconnect();
        process.exit(1);
      });
    