// scripts/delete-client.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deleteClient() {
  const shopDomain = process.argv[2];
  
  if (!shopDomain) {
    GrawLogger.error('Usage: node scripts/delete-client.js <shopDomain>');
    process.exit(1);
  }
  
  try {
    await prisma.client.delete({
      where: { shopDomain }
    });
    
    GrawLogger.log(`Client deleted: ${shopDomain}`);
  } catch (error) {
    GrawLogger.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteClient();