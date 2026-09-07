import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator, useSearchParams } from "@remix-run/react";
import { 
  Page, 
  Text, 
  Card, 
  Layout, 
  SkeletonDisplayText,
  Banner,
  BlockStack,
  Button,
  Select,
  InlineStack,
  Badge,
  Grid,
  Tooltip
} from "@shopify/polaris";
import { RefreshIcon, InfoIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
import { ANALYTICS_START_DATE, VOICEFLOW_CONFIG } from "../config.server";

// Custom Tooltip Components for Charts
const CustomTooltip = ({ active, payload, label, metricName, displayName }: {
  active?: boolean;
  payload?: any[];
  label?: string;
  metricName?: string;
  displayName?: string;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0]?.payload;
  const value = payload[0]?.value;
  const fullDate = data?.fullDate || label;
  const finalDisplayName = displayName || metricName || payload[0]?.dataKey;

  return (
    <div className="recharts-default-tooltip" style={{
      margin: '0px',
      padding: '10px',
      backgroundColor: 'rgb(255, 255, 255)',
      border: '1px solid rgb(204, 204, 204)',
      whiteSpace: 'nowrap'
    }}>
      <p className="recharts-tooltip-label" style={{ margin: '0px', color: 'rgb(136, 132, 216)' }}>
        {fullDate}
      </p>
      <ul className="recharts-tooltip-item-list" style={{ padding: '0px', margin: '0px' }}>
        <li className="recharts-tooltip-item" style={{ display: 'block', paddingTop: '4px', paddingBottom: '4px', color: payload[0]?.color || 'rgb(136, 132, 216)' }}>
          <span className="recharts-tooltip-item-name">{finalDisplayName}</span>
          <span className="recharts-tooltip-item-separator"> : </span>
          <span className="recharts-tooltip-item-value">{value}</span>
        </li>
      </ul>
    </div>
  );
};

const MultiMetricTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0]?.payload;
  const fullDate = data?.fullDate || label;

  return (
    <div className="recharts-default-tooltip" style={{
      margin: '0px',
      padding: '10px',
      backgroundColor: 'rgb(255, 255, 255)',
      border: '1px solid rgb(204, 204, 204)',
      whiteSpace: 'nowrap'
    }}>
      <p className="recharts-tooltip-label" style={{ margin: '0px', color: 'rgb(136, 132, 216)' }}>
        {fullDate}
      </p>
      <ul className="recharts-tooltip-item-list" style={{ padding: '0px', margin: '0px' }}>
        {payload.map((entry, index) => (
          <li key={index} className="recharts-tooltip-item" style={{ 
            display: 'block', 
            paddingTop: '4px', 
            paddingBottom: '4px', 
            color: entry.color 
          }}>
            <span className="recharts-tooltip-item-name">{entry.name}</span>
            <span className="recharts-tooltip-item-separator"> : </span>
            <span className="recharts-tooltip-item-value">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { authenticate } from "../shopify.server";
import { getVoiceflowApiKey, validateVoiceflowApiKey, getVoiceflowProjectId, validateVoiceflowProjectId } from "../voiceflow.server";
import { VOICEFLOW_CONFIG } from "../config.server";
import prisma from "../db.server";

// Type definitions for better type safety
interface VoiceflowAnalyticsData {
  interactions: number | null;  // Main metric - total interactions
  sessions: number | null; // Will be broken down by user type
  shopifyCustomers: number | null; // Logged in Shopify customers
  klaviyoCustomers: number | null; // Klaviyo tracked customers  
  unknownCustomers: number | null; // Unknown/anonymous customers
  orderActions: number | null;
  cancelOrders: number | null;
  trackOrders: number | null;
  returnOrders: number | null;
  addsToCart: number | null;
  emailsCaptured: number | null;
  klaviyoEvents: number | null;
  // Attribution metrics
  attributedCheckouts: number | null;  // Total checkouts attributed to chat
  attributionRate: number | null;      // Percentage of checkouts attributed to chat
  avgDaysToCheckout: number | null;    // Average days between chat and checkout
  // Time-series data for charts
  timeSeriesData: Array<{
    date: string;
    completedSalesValue: number;
    interactions: number;
    attributedCartAdditionsValue: number;
    addsToCart: number;
    emailsCaptured: number;
    klaviyoEvents: number;
    shopifyCustomers: number;
    klaviyoCustomers: number;
    unknownCustomers: number;
    attributedCheckouts: number;
    attributedConversionRate: number;
    attributedCheckoutValue: number;
  }> | null;
  // Previous period data for percentage calculations
  previousPeriodData: {
    interactions: number | null;
    addsToCart: number | null;
    emailsCaptured: number | null;
    attributedCartAdditions: number | null;
    completedSalesCount: number | null;
    sessions: number | null;
    attributedCheckouts: number | null;
  } | null;
  attributedConversionRate: number | null;
  completedSalesValue: number | null;
}

interface LoaderData {
  analyticsData: VoiceflowAnalyticsData | null;
  error: string | null;
  dateRange: {
    from: string;
    to: string;
    currencySymbol: string;
    label: string;
  };
}

// KPI Card Component with percentage change and info tooltip
function KPICard({ 
  title, 
  value, 
  previousValue,
  isLoading,
  tooltipContent
}: { 
  title: string; 
  value: number | null; 
  previousValue: number | null;
  isLoading: boolean;
  tooltipContent: string;
}) {
  // Calculate percentage change with better error handling
  const calculatePercentageChange = () => {
    // If either value is null, don't show percentage
    if (previousValue === null || value === null) {
      return { percentage: null, trend: 'neutral' as const };
    }
    
    // Handle division by zero case
    if (previousValue === 0) {
      if (value === 0) {
        return { percentage: '0%', trend: 'neutral' as const };
      }
      return { percentage: value > 0 ? '+100%' : 'N/A', trend: value > 0 ? 'positive' : 'neutral' as const };
    }
    
    // Calculate percentage change
    const change = ((value - previousValue) / previousValue) * 100;
    
    // Handle NaN or infinite values
    if (!isFinite(change)) {
      return { percentage: 'N/A', trend: 'neutral' as const };
    }
    
    const trend = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    const sign = change > 0 ? '+' : '';
    
    return { 
      percentage: `${sign}${Math.round(change)}%`, 
      trend 
    };
  };
  
  const { percentage, trend } = calculatePercentageChange();
  
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <Text variant="headingMd" as="h2">
            {title}
          </Text>
          <InlineStack gap="200" align="end">
            <Tooltip content={tooltipContent}>
              <Button icon={InfoIcon} size="micro" />
            </Tooltip>
            {percentage && (
              <Badge 
                tone={trend === 'positive' ? 'success' : trend === 'negative' ? 'critical' : 'info'}
              >
                {percentage}
              </Badge>
            )}
          </InlineStack>
        </InlineStack>
        
        {isLoading ? (
          <SkeletonDisplayText size="large" />
        ) : value !== null ? (
          <Text variant="heading2xl" as="p">
            {value.toLocaleString()}
          </Text>
        ) : (
          <Text variant="heading2xl" as="p" tone="subdued">
            —
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}

// Chart Card Component with info tooltip
function ChartCard({ 
  title, 
  children,
  height = 300,
  tooltipContent
}: { 
  title: string; 
  children: React.ReactNode;
  height?: number;
  tooltipContent: string;
}) {
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <Text variant="headingMd" as="h2">
            {title}
          </Text>
          <Tooltip content={tooltipContent}>
            <Button icon={InfoIcon} size="micro" />
          </Tooltip>
        </InlineStack>
        <div style={{ height: `${height}px`, width: '100%' }}>
          {children}
        </div>
      </BlockStack>
    </Card>
  );
}

// Helper function to generate a complete date range with zero-filled data
function generateCompleteTimeRange(dateRange: string, realData: any[] = []) {
  const now = new Date();
  const isHourly = dateRange === 'today' || dateRange === 'yesterday';
  
  // Create a map of existing data keyed by date/hour
  const dataMap = new Map<string, any>();
  
  // Process existing real data into the map
  if (realData && Array.isArray(realData)) {
    realData.forEach(item => {
      try {
        // Handle both API format (item.date) and processed format (already has date)
        let date: Date;
        if (item.date) {
          // This is from the API processing
          date = new Date(item.date);
        } else {
          // This is already processed data, skip it
          return;
        }
        
        if (!isNaN(date.getTime())) {
          const key = isHourly 
            ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
            : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          dataMap.set(key, item);
        }
      } catch (e) {
        console.warn('Invalid date in real data:', item.date || item);
      }
    });
  }
  
  const result = [];
  
  if (isHourly) {
    // Generate hourly data for today/yesterday
    const targetDate = dateRange === 'today' ? new Date(now) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(targetDate);
      hourDate.setHours(hour, 0, 0, 0);
      
      const key = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()}-${hour}`;
      const existingData = dataMap.get(key);
      
      const hourDisplay = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
      
      result.push({
        name: hourDisplay,
        fullDate: hourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${hourDisplay}`,
        interactions: existingData?.interactions || 0,
        addsToCart: existingData?.addsToCart || 0,
        emailsCaptured: existingData?.emailsCaptured || 0,
        klaviyoEvents: existingData?.klaviyoEvents || 0,
        shopifyCustomers: existingData?.shopifyCustomers || 0,
        klaviyoCustomers: existingData?.klaviyoCustomers || 0,
        unknownCustomers: existingData?.unknownCustomers || 0,
        attributedCheckouts: existingData?.attributedCheckouts || 0,
        completedSalesCount: existingData?.completedSalesCount || 0,
        completedSalesValue: existingData?.completedSalesValue || 0,
        attributedCheckoutValue: existingData?.attributedCheckoutValue || 0,
        attributedCartAdditionsValue: existingData?.attributedCartAdditionsValue || 0,
        attributedCartAdditions: existingData?.attributedCartAdditions || 0
      });
    }
  } else {
    // Generate daily data for other ranges
    const days = dateRange === 'last7days' ? 7 :
                dateRange === 'last14days' ? 14 :
                dateRange === 'last30days' ? 30 : 7;
    
    for (let i = 0; i < days; i++) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() - (days - 1 - i));
      dayDate.setHours(0, 0, 0, 0);
      
      const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
      const existingData = dataMap.get(key);
      
      // Format day as two digits (01, 02, etc.)
      const dayNumber = dayDate.getDate().toString().padStart(2, '0');
      
      result.push({
        name: dayNumber,
        fullDate: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        interactions: existingData?.interactions || 0,
        addsToCart: existingData?.addsToCart || 0,
        emailsCaptured: existingData?.emailsCaptured || 0,
        klaviyoEvents: existingData?.klaviyoEvents || 0,
        shopifyCustomers: existingData?.shopifyCustomers || 0,
        klaviyoCustomers: existingData?.klaviyoCustomers || 0,
        unknownCustomers: existingData?.unknownCustomers || 0,
        attributedCheckouts: existingData?.attributedCheckouts || 0,
        completedSalesCount: existingData?.completedSalesCount || 0,
        completedSalesValue: existingData?.completedSalesValue || 0,
        attributedCheckoutValue: existingData?.attributedCheckoutValue || 0,
        attributedCartAdditionsValue: existingData?.attributedCartAdditionsValue || 0,
        attributedCartAdditions: existingData?.attributedCartAdditions || 0
      });
    }
  }
  
  return result;
}

