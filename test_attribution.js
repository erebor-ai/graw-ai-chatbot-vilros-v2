// Test script to simulate attribution flow
// This will help us debug the attribution tracking issue

const testShop = 'graw-ai.myshopify.com';
const baseUrl = 'https://graw-ai-chatbot-integration.fly.dev';

// Function to test local storage attribution
async function testLocalStorageAttribution() {
  GrawLogger.log('🧪 Testing local storage attribution flow...');
  
  const attributionData = {
    attributionType: 'local_anonymous',
    eventType: 'checkout_started',
    userId: 'test_user_123',
    sessionId: 'test_session_456',
    cartValue: 99.99,
    daysSinceInteraction: 2.5,
    interactionCount: 3,
    firstInteraction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    customerEmail: null,
    customerId: null
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/voiceflow?action=trackChatAttribution&shop=${testShop}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributionData)
    });
    
    const result = await response.json();
    GrawLogger.log('✅ Local attribution test response:', result);
    return result.success;
  } catch (error) {
    GrawLogger.error('❌ Local attribution test failed:', error);
    return false;
  }
}

// Function to test checkout tracking
async function testCheckoutTracking() {
  GrawLogger.log('🧪 Testing checkout tracking flow...');
  
  const checkoutData = {
    event: 'checkout_with_conversation',
    sessionId: 'test_checkout_session_789',
    userId: 'test_user_checkout_123',
    timestamp: new Date().toISOString(),
    conversationOngoing: true,
    cartValue: 149.99,
    itemCount: 2,
    shopDomain: testShop,
    customerEmail: 'test@example.com',
    customerId: 'test_customer_456'
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/voiceflow?action=trackCheckout&shop=${testShop}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    });
    
    const result = await response.json();
    GrawLogger.log('✅ Checkout tracking test response:', result);
    return result.success;
  } catch (error) {
    GrawLogger.error('❌ Checkout tracking test failed:', error);
    return false;
  }
}

// Function to check the results
async function checkResults() {
  GrawLogger.log('🔍 Checking attribution results...');
  
  try {
    const response = await fetch(`${baseUrl}/api/voiceflow?action=debugAttribution&shop=${testShop}`);
    const result = await response.json();
    GrawLogger.log('📊 Attribution debug results:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    GrawLogger.error('❌ Failed to check results:', error);
    return null;
  }
}

// Main test function
async function runTests() {
  GrawLogger.log('🚀 Starting attribution tracking tests...');
  GrawLogger.log('Shop:', testShop);
  GrawLogger.log('Base URL:', baseUrl);
  GrawLogger.log('---');
  
  // Check initial state
  GrawLogger.log('📋 Initial state:');
  await checkResults();
  GrawLogger.log('---');
  
  // Test local storage attribution
  const localTest = await testLocalStorageAttribution();
  GrawLogger.log('---');
  
  // Test checkout tracking
  const checkoutTest = await testCheckoutTracking();
  GrawLogger.log('---');
  
  // Check final state
  GrawLogger.log('📋 Final state:');
  const finalResults = await checkResults();
  GrawLogger.log('---');
  
  // Summary
  GrawLogger.log('📈 Test Summary:');
  GrawLogger.log('Local attribution test:', localTest ? '✅ PASS' : '❌ FAIL');
  GrawLogger.log('Checkout tracking test:', checkoutTest ? '✅ PASS' : '❌ FAIL');
  GrawLogger.log('Total records in database:', finalResults?.counts?.total || 0);
  
  if (finalResults?.counts?.total > 0) {
    GrawLogger.log('🎉 Attribution tracking is working! Records were successfully created.');
  } else {
    GrawLogger.log('⚠️ Attribution tracking might have issues. No records were created.');
  }
}

// Export for Node.js if running as a script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests };
  
  // Run tests if script is called directly
  if (require.main === module) {
    runTests().catch(GrawLogger.error);
  }
}

// For browser execution
if (typeof window !== 'undefined') {
  window.testAttribution = { runTests };
  GrawLogger.log('Attribution tests loaded. Run window.testAttribution.runTests() to start.');
}
