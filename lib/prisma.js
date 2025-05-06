// lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, always create a new instance
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // Optional: You can add logging in development if needed
      // log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export default prisma;