// Helper function to generate complete time range specifically for chart data from API results
function generateCompleteTimeRangeForCharts(dateRange: string, apiData: any[] = []) {
  const now = new Date();
  const isHourly = dateRange === 'today' || dateRange === 'yesterday';
  
  // Create a map of existing API data keyed by date/hour
  const apiDataMap = new Map<string, any>();
  
  // Process API data into the map (apiData has structure: {date: string, interactions: number, ...})
  console.log('Processing API data for charts:', apiData.length, 'items');
  console.log('Sample API item:', apiData[0]);
  
  if (apiData && Array.isArray(apiData)) {
    apiData.forEach((item, index) => {
      try {
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {
          const key = isHourly 
            ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
            : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          
          // Aggregate data for the same key instead of overwriting
          if (!apiDataMap.has(key)) {
            apiDataMap.set(key, {
              interactions: 0,
              addsToCart: 0,
              emailsCaptured: 0,
              klaviyoEvents: 0,
              shopifyCustomers: 0,
              klaviyoCustomers: 0,
              unknownCustomers: 0,
              attributedCheckouts: 0,
            attributedCartAdditions: 0,
            attributedConversionRate: 0,
            completedSalesCount: 0,
            completedSalesValue: 0,
              attributedCartAdditionsValue: 0
            });
          }
          
          const existing = apiDataMap.get(key)!;
          existing.interactions += item.interactions || 0;
          existing.addsToCart = Math.max(existing.addsToCart, item.addsToCart || 0);
          existing.emailsCaptured = Math.max(existing.emailsCaptured, item.emailsCaptured || 0);
          existing.klaviyoEvents = Math.max(existing.klaviyoEvents, item.klaviyoEvents || 0);
          existing.shopifyCustomers = Math.max(existing.shopifyCustomers, item.shopifyCustomers || 0);
          existing.klaviyoCustomers = Math.max(existing.klaviyoCustomers, item.klaviyoCustomers || 0);
          existing.unknownCustomers = Math.max(existing.unknownCustomers, item.unknownCustomers || 0);
          // FIXED: Don't sum attribution checkouts - they should be unique counts per time period
          // Use the maximum value instead of summing to avoid double counting for counts
          existing.attributedCheckouts = Math.max(existing.attributedCheckouts, item.attributedCheckouts || 0);
          existing.attributedCartAdditions = Math.max(existing.attributedCartAdditions, item.attributedCartAdditions || 0);
          existing.completedSalesCount = Math.max(existing.completedSalesCount, item.completedSalesCount || 0);

          // For values, we also use Math.max because the data is already aggregated by day
          existing.completedSalesValue = Math.max(existing.completedSalesValue, item.completedSalesValue || 0);
          existing.attributedCheckoutValue = Math.max(existing.attributedCheckoutValue, item.attributedCheckoutValue || 0);
          existing.attributedCartAdditionsValue = Math.max(existing.attributedCartAdditionsValue, item.attributedCartAdditionsValue || 0);

          
          if (index < 2) {
            console.log(`Aggregated API item ${index}:`, { key, existing });
          }
        }
      } catch (e) {
        console.warn('Invalid date in API data:', item.date);
      }
    });
  }
  
  console.log('API data map size:', apiDataMap.size);
  
  const result = [];
  
  if (isHourly) {
    // Generate hourly data for today/yesterday
    const targetDate = dateRange === 'today' ? new Date(now) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(targetDate);
      hourDate.setHours(hour, 0, 0, 0);
      
      const key = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()}-${hour}`;
      const existingData = apiDataMap.get(key);
      
      const hourDisplay = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
      
      result.push({
        name: hourDisplay,
        fullDate: hourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${hourDisplay}`,
        interactions: existingData?.interactions || 0,
        addsToCart: existingData?.addsToCart || 0,
        emailsCaptured: existingData?.emailsCaptured || 0,
        klaviyoEvents: existingData?.klaviyoEvents || 0,
        shopifyCustomers: existingData?.shopifyCustomers || 0,
        klaviyoCustomers: existingData?.klaviyoCustomers || 0,
        unknownCustomers: existingData?.unknownCustomers || 0,
        attributedCheckouts: existingData?.attributedCheckouts || 0,
        completedSalesCount: existingData?.completedSalesCount || 0,
        attributedConversionRate: existingData?.attributedConversionRate || 0,
        completedSalesValue: existingData?.completedSalesValue || 0,
        attributedCheckoutValue: existingData?.attributedCheckoutValue || 0,
        attributedCartAdditionsValue: existingData?.attributedCartAdditionsValue || 0,
        attributedCartAdditions: existingData?.attributedCartAdditions || 0
      });
    }
  } else {
    // Generate daily data for other ranges
    const days = dateRange === 'last7days' ? 7 :
                dateRange === 'last14days' ? 14 :
                dateRange === 'last30days' ? 30 : 7;
    
    for (let i = 0; i < days; i++) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() - (days - 1 - i));
      dayDate.setHours(0, 0, 0, 0);
      
      const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
      const existingData = apiDataMap.get(key);
      
      // Format day as two digits (01, 02, etc.)
      const dayNumber = dayDate.getDate().toString().padStart(2, '0');
      
      result.push({
        name: dayNumber,
        fullDate: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        interactions: existingData?.interactions || 0,
        addsToCart: existingData?.addsToCart || 0,
        emailsCaptured: existingData?.emailsCaptured || 0,
        klaviyoEvents: existingData?.klaviyoEvents || 0,
        shopifyCustomers: existingData?.shopifyCustomers || 0,
        klaviyoCustomers: existingData?.klaviyoCustomers || 0,
        unknownCustomers: existingData?.unknownCustomers || 0,
        attributedCheckouts: existingData?.attributedCheckouts || 0,
        completedSalesCount: existingData?.completedSalesCount || 0,
        attributedConversionRate: existingData?.attributedConversionRate || 0,
        completedSalesValue: existingData?.completedSalesValue || 0,
        attributedCheckoutValue: existingData?.attributedCheckoutValue || 0,
        attributedCartAdditionsValue: existingData?.attributedCartAdditionsValue || 0,
        attributedCartAdditions: existingData?.attributedCartAdditions || 0
      });
    }
  }
  
  return result;
}

