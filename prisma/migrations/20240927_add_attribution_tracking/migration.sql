-- CreateTable for Attribution Tracking
CREATE TABLE IF NOT EXISTS "AttributionTracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopDomain" TEXT NOT NULL,
    "attributionType" TEXT NOT NULL, -- 'same_session', 'local_anonymous', 'klaviyo_tracked'
    "eventType" TEXT NOT NULL, -- 'checkout_started', 'order_placed' (for future)
    "userId" TEXT,
    "customerId" TEXT,
    "customerEmail" TEXT,
    "sessionId" TEXT,
    "cartValue" REAL,
    "daysSinceInteraction" REAL,
    "interactionCount" INTEGER,
    "firstInteraction" DATETIME,
    "lastInteraction" DATETIME,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT -- JSON string for additional data
);

-- CreateIndex for faster queries
CREATE INDEX IF NOT EXISTS "AttributionTracking_shopDomain_idx" ON "AttributionTracking"("shopDomain");
CREATE INDEX IF NOT EXISTS "AttributionTracking_createdAt_idx" ON "AttributionTracking"("createdAt");
CREATE INDEX IF NOT EXISTS "AttributionTracking_eventType_idx" ON "AttributionTracking"("eventType");
