// scripts/add-client.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addClient() {
  const shopDomain = process.argv[2];
  const voiceflowApiKey = process.argv[3];
  
  if (!shopDomain || !voiceflowApiKey) {
    GrawLogger.error('Usage: node scripts/add-client.js <shopDomain> <voiceflowApiKey>');
    process.exit(1);
  }
  
  try {
    const client = await prisma.client.upsert({
      where: { shopDomain },
      update: { voiceflowApiKey },
      create: { shopDomain, voiceflowApiKey }
    });
    
    GrawLogger.log(`Client added/updated: ${client.shopDomain}`);
  } catch (error) {
    GrawLogger.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addClient();