// Helper function to process real API time series data
function processApiTimeSeriesData(analyticsData: VoiceflowAnalyticsData | null, dateRange: string) {
  // Check if we're in development mode - using hostname as a more reliable indicator
  // since process.env.NODE_ENV might not be available in the browser context
  const isDevelopment = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('127.0.0.1') ||
                        window.location.hostname.includes('dev'));
  
  try {
    // If we have chart-ready time series data from the API, use it directly
    if (analyticsData?.timeSeriesData && Array.isArray(analyticsData.timeSeriesData) && analyticsData.timeSeriesData.length > 0) {
      console.log('Using chart-ready time series data from loader:', analyticsData.timeSeriesData.length, 'data points');
      console.log('Sample chart-ready data:', analyticsData.timeSeriesData.slice(0, 2));
      return analyticsData.timeSeriesData;
    }
    
    // If no real data exists, return empty data for production or mock data for development only
    if (isDevelopment) {
      console.log('Development mode: using mock data');
      return generateMockChartData(dateRange);
    } else {
      // Production: always return empty data with complete date range, never show mock data
      console.log('Production mode: no real data available, returning empty data');
      return generateCompleteTimeRange(dateRange);
    }
  } catch (error) {
    console.error('Error processing API time series data:', error);
    
    // On error, return empty data for production or mock data for development only
    if (isDevelopment) {
      return generateMockChartData(dateRange);
    } else {
      return generateCompleteTimeRange(dateRange);
    }
  }
}

// Helper function to generate mock chart data (separated for clarity)
function generateMockChartData(dateRange: string) {
  // For now, generate mock data since we don't have real timeSeriesData yet
  // This will be replaced when we integrate with real API data
  
  const now = new Date();
  
  // For "today" and "yesterday", generate hourly data points
  if (dateRange === 'today' || dateRange === 'yesterday') {
    const targetDate = dateRange === 'today' ? new Date(now) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const hourlyData = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(targetDate);
      hourDate.setHours(hour, 0, 0, 0);
      
      const baseInteractions = 15 + (hour % 8) * 5; // Simulate daily patterns
      const hourDisplay = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
      
      hourlyData.push({
        name: hourDisplay,
        fullDate: hourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        interactions: baseInteractions + Math.floor(hour * 0.5),
        addsToCart: Math.max(0, Math.floor((baseInteractions * 0.15) + (hour % 4))),
        emailsCaptured: Math.max(0, Math.floor((baseInteractions * 0.1) + (hour % 3))),
        klaviyoEvents: Math.max(0, Math.floor((baseInteractions * 0.2) + (hour % 5))),
        shopifyCustomers: Math.max(0, Math.floor((baseInteractions * 0.3) + (hour % 6))),
        klaviyoCustomers: Math.max(0, Math.floor((baseInteractions * 0.25) + (hour % 4))),
        unknownCustomers: Math.max(0, Math.floor((baseInteractions * 0.45) + (hour % 7))),
        attributedCheckouts: Math.max(0, Math.floor((baseInteractions * 0.08) + (hour % 3))),
        attributedCartAdditions: Math.max(0, Math.floor((baseInteractions * 0.12) + (hour % 4)))
      });
    }
    return hourlyData;
  }
  
  // For other ranges, generate daily data
  const days = dateRange === 'last7days' ? 7 :
              dateRange === 'last14days' ? 14 :
              dateRange === 'last30days' ? 30 : 7;
  
  const dailyData = [];
  for (let i = 0; i < days; i++) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - (days - 1 - i));
    dayDate.setHours(0, 0, 0, 0);
    
    const baseInteractions = 80 + (i % 10) * 15; // Simulate variation
    
    // Format day as two digits (01, 02, etc.) for consistency
    const dayNumber = dayDate.getDate().toString().padStart(2, '0');
    
    dailyData.push({
      name: dayNumber,
      fullDate: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      interactions: baseInteractions + Math.floor(i * 2),
      addsToCart: Math.max(0, Math.floor((baseInteractions * 0.12) + (i % 3))),
      emailsCaptured: Math.max(0, Math.floor((baseInteractions * 0.08) + (i % 4))),
      klaviyoEvents: Math.max(0, Math.floor((baseInteractions * 0.18) + (i % 5))),
      shopifyCustomers: Math.max(0, Math.floor((baseInteractions * 0.25) + (i % 4))),
      klaviyoCustomers: Math.max(0, Math.floor((baseInteractions * 0.20) + (i % 3))),
      unknownCustomers: Math.max(0, Math.floor((baseInteractions * 0.55) + (i % 8))),
      attributedCheckouts: Math.max(0, Math.floor((baseInteractions * 0.06) + (i % 2))),
      attributedCartAdditions: Math.max(0, Math.floor((baseInteractions * 0.10) + (i % 3)))
    });
  }
  
  return dailyData;
}

