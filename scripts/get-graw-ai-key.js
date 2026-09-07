// scripts/get-graw-ai-key.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getGrawAiKey() {
  try {
    const client = await prisma.client.findUnique({
      where: { shopDomain: 'graw-ai.myshopify.com' },
      select: { voiceflowApiKey: true }
    });
    
    if (client) {
      GrawLogger.log(client.voiceflowApiKey);
    } else {
      GrawLogger.log('No API key found for graw-ai.myshopify.com');
    }
  } catch (error) {
    GrawLogger.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getGrawAiKey();
