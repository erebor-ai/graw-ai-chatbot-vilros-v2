// scripts/list-clients.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { shopDomain: 'asc' }
    });
    
    GrawLogger.log('\nCurrent clients:');
    if (clients.length === 0) {
      GrawLogger.log('No clients found.');
    } else {
      clients.forEach(client => {
        GrawLogger.log(`- ${client.shopDomain}: ${client.voiceflowApiKey.substring(0, 6)}...`);
      });
    }
  } catch (error) {
    GrawLogger.error('Error listing clients:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listClients();