// Helper function to calculate date ranges
function getDateRange(range: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        start: today,
        end: now
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return {
        start: yesterday,
        end: endOfYesterday
      };
    case 'last7days':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'last14days':
      return {
        start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'last30days':
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    default:
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
  }
}

// Helper function to process time series data from API responses
function processTimeSeriesData(
  results: PromiseSettledResult<any>[], 
  functionIdMappings: any,
  startDate: Date,
  dateRangeParam: string,
  completedSales: any[],
  attributions: any[] = [],
  cartAttributions: any[] = []
) {
  try {
    // Create a map to aggregate data by time period
    const timeSeriesMap = new Map<string, {
      date: string;
      interactions: number;
      addsToCart: number;
      emailsCaptured: number;
      klaviyoEvents: number;
      shopifyCustomers: number;
      klaviyoCustomers: number;
      unknownCustomers: number;
      attributedCheckouts: number;
      attributedCartAdditions: number;
      attributedConversionRate: number;
      completedSalesCount: number;
      completedSalesValue: number;
      attributedCheckoutValue: number;
      attributedCartAdditionsValue: number;
    }>();
    
    // Process interactions data (from first query)
    if (results[0]?.status === "fulfilled" && results[0].value?.result?.items) {
      const interactionsItems = results[0].value.result.items.filter((item: any) => {
        const isWithinDateRange = item.period >= startDate.toISOString();
        const isCorrectType = item.type === 'dialog-management' || item.type === 'chat';
        const isProduction = item.environmentID === VOICEFLOW_CONFIG.production_environment_id; // add
        return isWithinDateRange && isCorrectType && isProduction;
      });
      
      // Aggregate interactions by period
      interactionsItems.forEach((item: any) => {
        const period = item.period;
        if (!timeSeriesMap.has(period)) {
          timeSeriesMap.set(period, {
            date: period,
            interactions: 0,
            addsToCart: 0,
            emailsCaptured: 0,
            klaviyoEvents: 0,
            shopifyCustomers: 0,
            klaviyoCustomers: 0,
            unknownCustomers: 0,
            attributedCheckouts: 0,
              attributedCartAdditions: 0,
              attributedConversionRate: 0,
              completedSalesCount: 0,
            completedSalesValue: 0,
            attributedCartAdditionsValue: 0,
            attributedCheckoutValue: 0
          });
        }
        const entry = timeSeriesMap.get(period)!;
        entry.interactions += item.count || 0;
      });
    }
    
    // Process function usage data (from second query)
    if (results[1]?.status === "fulfilled" && results[1].value?.result?.items) {
      const functionItems = results[1].value.result.items.filter((item: any) => 
        item.period >= startDate.toISOString() &&
        item.environmentID === VOICEFLOW_CONFIG.production_environment_id // add
      );
      
      // Aggregate function data by period and function type
      functionItems.forEach((item: any) => {
        const period = item.period;
        const functionID = item.functionID;
        const count = item.count || 0;
        
        if (!timeSeriesMap.has(period)) {
          timeSeriesMap.set(period, {
            date: period,
            interactions: 0,
            addsToCart: 0,
            emailsCaptured: 0,
            klaviyoEvents: 0,
            shopifyCustomers: 0,
            klaviyoCustomers: 0,
            unknownCustomers: 0,
            attributedCheckouts: 0,
            attributedCartAdditions: 0,
            attributedConversionRate: 0,
            completedSalesCount: 0,
            completedSalesValue: 0,
            attributedCartAdditionsValue: 0,
            attributedCheckoutValue: 0
          });
        }
        
        const entry = timeSeriesMap.get(period)!;
        
        // Map function IDs to metrics
        if (functionIdMappings.addsToCart.includes(functionID)) {
          entry.addsToCart += count;
        } else if (functionIdMappings.emailsCaptured.includes(functionID)) {
          entry.emailsCaptured += count;
        } else if (functionIdMappings.klaviyoEvents.includes(functionID)) {
          entry.klaviyoEvents += count;
        } else if (functionIdMappings.shopifyCustomers.includes(functionID)) {
          entry.shopifyCustomers += count;
        } else if (functionIdMappings.klaviyoCustomers.includes(functionID)) {
          entry.klaviyoCustomers += count;
        } else if (functionIdMappings.unknownCustomers.includes(functionID)) {
          entry.unknownCustomers += count;
        }
      });
    }
    
    // Process attribution data from database
    // Attribution data needs to be aggregated differently since it comes from our database
    // We'll add it directly to the rawTimeSeriesData after converting the map
    
    // Convert map to sorted array
    let rawTimeSeriesData = Array.from(timeSeriesMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Now add attribution data with proper date aggregation
    if (attributions && attributions.length > 0) {
      console.log('Processing', attributions.length, 'attribution records');
      
      // Create a map to count attributions by day/hour
      const attributionMap = new Map<string, { count: number, totalValue: number }>();
      const isHourly = dateRangeParam === 'today' || dateRangeParam === 'yesterday';
      
      attributions.forEach((attr: any) => {
        const attrDate = new Date(attr.createdAt);
        const key = isHourly
          ? `${attrDate.getFullYear()}-${attrDate.getMonth()}-${attrDate.getDate()}-${attrDate.getHours()}`
          : `${attrDate.getFullYear()}-${attrDate.getMonth()}-${attrDate.getDate()}`;
        const existing = attributionMap.get(key) || { count: 0, totalValue: 0 };
        existing.count += 1;
        existing.totalValue += attr.cartValue || 0; // Re-use cartValue for checkout total
        attributionMap.set(key, existing);
      });
      
      console.log('Checkout attribution data by period:', Array.from(attributionMap.entries()));
      
      // Add attribution counts to the raw data
      rawTimeSeriesData = rawTimeSeriesData.map(item => {
        const itemDate = new Date(item.date);
        const key = isHourly
          ? `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}-${itemDate.getHours()}`
          : `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;
        
        return {
          ...item,
          attributedCheckouts: attributionMap.get(key)?.count || 0,
          attributedCheckoutValue: attributionMap.get(key)?.totalValue || 0,
        };
      });
    }
    
    // Process completed sales data from web pixel
    if (completedSales && completedSales.length > 0) {
      console.log('Processing', completedSales.length, 'completed sales records');
      
      const salesMap = new Map<string, { count: number, totalValue: number }>();
      const isHourly = dateRangeParam === 'today' || dateRangeParam === 'yesterday';
      
      completedSales.forEach((sale: any) => {
        const saleDate = new Date(sale.createdAt);
        const key = isHourly
          ? `${saleDate.getFullYear()}-${saleDate.getMonth()}-${saleDate.getDate()}-${saleDate.getHours()}`
          : `${saleDate.getFullYear()}-${saleDate.getMonth()}-${saleDate.getDate()}`;
        const existing = salesMap.get(key) || { count: 0, totalValue: 0 };
        existing.count += 1;
        existing.totalValue += sale.cartValue || 0;
        salesMap.set(key, existing);
      });
      
      rawTimeSeriesData = rawTimeSeriesData.map(item => {
        const itemDate = new Date(item.date);
        const key = isHourly
          ? `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}-${itemDate.getHours()}`
          : `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;
        
        return {
          ...item,
          completedSalesCount: salesMap.get(key)?.count || 0,
          completedSalesValue: salesMap.get(key)?.totalValue || 0,
        };
      });
    }

    // Process cart attribution data similarly to checkout attribution
    if (cartAttributions && cartAttributions.length > 0) {
      console.log('Processing', cartAttributions.length, 'cart attribution records');
      
      // Create a map to count cart attributions by day/hour
      const cartAttributionMap = new Map<string, { count: number, totalValue: number }>();
      const isHourly = dateRangeParam === 'today' || dateRangeParam === 'yesterday';
      
      cartAttributions.forEach((attr: any) => {
        const attrDate = new Date(attr.createdAt);
        const key = isHourly
          ? `${attrDate.getFullYear()}-${attrDate.getMonth()}-${attrDate.getDate()}-${attrDate.getHours()}`
          : `${attrDate.getFullYear()}-${attrDate.getMonth()}-${attrDate.getDate()}`;
        
        const existing = cartAttributionMap.get(key) || { count: 0, totalValue: 0 };
        existing.count += 1;
        existing.totalValue += attr.cartValue || 0;
        cartAttributionMap.set(key, existing);
      });
      
      console.log('Cart attribution data by period:', Array.from(cartAttributionMap.entries()));
      
      // Add cart attribution counts to the raw data
      rawTimeSeriesData = rawTimeSeriesData.map(item => {
        const itemDate = new Date(item.date);
        const key = isHourly
          ? `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}-${itemDate.getHours()}`
          : `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;
        
        return {
          ...item,
          attributedCartAdditions: cartAttributionMap.get(key)?.count || 0,
          attributedCartAdditionsValue: cartAttributionMap.get(key)?.totalValue || 0
        };
      });
    }
    
    console.log('Raw time series data from API:', rawTimeSeriesData.length, 'data points');
    console.log('Sample raw data with attributions:', rawTimeSeriesData.slice(0, 2));
    
    // Now we need to generate the complete time range with proper chart formatting
    const chartData = generateCompleteTimeRangeForCharts(dateRangeParam, rawTimeSeriesData);
    console.log('Generated chart data:', chartData.length, 'data points');
    console.log('Sample chart data:', chartData.slice(0, 2));
    
    return chartData;
    
  } catch (error) {
    console.error('Error processing time series data:', error);
    return null;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const { admin } = await authenticate.admin(request);
    const shopInfoResponse = await admin.graphql( // Fetch currency format to extract the symbol
      `#graphql
      query { shop { currencyFormats { moneyFormat } } }`
    );
    const shopInfo = await shopInfoResponse.json();

    // Helper to extract the currency symbol from a format string like "${{amount}}"
    const getCurrencySymbol = (format: string | undefined): string => {
      if (!format) return '$';
      // This regex finds any character that is not a letter, number, or part of the amount placeholder.
      const symbolMatch = format.match(/[^a-zA-Z0-9\s{}.]/);
      return symbolMatch ? symbolMatch[0] : '$';
    };

    const currencySymbol = getCurrencySymbol(shopInfo.data?.shop?.currencyFormats?.moneyFormat);

    const shopDomain = session.shop;

    // 1. Get Voiceflow credentials from environment
    const voiceflowApiKey = getVoiceflowApiKey();
    const voiceflowProjectId = getVoiceflowProjectId();

    console.log('Voiceflow project ID:', voiceflowProjectId);
    
    if (!validateVoiceflowApiKey(voiceflowApiKey)) {
      return new Response(JSON.stringify({
        analyticsData: null,
        error: "Voiceflow API key not found. Please configure your integration first.",
        dateRange: { from: "", to: "", currencySymbol: "$", label: "" }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (!validateVoiceflowProjectId(voiceflowProjectId)) {
      return new Response(JSON.stringify({
        analyticsData: null,
        error: "Voiceflow project ID not found. Please configure your integration first.",
        dateRange: { from: "", to: "", currencySymbol: "$", label: "" }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Get date range from URL params
    const url = new URL(request.url);
    const dateRangeParam = url.searchParams.get('dateRange') || 'last7days';
    const { start: rangeStart, end } = getDateRange(dateRangeParam);

    // Enforce analytics start date — never show data before go-live
    const analyticsFloor = new Date(ANALYTICS_START_DATE);
    const start = rangeStart < analyticsFloor ? analyticsFloor : rangeStart;


    // Get the label for the date range
    const dateRangeLabels = {
      'today': 'Today',
      'yesterday': 'Yesterday', 
      'last7days': 'Last 7 days',
      'last14days': 'Last 14 days',
      'last30days': 'Last 30 days'
    };
    const dateRangeLabel = dateRangeLabels[dateRangeParam as keyof typeof dateRangeLabels] || 'Last 7 days';

    // 3. Define multiple analytics queries
    const queries = [
      // Total Interactions (main metric) - using your working query
      {
        data: {
          name: "interactions",
          filter: {
            projectID: voiceflowProjectId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            limit: 500
          }
        }
      },
      // Function usage query - we'll make one call and filter results by function name
      {
        data: {
          name: "function_usage",
          filter: {
            projectID: voiceflowProjectId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            limit: 500
          }
        }
      }
    ];

    // 4. Fetch data from Voiceflow for each metric
    console.log(`Making Voiceflow analytics requests for ${shopDomain}`);
    
    const results = await Promise.allSettled(
      queries.map(async (queryBody, index) => {
        console.log(`Query ${index + 1}:`, JSON.stringify(queryBody, null, 2));
        
        const response = await fetch("https://analytics-api.voiceflow.com/v2/query/usage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: voiceflowApiKey,
          },
          body: JSON.stringify(queryBody),
        });

        if (!response.ok) {
          console.error(`Voiceflow API error for query ${index + 1}:`, response.status, response.statusText);
          throw new Error(`Query ${index + 1} failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Response ${index + 1}:`, JSON.stringify(data, null, 2));
        return data;
      })
    );

    // 5. Process the results
    const analyticsData: VoiceflowAnalyticsData = {
      interactions: null,
      sessions: null,
      shopifyCustomers: null,
      klaviyoCustomers: null,
      unknownCustomers: null,
      orderActions: null,
      cancelOrders: null,
      trackOrders: null,
      returnOrders: null,
      addsToCart: null,
      emailsCaptured: null,
      klaviyoEvents: null,
      attributedCheckouts: null,
      attributionRate: null,
      avgDaysToCheckout: null,
      attributedCartAdditions: null,
      attributedConversionRate: null,
      completedSalesValue: null,
      completedSalesCount: null,
      timeSeriesData: null,
      previousPeriodData: null
    };

    // Define function ID mappings - Using function IDs instead of names due to API inconsistency
    const functionIdMappings = {
      // User tracking functions
      shopifyCustomers: ["68bc7f3a34792a261adcd82d"], // Logged in Shopify customers
      klaviyoCustomers: ["68bda67334792a261add14e8"], // Klaviyo tracked customers
      unknownCustomers: ["68bdabfb34792a261add169d"], // Unknown/anonymous customers
      // Order action functions
      cancelOrders: ["68b3153f70a53105f66b8c9d"],
      trackOrders: ["68b3153f70a53105f66b8c9c"], 
      returnOrders: ["68b3153f70a53105f66b8c9e"],
      // Other functions
      addsToCart: ["68b3153f70a53105f66b8c9b"],
      emailsCaptured: ["68b3153f70a53105f66b8c9f"],
      klaviyoEvents: ["67f507b861af1de5274cd007"]
    };

    // Extract data from each query result
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value?.result?.items) {
        let filteredItems;
        
        // Special handling for interactions query (index 0) - use your working logic
        if (index === 0) {
          filteredItems = result.value.result.items.filter((item: any) => {
            const isWithinDateRange = item.period >= start.toISOString();
            const isCorrectType = item.type === 'dialog-management' || item.type === 'chat';
            const isProduction = item.environmentID === VOICEFLOW_CONFIG.production_environment_id; // add this
            return isWithinDateRange && isCorrectType && isProduction;
          });
        } else if (index === 1) {
          // Function usage query - filter by date and then by function IDs for different metrics
          const allFunctionItems = result.value.result.items.filter((item: any) => 
            item.period >= start.toISOString() &&
            item.environmentID === VOICEFLOW_CONFIG.production_environment_id // add this
          );
          
          // Calculate each function-based metric separately using functionID instead of name
          // User tracking breakdown
          const shopifyCustomerItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.shopifyCustomers.includes(item.functionID)
          );
          analyticsData.shopifyCustomers = shopifyCustomerItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          const klaviyoCustomerItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.klaviyoCustomers.includes(item.functionID)
          );
          analyticsData.klaviyoCustomers = klaviyoCustomerItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          const unknownCustomerItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.unknownCustomers.includes(item.functionID)
          );
          analyticsData.unknownCustomers = unknownCustomerItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          // Total sessions (sum of all user types)
          analyticsData.sessions = (analyticsData.shopifyCustomers || 0) + 
                                  (analyticsData.klaviyoCustomers || 0) + 
                                  (analyticsData.unknownCustomers || 0);
          
          // Order Actions breakdown
          const cancelOrderItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.cancelOrders.includes(item.functionID)
          );
          analyticsData.cancelOrders = cancelOrderItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          const trackOrderItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.trackOrders.includes(item.functionID)
          );
          analyticsData.trackOrders = trackOrderItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          const returnOrderItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.returnOrders.includes(item.functionID)
          );
          analyticsData.returnOrders = returnOrderItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          // Total order actions
          analyticsData.orderActions = (analyticsData.cancelOrders || 0) + 
                                      (analyticsData.trackOrders || 0) + 
                                      (analyticsData.returnOrders || 0);
          
          // Adds to Cart
          const addToCartItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.addsToCart.includes(item.functionID)
          );
          analyticsData.addsToCart = addToCartItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          // Emails Captured
          const emailCaptureItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.emailsCaptured.includes(item.functionID)
          );
          analyticsData.emailsCaptured = emailCaptureItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          // Klaviyo Events
          const klaviyoItems = allFunctionItems.filter((item: any) => 
            functionIdMappings.klaviyoEvents.includes(item.functionID)
          );
          analyticsData.klaviyoEvents = klaviyoItems.reduce((sum: number, item: any) => 
            sum + (item.count || 0), 0
          );
          
          // Skip the standard processing for function usage query
          return;
        }
        
        const total = filteredItems.reduce((sum: number, item: any) => 
          sum + (item.count || 0), 0
        );
        
        // Assign to the correct metric based on query index
        switch (index) {
          case 0: analyticsData.interactions = total; break;  // Total interactions
          // case 1 is handled above (function usage query)
        }
      } else {
        console.warn(`Query ${index + 1} failed:`, result.status === "rejected" ? result.reason : "Unknown error");
      }
    });
    
    // 6. Query attribution data from database
    let attributions: any[] = [];
    let cartAttributions: any[] = [];
    let completedSales: any[] = [];
    try {
      console.log(`[Dashboard Attribution] Querying for shop: ${shopDomain}`);
      console.log(`[Dashboard Attribution] Date range: ${start.toISOString()} to ${end.toISOString()}`);
      console.log(`[Dashboard Attribution] Selected range: ${dateRangeParam}`);
      console.log(`[Dashboard Attribution] Database URL: ${process.env.DATABASE_URL}`);
      
      // Get checkout attribution data for the current period
      attributions = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: start,
            lte: end
          },
          eventType: 'checkout_started'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Get cart attribution data for the current period
      cartAttributions = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: start,
            lte: end
          },
          eventType: 'add_to_cart'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Get completed sales data for the current period (from web pixel)
      completedSales = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: start,
            lte: end
          },
          eventType: 'checkout_completed'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`[Dashboard Attribution] Found ${attributions.length} checkout attributions in current period`);
      console.log(`[Dashboard Attribution] Found ${cartAttributions.length} cart attributions in current period`);
      console.log(`[Dashboard Attribution] Found ${completedSales.length} completed sales in current period`);
      
      if (attributions.length > 0) {
        console.log('[Dashboard Attribution] Latest checkout attribution:', {
          id: attributions[0].id,
          createdAt: attributions[0].createdAt,
          attributionType: attributions[0].attributionType,
          userId: attributions[0].userId
        });
      }
      
      if (cartAttributions.length > 0) {
        console.log('[Dashboard Attribution] Latest cart attribution:', {
          id: cartAttributions[0].id,
          createdAt: cartAttributions[0].createdAt,
          attributionType: cartAttributions[0].attributionType,
          userId: cartAttributions[0].userId
        });
      }
      
      // Calculate attribution metrics
      analyticsData.attributedCheckouts = attributions.length;
      analyticsData.attributedCartAdditions = cartAttributions.length;
      analyticsData.completedSalesValue = completedSales.reduce(
        (sum, sale) => sum + (sale.cartValue || 0),
        0
      );
      analyticsData.completedSalesCount = completedSales.length;
      console.log(`[Dashboard Attribution] Set attributedCheckouts to: ${analyticsData.attributedCheckouts}`);
      console.log(`[Dashboard Attribution] Set attributedCartAdditions to: ${analyticsData.attributedCartAdditions}`);

      // Calculate attributed conversion rate
      if (analyticsData.completedSalesCount > 0 && analyticsData.sessions && analyticsData.sessions > 0) {
        analyticsData.attributedConversionRate = (analyticsData.completedSalesCount / analyticsData.sessions) * 100;
      } else {
        analyticsData.attributedConversionRate = 0;
      }
      console.log(`[Dashboard Attribution] Set attributedConversionRate to: ${analyticsData.attributedConversionRate}%`);
      
      // Calculate average days to checkout
      if (attributions.length > 0) {
        const totalDays = attributions.reduce((sum, attr) => 
          sum + (attr.daysSinceInteraction || 0), 0);
        analyticsData.avgDaysToCheckout = totalDays / attributions.length;
        
        // Calculate attribution rate if we have interaction data
        if (analyticsData.interactions && analyticsData.interactions > 0) {
          analyticsData.attributionRate = (attributions.length / analyticsData.interactions) * 100;
        }
        
        console.log(`[Dashboard Attribution] Avg days to checkout: ${analyticsData.avgDaysToCheckout}`);
        console.log(`[Dashboard Attribution] Attribution rate: ${analyticsData.attributionRate}%`);
      }
      
      // Get previous period attribution data for comparison
      const previousPeriodDuration = end.getTime() - start.getTime();
      const previousStart = new Date(Math.max(
        start.getTime() - previousPeriodDuration,
        analyticsFloor.getTime()
      ));
      const previousEnd = new Date(end.getTime() - previousPeriodDuration);

      
      console.log(`[Dashboard Attribution] Previous period: ${previousStart.toISOString()} to ${previousEnd.toISOString()}`);
      
      const previousAttributions = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: previousStart,
            lte: previousEnd
          },
          eventType: 'checkout_started'
        }
      });
      
      const previousCartAttributions = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: previousStart,
            lte: previousEnd
          },
          eventType: 'add_to_cart'
        }
      });

      const previousCompletedSales = await prisma.attributionTracking.findMany({
        where: {
          shopDomain,
          createdAt: {
            gte: previousStart,
            lte: previousEnd
          },
          eventType: 'checkout_completed'
        }
      });
      
      console.log(`[Dashboard Attribution] Found ${previousAttributions.length} checkout attributions in previous period`);
      console.log(`[Dashboard Attribution] Found ${previousCartAttributions.length} cart attributions in previous period`);
      console.log(`[Dashboard Attribution] Found ${previousCompletedSales.length} completed sales in previous period`);
      
      if (!analyticsData.previousPeriodData) {
        analyticsData.previousPeriodData = {
          interactions: null,
          addsToCart: null,
          emailsCaptured: null,
          attributedCartAdditions: null,
          attributedConversionRate: null,
          completedSalesValue: null,
          completedSalesCount: null,
          sessions: null,
          attributedCheckouts: null,
        };
      }
      analyticsData.previousPeriodData.attributedCheckouts = previousAttributions.length;
      analyticsData.previousPeriodData.attributedCartAdditions = previousCartAttributions.length;
      analyticsData.previousPeriodData.completedSalesValue = previousCompletedSales.reduce(
        (sum, sale) => sum + (sale.cartValue || 0),
        0
      );
      analyticsData.previousPeriodData.completedSalesCount = previousCompletedSales.length;

      // Calculate previous period conversion rate
      if (analyticsData.previousPeriodData.completedSalesCount > 0 && analyticsData.previousPeriodData.sessions && analyticsData.previousPeriodData.sessions > 0) {
        analyticsData.previousPeriodData.attributedConversionRate = (analyticsData.previousPeriodData.completedSalesCount / analyticsData.previousPeriodData.sessions) * 100;
      } else {
        analyticsData.previousPeriodData.attributedConversionRate = 0;
      }
      
    } catch (error) {
      console.error('[Dashboard Attribution] Failed to query attribution data:', error);
      // Continue without attribution data rather than failing the entire dashboard
    }
    
    // 7. Process time series data for charts
    // processTimeSeriesData returns chart-ready data, so we assign it directly
    const chartReadyTimeSeriesData = processTimeSeriesData(results, functionIdMappings, start, dateRangeParam, completedSales, attributions, cartAttributions);
    console.log('Chart-ready time series data:', chartReadyTimeSeriesData ? chartReadyTimeSeriesData.length : 0, 'data points');
    analyticsData.timeSeriesData = chartReadyTimeSeriesData;

    return new Response(JSON.stringify({
      analyticsData,
      error: null,
      dateRange: {
        from: start.toISOString(),
        to: end.toISOString(),
        currencySymbol: currencySymbol,
        label: dateRangeLabel
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Unexpected error in dashboard loader:", error);
    return new Response(JSON.stringify({
      analyticsData: null,
      error: "An unexpected error occurred while fetching analytics data.",
      dateRange: { from: "", to: "", currencySymbol: "$", label: "" }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};


// Helper function to calculate percentage change with consistent mock data
function calculatePreviousPeriodData(analyticsData: VoiceflowAnalyticsData | null, dateRange: string) {
  // For now, we'll simulate previous period data with consistent values based on current data
  // In the real implementation, you'd fetch data for the previous period
  if (!analyticsData) return null;
  
  // Create consistent "previous" values that don't change randomly
  // Use a deterministic approach based on the current values
  const createPreviousValue = (current: number | null): number | null => {
    if (current === null || current === 0) return current;
    
    // Create a consistent variation based on the current value
    // This ensures the percentage doesn't change randomly on refresh
    const seed = current % 10; // Use current value as seed for consistency
    const variationFactor = 0.7 + (seed / 10) * 0.6; // Between 0.7 and 1.3
    return Math.floor(current * variationFactor);
  };
  
  return {
    interactions: createPreviousValue(analyticsData.interactions),
    addsToCart: createPreviousValue(analyticsData.addsToCart),
    emailsCaptured: createPreviousValue(analyticsData.emailsCaptured),
    sessions: createPreviousValue(analyticsData.sessions),
    attributedCheckouts: analyticsData.previousPeriodData?.attributedCheckouts || createPreviousValue(analyticsData.attributedCheckouts),
    attributedCartAdditions: analyticsData.previousPeriodData?.attributedCartAdditions || createPreviousValue(analyticsData.attributedCartAdditions),
    completedSalesCount: analyticsData.previousPeriodData?.completedSalesCount || createPreviousValue(analyticsData.completedSalesCount),
    completedSalesValue: analyticsData.previousPeriodData?.completedSalesValue || createPreviousValue(analyticsData.completedSalesValue),
    attributedConversionRate: analyticsData.previousPeriodData?.attributedConversionRate || createPreviousValue(analyticsData.attributedConversionRate)
  };
}

export default function DashboardPage() {
  const { analyticsData, error, dateRange } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Date range state
  const [selectedDateRange, setSelectedDateRange] = useState(
    searchParams.get('dateRange') || 'last7days'
  );

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if tab is active and not already refreshing
      if (!document.hidden && revalidator.state === 'idle') {
        revalidator.revalidate();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [revalidator]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  // Date range change handler
  const handleDateRangeChange = useCallback(
    (value: string) => {
      setSelectedDateRange(value);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('dateRange', value);
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  // Date range options
  const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 14 days', value: 'last14days' },
    { label: 'Last 30 days', value: 'last30days' },
  ];

  // Format dates for display
  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const dateRangeText = dateRange.from && dateRange.to 
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : undefined;

  const isLoading = !error && !analyticsData;
  const isRefreshing = revalidator.state === 'loading';

  // Generate dynamic chart data based on selected date range
  const chartData = processApiTimeSeriesData(analyticsData, selectedDateRange) || [];
  
  // Calculate previous period data for percentage changes
  const previousPeriodData = calculatePreviousPeriodData(analyticsData, selectedDateRange);
  
  // Update analytics data with previous period for percentage calculation
  // Helper to format currency values
  const formatCurrency = (value: number | null) => {
    if (value === null) return null;
    return `${dateRange.currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to format percentage values
  const formatPercentage = (value: number | null) => {
    if (value === null) return null;
    return `${value.toFixed(2)}%`;
  };
  const analyticsWithPrevious = analyticsData ? {
    ...analyticsData,
    previousPeriodData
  } : null;

  // Mock pie chart data for order actions
  const orderActionsData = [
    { name: 'Track Orders', value: analyticsData?.trackOrders || 0, fill: '#8884d8' },
    { name: 'Cancel Orders', value: analyticsData?.cancelOrders || 0, fill: '#82ca9d' },
    { name: 'Return Orders', value: analyticsData?.returnOrders || 0, fill: '#ffc658' }
  ].filter(item => item.value > 0);

  return (
    <Page
      fullWidth
      title="Chatbot Analytics"
      secondaryActions={
        <InlineStack gap="300" align="end">
          <Button
            icon={RefreshIcon}
            accessibilityLabel="Refresh data"
            loading={isRefreshing}
            onClick={handleRefresh}
          />
          <div style={{ minWidth: '150px' }}>
            <Select
              label="Date range"
              options={dateRangeOptions}
              onChange={handleDateRangeChange}
              value={selectedDateRange}
              labelHidden
            />
          </div>
        </InlineStack>
      }
    >
      <BlockStack gap="400">
        {error && <Banner tone="critical"><Text as="p">{error}</Text></Banner>}

        {/* Top Row - KPI Cards in 4-column Grid */}
        <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <KPICard 
              title="Total Interactions" 
              value={analyticsWithPrevious?.interactions} 
              previousValue={analyticsWithPrevious?.previousPeriodData?.interactions}
              isLoading={isLoading}
              tooltipContent="Total number of chatbot messages sent. Each person who interacts with the bot can have multiple messages, so if 1 person asks 5 questions, that counts as 5 interactions."
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <KPICard 
              title=" Conversion Rate" 
              value={formatPercentage(analyticsWithPrevious?.attributedConversionRate)} 
              previousValue={formatPercentage(analyticsWithPrevious?.previousPeriodData?.attributedConversionRate)}
              isLoading={isLoading}
              tooltipContent="The percentage of users who interacted with GRAW and then made a purchase."
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <KPICard 
              title="Sales Amount" 
              value={formatCurrency(analyticsWithPrevious?.completedSalesValue)} 
              previousValue={formatCurrency(analyticsWithPrevious?.previousPeriodData?.completedSalesValue)}
              isLoading={isLoading}
              tooltipContent="Total value of sales from checkouts completed after a conversation with GRAW."
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <KPICard 
              title="Emails Captured" 
              value={analyticsWithPrevious?.emailsCaptured} 
              previousValue={analyticsWithPrevious?.previousPeriodData?.emailsCaptured}
              isLoading={isLoading}
              tooltipContent="Email addresses collected by the chatbot for lead generation and marketing campaigns."
            />
          </Grid.Cell>
        </Grid>

        {/* Full Width - Total Interactions Area Chart */}
        <ChartCard 
          title="Total Interactions Over Time" 
          height={300}
          tooltipContent="Shows the trend of chatbot interactions over the selected time period, helping identify peak usage times and patterns."
        >
          {!isLoading ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip content={(props) => (
                  <CustomTooltip {...props} displayName="Total Interactions" />
                )} />
                <Area 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <SkeletonDisplayText size="large" />
            </div>
          )}
        </ChartCard>

        {/* Two Column Grid - Additional Charts */}
        <Grid>
          {/* Attributed Cart Additions Biaxial Line Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Cart Additions Following a Conversation"
              tooltipContent="Total number of people who added to cart after a conversation with GRAW."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${dateRange.currencySymbol}${value}`} />
                    <RechartsTooltip content={(props) => (
                      <MultiMetricTooltip {...props} />
                    )} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="attributedCartAdditions" 
                      name="Cart Additions Count"
                      stroke="#28a745" 
                      strokeWidth={2}
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="attributedCartAdditionsValue" 
                      name="Cart Value"
                      stroke="#17a2b8"
                      strokeWidth={2}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Sales Following a Conversation Biaxial Line Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Sales Following a Conversation"
              tooltipContent="Total number and value of sales from checkouts completed after a conversation with GRAW."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${dateRange.currencySymbol}${value}`} />
                    <RechartsTooltip content={(props) => (
                      <MultiMetricTooltip {...props} />
                    )} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="completedSalesCount" 
                      name="Sales Count"
                      stroke="#ff7300" 
                      strokeWidth={2}
                      activeDot={{ r: 6 }} 
                    />
                    <Line yAxisId="right" type="monotone" dataKey="completedSalesValue" name="Sales Value" stroke="#007bff" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><SkeletonDisplayText size="large" /></div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Unique Users Stacked Bar Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Unique Users Breakdown"
              tooltipContent="The number of unique users by type: Shopify customers (logged in), Klaviyo tracked users, and unknown/anonymous visitors."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={(props) => (
                      <MultiMetricTooltip {...props} />
                    )} />
                    <Legend />
                    <Bar dataKey="shopifyCustomers" stackId="a" fill="#8884d8" name="Shopify Customers" />
                    <Bar dataKey="klaviyoCustomers" stackId="a" fill="#82ca9d" name="Klaviyo Customers" />
                    <Bar dataKey="unknownCustomers" stackId="a" fill="#ffc658" name="Unknown Customers" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Cart Additions Line Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Added To Cart Within GRAW"
              tooltipContent="Number of times a user clicked the 'Add To Cart' button (or confirmed GRAW to add to cart inside of a GRAW chat window), and not manually doing it themselves."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={(props) => (
                      <CustomTooltip {...props} displayName="Adds to Cart" />
                    )} />
                    <Line 
                      type="monotone" 
                      dataKey="addsToCart" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Order Actions Pie Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Order Actions Breakdown"
              tooltipContent="Distribution of order-related actions performed through the chatbot, including tracking their order, cancelling their order and returning their order."
            >
              {!isLoading && orderActionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderActionsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : !isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Text tone="subdued">No order actions data</Text>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Emails Captured Bar Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Emails Captured"
              tooltipContent="Number of email addresses collected by the chatbot."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={(props) => (
                      <CustomTooltip {...props} displayName="Emails Captured" />
                    )} />
                    <Bar dataKey="emailsCaptured" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Klaviyo Events Stacked Area Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Klaviyo Events"
              tooltipContent="Number of events tracked to an individual profile inside of Klaviyo. Events include 'Abandoned cart recovered through bot', 'Feedback given in bot (inc. sentiment analysis)', 'Discount code claimed through bot' and more."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={(props) => (
                      <CustomTooltip {...props} displayName="Klaviyo Events" />
                    )} />
                    <Area 
                      type="monotone" 
                      dataKey="klaviyoEvents" 
                      stackId="1" 
                      stroke="#ffc658" 
                      fill="#ffc658" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>

          {/* Attributed Checkouts Line Chart */}
          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <ChartCard 
              title="Number of Checkouts After A Conversation With GRAW"
              tooltipContent="Total number of people who started checkouts after a conversation with GRAW."
            >
              {!isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={(props) => (
                      <CustomTooltip {...props} displayName="Attributed Checkouts" />
                    )} />
                    <Line 
                      type="monotone" 
                      dataKey="attributedCheckouts" 
                      stroke="#ff7300" 
                      strokeWidth={3}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <SkeletonDisplayText size="large" />
                </div>
              )}
            </ChartCard>
          </Grid.Cell>
        </Grid>

      </BlockStack>
    </Page>
  );
}
