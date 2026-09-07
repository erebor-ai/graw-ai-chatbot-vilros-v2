import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { Page } from "@shopify/polaris";
import { ClipboardIcon, RefreshIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getVoiceflowApiKey, getVoiceflowProjectId, validateVoiceflowApiKey, validateVoiceflowProjectId } from "../voiceflow.server";
import { ENABLE_EVALUATIONS, EVALUATION_IDS, VOICEFLOW_CONFIG } from "../config.server";

const SENTIMENT_LABELS: Record<string, { label: string; tone: string }> = {
  '5': { label: 'Very Positive', tone: 'success' },
  '4': { label: 'Positive', tone: 'success' },
  '3': { label: 'Neutral', tone: 'info' },
  '2': { label: 'Negative', tone: 'warning' },
  '1': { label: 'Very Negative', tone: 'critical' },
};
// ============================================================================

// --- Types ---
interface TranscriptEvaluation {
  id: string;
  name: string;
  description: string | null;
  default: boolean;
  value: string | number | boolean;
  reason: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  maximumValue?: number;
  minimumValue?: number;
}

interface TranscriptProperty {
  id: string;
  type: string;
  name: string;
  description: string | null;
  default: boolean;
  value: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface TranscriptSummary {
  id: string;
  sessionID: string;
  createdAt: string;
  endedAt: string | null;
  duration?: number;
  properties?: TranscriptProperty[];
  evaluations?: TranscriptEvaluation[];
}

interface TranscriptLog {
  type: 'trace' | 'action';
  role: 'user' | 'agent';
  message: string;
  createdAt: string;
}

interface LoaderData {
  transcripts?: TranscriptSummary[];
  selectedTranscript?: {
    summary: TranscriptSummary;
    logs: TranscriptLog[];
  };
  error?: string;
  projectId?: string;
}

// --- Helper to calculate Production Environment ID ---
function getProductionEnvironmentId(projectId: string) {
  if (!projectId || projectId.length < 2) return projectId;
  try {
    const prefix = projectId.slice(0, -2);
    const suffix = projectId.slice(-2);
    const val = parseInt(suffix, 16);
    const newVal = val + 2;
    return prefix + newVal.toString(16).padStart(2, '0');
  } catch (e) { return projectId; }
}

// --- Helper: Queue Evaluations in Background ---
function queueEvaluationsForTranscripts(
  transcripts: any[], 
  apiKey: string, 
  projectID: string
) {
  if (!ENABLE_EVALUATIONS) return;

  // Filter transcripts that need evaluation
  const needsEvaluation = transcripts.filter((t: any) => {
    // Must be ended
    if (!t.endedAt) return false;
    
    // Must not have evaluations already
    if (t.evaluations && t.evaluations.length > 0) return false;
    
    // Must meet minimum criteria: duration > 30s
    const durationProp = t.properties?.find((p: any) => p.name === 'duration');
    const duration = durationProp ? parseInt(durationProp.value, 10) : 0;
    if (duration < 30) return false;
    
    // Optional: Check message count if you track it as a property
    // const messageCount = t.properties?.find(p => p.name === 'message_count')?.value;
    // if (!messageCount || parseInt(messageCount) < 3) return false;
    
    return true;
  });

  if (needsEvaluation.length === 0) {
    console.log('No transcripts need evaluation');
    return;
  }

  console.log(`Queueing evaluations for ${needsEvaluation.length} transcripts`);

  // Run evaluations in background (fire and forget)
  Promise.all(
    needsEvaluation.map(async (transcript: any) => {
      try {
        // Run all configured evaluations for this transcript
        await Promise.all(
          Object.entries(EVALUATION_IDS).map(async ([name, evalID]) => {
            const response = await fetch(
              `https://analytics-api.voiceflow.com/v1/transcript-evaluation/${evalID}/transcript/${transcript.id}`,
              {
                method: 'POST',
                headers: {
                  'authorization': apiKey,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({ projectID })
              }
            );

            if (!response.ok) {
              console.error(`Failed to run ${name} evaluation for ${transcript.id}:`, response.status);
              return;
            }

            const result = await response.json();
            console.log(`✓ ${name} evaluation completed for ${transcript.id}:`, result.result.value);
          })
        );
      } catch (error) {
        console.error(`Error running evaluations for transcript ${transcript.id}:`, error);
      }
    })
  ).catch(err => console.error('Background evaluation error:', err));
}

// --- Loader for Server-Side Data Fetching ----
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const transcriptId = url.searchParams.get("transcriptId");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  
  const take = 10; 
  const skip = (page - 1) * 10;

  const voiceflowApiKey = getVoiceflowApiKey();
  const voiceflowProjectId = getVoiceflowProjectId();

  if (!validateVoiceflowApiKey(voiceflowApiKey) || !validateVoiceflowProjectId(voiceflowProjectId)) {
    return { error: "Voiceflow API Key or Project ID is not configured." };
  }

  const productionEnvId = getProductionEnvironmentId(voiceflowProjectId);

  try {
    // If a specific transcriptId is requested, fetch only that
    if (transcriptId) {
      const response = await fetch(
        `https://analytics-api.voiceflow.com/v1/transcript/${transcriptId}?filterConversation=true`, 
        {
          method: 'GET',
          headers: { 'authorization': voiceflowApiKey, 'content-type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error(`Failed to fetch transcript ${transcriptId}`);
      const data = await response.json();
      
      const logs = parseTranscriptLogs(data.transcript?.logs || []);
      return { selectedTranscript: { summary: data.transcript, logs } };
    }

    // Fetch the list of transcripts (no filters in API call)
    console.log(`[LOADER] Fetching transcripts: take=${take}, skip=${skip}`);
    const response = await fetch(
      `https://analytics-api.voiceflow.com/v1/transcript/project/${voiceflowProjectId}?take=${take}&skip=${skip}&order=DESC`,
      {
        method: 'POST',
        headers: { 'authorization': voiceflowApiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          environmentID: productionEnvId,
          filters: [
            { id: VOICEFLOW_CONFIG.real_convo_prop_id, op: 'eq', value: 'true' }
          ]        
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[LOADER ERROR] Voiceflow API Error:", errorBody);
      throw new Error(`Failed to fetch transcript list: ${response.statusText}`);
    }

    const data = await response.json();
    const rawTranscripts = data.transcripts || [];
    
    // Map to summary type - no more filtering needed as API handled it
    const transcripts: TranscriptSummary[] = rawTranscripts
      .map((t: any) => {
        const durationProp = t.properties?.find((p: any) => p.name === 'duration');
        return {
          ...t,
          duration: durationProp ? parseInt(durationProp.value, 10) : undefined
        };
      });

    console.log(`[LOADER] Final transcripts to display: ${transcripts.length}`);

    // Queue evaluations for transcripts that need them (non-blocking)
    queueEvaluationsForTranscripts(rawTranscripts, voiceflowApiKey, voiceflowProjectId);

    // If there are transcripts, fetch the first one to display initially
    if (transcripts.length > 0) {
      console.log(`[LOADER] Fetching first transcript details: ${transcripts[0].id}`);
      const firstTranscriptId = transcripts[0].id;
      const detailResponse = await fetch(
        `https://analytics-api.voiceflow.com/v1/transcript/${firstTranscriptId}?filterConversation=true`,
        {
          method: 'GET',
          headers: { 'authorization': voiceflowApiKey, 'content-type': 'application/json' },
        }
      );
      if (!detailResponse.ok) throw new Error(`Failed to fetch initial transcript ${firstTranscriptId}`);
      const detailData = await detailResponse.json();
      const logs = parseTranscriptLogs(detailData.transcript?.logs || []);
      console.log(`[LOADER] Successfully loaded first transcript with ${logs.length} messages`);
      return { 
        transcripts, 
        selectedTranscript: { summary: transcripts[0], logs }, 
        projectId: voiceflowProjectId,
        enableEvaluations: ENABLE_EVALUATIONS,
        sentimentEvalId: EVALUATION_IDS.sentiment
      };
    }

    return { 
      transcripts: [], 
      projectId: voiceflowProjectId,
      enableEvaluations: ENABLE_EVALUATIONS,
      sentimentEvalId: EVALUATION_IDS.sentiment
    };

  } catch (error: any) {
    console.error("[LOADER ERROR] Error in conversations loader:", error);
    return { error: error.message };
  }
};

// --- Helper to Parse Transcript Logs ---
function parseTranscriptLogs(logs: any[]): TranscriptLog[] {
  return logs
    .map(log => {
      if (log.type === 'trace' && log.data?.type === 'text' && log.data?.payload?.message) {
        return { type: 'trace', role: 'agent', message: log.data.payload.message, createdAt: log.createdAt };
      }
      if (log.type === 'action' && log.data?.type === 'text' && log.data?.payload) {
        return { type: 'action', role: 'user', message: log.data.payload, createdAt: log.createdAt };
      }
      if (log.type === 'action' && log.data?.payload?.label) {
        return { type: 'action', role: 'user', message: `Clicked: "${log.data.payload.label}"`, createdAt: log.createdAt };
      }
      return null;
    })
    .filter((log): log is TranscriptLog => log !== null);
}

// --- Helper to Format Duration ---
function formatDuration(seconds?: number) {
  if (seconds === undefined) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

// --- Helper to Format Tooltip Date ---
function formatTooltipDate(isoString: string) {
  const date = new Date(isoString);
  const day = date.getDate();
  const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3) ? 0 : (day % 100 - day % 10 != 10) * day % 10];
  
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  
  return `${month} ${day}${suffix}, ${time}`;
}

// --- Helper to Render Markdown ---
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

// In getSentimentBadgeInfo function
function getSentimentBadgeInfo(evaluations: TranscriptEvaluation[] | undefined, enableEvaluations: boolean, sentimentEvalId: string) {
  if (!evaluations || evaluations.length === 0) {
    if (!enableEvaluations) {
      return { label: 'N/A', tone: 'subdued', reason: 'Evaluation not available.' };
    }
    return { label: 'Pending', tone: 'subdued', reason: 'Evaluation in progress...' };
  }

  const sentimentEval = evaluations.find(e => e.id === sentimentEvalId);
  
  if (!sentimentEval) {
    if (!enableEvaluations) {
      return { label: 'N/A', tone: 'subdued', reason: 'Evaluation not available.' };
    }
    return { label: 'Pending', tone: 'subdued', reason: 'Evaluation in progress...' };
  }

  const value = String(sentimentEval.value);
  const config = SENTIMENT_LABELS[value] || { label: 'Unknown', tone: 'subdued' };
  
  return {
    label: config.label,
    tone: config.tone,
    reason: sentimentEval.reason
  };
}

export default function ConversationsPage() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedTranscriptId, setSelectedTranscriptId] = useState(
    initialData.selectedTranscript?.summary.id || null
  );
  

  const transcripts = initialData.transcripts || [];
  const selectedTranscriptData = fetcher.data?.selectedTranscript || initialData.selectedTranscript;
  const error = initialData.error || fetcher.data?.error;
  const enableEvaluations = initialData.enableEvaluations ?? true;
  const sentimentEvalId = initialData.sentimentEvalId ?? '';
  const page = parseInt(searchParams.get("page") || "1", 10);

  const handleRowClick = (transcriptId: string) => {
    if (transcriptId === selectedTranscriptId) return;
    setSelectedTranscriptId(transcriptId);
    fetcher.load(`/app/conversations?transcriptId=${transcriptId}`);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const handleLatest = useCallback(() => {
    setSearchParams({});
    setSelectedTranscriptId(null); 
    fetcher.load('/app/conversations');
  }, [setSearchParams, fetcher]);

  const handleCopyTranscript = useCallback(() => {
    if (!selectedTranscriptData?.logs) return;
    const text = selectedTranscriptData.logs
      .map(l => `${l.role.toUpperCase()}: ${l.message}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    shopify.toast.show("Transcript copied to clipboard");
  }, [selectedTranscriptData]);

  useEffect(() => {
    const handleNavigate = (event: any) => {
      const href = event.target.getAttribute('href');
      if (href) {
        const url = new URL(href, window.location.origin);
        const page = url.searchParams.get('page');
        if (page) handlePageChange(parseInt(page, 10));
      }
    };

    document.addEventListener('shopify:navigate', handleNavigate);
    return () => document.removeEventListener('shopify:navigate', handleNavigate);
  }, []);

  return (
    <Page
      title="Conversations"
      fullWidth
      primaryAction={{
        content: 'Latest',
        onAction: handleLatest,
        icon: RefreshIcon
      }}
      secondaryActions={[
        {
          content: 'Copy Transcript',
          icon: ClipboardIcon,
          onAction: handleCopyTranscript,
          accessibilityLabel: 'Copy transcript to clipboard'
        }
      ]}
      pagination={{
        hasPrevious: page > 1,
        hasNext: transcripts.length === 10,
        onPrevious: () => handlePageChange(page - 1),
        onNext: () => handlePageChange(page + 1),
      }}
    >
      {error && <s-banner tone="critical" heading="Error">{error}</s-banner>}

      <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
        {/* Left Column: Metadata List */}
        <s-grid-item gridColumn="span 3">
          <s-section heading="History">
            <div style={{ height: 'calc(70vh + 3rem)', overflowY: 'auto' }}>
              <s-stack gap="small">
                {transcripts.map((transcript) => {
                  const sentimentInfo = getSentimentBadgeInfo(transcript.evaluations, enableEvaluations, sentimentEvalId);
                  const sentimentTooltipId = `sentiment-${transcript.id}`;
                  const isOngoing = !transcript.endedAt;
                  
                  return (
                    <div 
                      key={transcript.id}
                      onClick={() => handleRowClick(transcript.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Tooltip */}
                      <>
                        <s-tooltip id={sentimentTooltipId}>
                          <s-text><strong>AI Analysis:</strong> {sentimentInfo.reason}</s-text>
                        </s-tooltip>
                        
                        <s-box
                          padding="base"
                          background={transcript.id === selectedTranscriptId ? 'subdued' : 'base'}
                          borderWidth="base"
                          borderColor="base"
                          borderRadius="base"
                        >
                          <s-stack gap="none">
                            <s-text type="strong">{transcript.sessionID}</s-text>
                            <s-text color="subdued">
                              {new Date(transcript.createdAt).toLocaleString()}
                            </s-text>
                            
                            {/* Duration */}
                            {isOngoing ? (
                              <s-text color="subdued">
                                Duration: <span style={{ color: '#bf0711' }}>Conversation Ongoing...</span>
                              </s-text>
                            ) : transcript.duration !== undefined ? (
                              <s-text color="subdued">
                                Duration: {formatDuration(transcript.duration)}
                              </s-text>
                            ) : null}
                            
                            {/* Sentiment Badge - Debug version */}
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <s-text color="subdued">Sentiment:</s-text>
                              <s-text interestFor={sentimentTooltipId}>
                                <s-badge tone={sentimentInfo.tone as any}>
                                  {sentimentInfo.label}
                                </s-badge>
                              </s-text>
                            </div>

                            {/* Human Handover Badge (conditional) */}
                            {transcript.properties?.find(p => p.name === 'human_handover_requested' && p.value === 'true') && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <s-badge tone="caution">
                                  Human Handover Requested
                                </s-badge>
                              </div>
                            )}

                            {/* Off Topic Detected Badge (conditional) */}
                            {transcript.properties?.find(p => p.name === 'off_topic_detected' && p.value === 'true') && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <s-badge tone="caution">
                                  Off Topic Detected
                                </s-badge>
                              </div>
                            )}                            

                            {/* Products Discussed Badge (conditional) */}
                            {(() => {
                              const productsDiscussedProp = transcript.properties?.find(
                                p => p.name === 'products_discussed' && p.value === 'true'
                              );
                              const productCount = productsDiscussedProp?.metadata?.products?.length || 0;
                              
                              if (productCount > 0) {
                                return (
                                  <div style={{ marginTop: '0.5rem' }}>
                                    <s-badge tone="info">
                                      {productCount} Product{productCount !== 1 ? 's' : ''} Discussed
                                    </s-badge>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </s-stack>
                        </s-box>
                      </>
                    </div>
                  );
                })}
                {transcripts.length === 0 && !error && <s-text>No transcripts found.</s-text>}
              </s-stack>
            </div>
          </s-section>
        </s-grid-item>

        {/* Right Column: Transcript */}
        <s-grid-item gridColumn="span 9">
        <s-section heading="Transcript">
          {/* Add button next to heading */}
          {selectedTranscriptData && (
            <div style={{ marginBottom: '1rem' }}>
              <s-button 
                commandFor="insights-modal" 
                command="--show"
                variant="secondary"
                size="slim"
              >
                View Insights
                {/* Add count badge */}
                {(() => {
                  const insightCount = [
                    selectedTranscriptData.summary.evaluations?.length || 0,
                    selectedTranscriptData.summary.properties?.filter(p => 
                      !p.default && p.type === 'boolean' && p.value === 'true' && p.name !== 'real_conversation_started'
                    ).length || 0
                  ].reduce((a, b) => a + b, 0);                  
                  return insightCount > 0 ? (
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      background: '#2c6ecb', 
                      color: 'white', 
                      borderRadius: '10px', 
                      padding: '2px 8px', 
                      fontSize: '12px' 
                    }}>
                      {insightCount}
                    </span>
                  ) : null;
                })()}
              </s-button>
            </div>
          )}

            {/* Transcript display */}
            <div style={{
              height: '70vh',
              overflowY: 'auto',
              padding: '1rem',
              border: '1px solid var(--p-color-border)',
              borderRadius: 'var(--p-border-radius-base)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {fetcher.state === 'loading' && <s-spinner accessibility-label="Loading transcript"></s-spinner>}
              
              {selectedTranscriptData && fetcher.state === 'idle' && (
                selectedTranscriptData.logs.map((log, index) => {
                  const tooltipId = `transcript-tooltip-${index}`;
                  const isAgent = log.role === 'agent';
                  return (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: isAgent ? 'flex-start' : 'flex-end'
                    }}>
                      <s-tooltip id={tooltipId}>
                        <s-text>{formatTooltipDate(log.createdAt)}</s-text>
                      </s-tooltip>
                      
                      <div style={{
                        maxWidth: '75%',
                        padding: '0.5rem 1rem',
                        borderRadius: '1.25rem',
                        backgroundColor: isAgent ? 'var(--p-color-bg-surface-secondary)' : '#2c6ecb',
                        color: isAgent ? 'var(--p-color-text)' : '#ffffff',
                        borderTopLeftRadius: isAgent ? '0.25rem' : '1.25rem',
                        borderTopRightRadius: !isAgent ? '0.25rem' : '1.25rem',
                      }}>
                        <s-text interestFor={tooltipId} as="p" style={{ whiteSpace: 'pre-wrap', color: isAgent ? 'inherit' : '#ffffff' }}>
                          <span style={{ color: isAgent ? 'inherit' : '#ffffff' }}>
                            {renderMarkdown(log.message)}
                          </span>
                        </s-text>
                      </div>
                    </div>
                  );
                })
              )}
              {!selectedTranscriptData && fetcher.state === 'idle' && <s-text>Select a conversation to view the transcript.</s-text>}
            </div>
          </s-section>
        </s-grid-item>
      </s-grid>

      {/* Insights Modal */}
      {selectedTranscriptData && (
        <s-modal id="insights-modal" heading="Conversation Insights" size="large">
          <s-stack gap="base">
            
            {/* Sentiment Section */}
            {(() => {
              const sentimentInfo = getSentimentBadgeInfo(selectedTranscriptData.summary.evaluations, enableEvaluations, sentimentEvalId);
              if (sentimentInfo.label !== 'Pending') {
                return (
                  <>
                    <div>
                      <s-text type="strong">Customer Sentiment</s-text>
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <s-badge tone={sentimentInfo.tone as any}>
                          {sentimentInfo.label}
                        </s-badge>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <s-text color="subdued">
                          <strong>AI Analysis:</strong> {sentimentInfo.reason}
                        </s-text>
                      </div>
                    </div>
                    <s-divider />
                  </>
                );
              }
              return null;
            })()}
            
            {/* Conversation Events Section */}
            <div>
              <s-text type="strong">Conversation Events</s-text>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedTranscriptData.summary.properties
                  ?.filter(p => 
                    !p.default && 
                    p.type === 'boolean' && 
                    p.value === 'true' && 
                    p.name !== 'real_conversation_started'  // Hide internal tag
                  )
                  .map(prop => {
                    // Customize badge tone based on property name
                    let tone: string = 'info';
                    if (prop.name === 'human_handover_requested') tone = 'warning';
                    if (prop.name === 'off_topic_detected') tone = 'caution';
                    if (prop.name === 'email_captured') tone = 'success';
                    
                    return (
                      <s-badge key={prop.id} tone={tone as any}>
                        {prop.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </s-badge>
                    );
                  })}
                
                {(!selectedTranscriptData.summary.properties?.some(p => 
                  !p.default && p.type === 'boolean' && p.value === 'true'
                )) && (
                  <s-text color="subdued">No special events recorded</s-text>
                )}
              </div>
            </div>

            {/* Products Discussed Section */}
            {(() => {
              const productsDiscussedProp = selectedTranscriptData.summary.properties?.find(
                p => p.name === 'products_discussed' && p.value === 'true'
              );
              
              const products = productsDiscussedProp?.metadata?.products;
              
              if (products && Array.isArray(products) && products.length > 0) {
                return (
                  <>
                    <s-divider />
                    <div>
                      <s-text type="strong">Products Discussed ({products.length})</s-text>
                      <div style={{ marginTop: '0.5rem' }}>
                        <s-stack gap="small">
                          {products.map((product: any, index: number) => (
                            <div 
                              key={product.product_id || index}
                              style={{
                                padding: '0.75rem',
                                border: '1px solid var(--p-color-border)',
                                borderRadius: 'var(--p-border-radius-base)',
                                background: 'var(--p-color-bg-surface-secondary)'
                              }}
                            >
                              <s-stack gap="extraTight">
                                <s-text type="strong">{product.product_name || 'Unknown Product'}</s-text>
                                {product.product_price && (
                                  <s-text color="subdued">Price: {product.product_price}</s-text>
                                )}
                                {product.product_id && (
                                  <s-text color="subdued" style={{ fontSize: '11px' }}>
                                    ID: {product.product_id}
                                  </s-text>
                                )}
                              </s-stack>
                            </div>
                          ))}
                        </s-stack>
                      </div>
                    </div>
                  </>
                );
              }
              return null;
            })()}
            
            {/* Conversation Metadata Section */}
            <s-divider />
            <div>
              <s-text type="strong">Conversation Details</s-text>
              <div style={{ marginTop: '0.5rem' }}>
                <s-stack gap="small">
                  <s-text color="subdued">
                    Session ID: <s-text type="strong">{selectedTranscriptData.summary.sessionID}</s-text>
                  </s-text>
                  <s-text color="subdued">
                    Started: <s-text type="strong">{new Date(selectedTranscriptData.summary.createdAt).toLocaleString()}</s-text>
                  </s-text>
                  {selectedTranscriptData.summary.endedAt && (
                    <s-text color="subdued">
                      Ended: <s-text type="strong">{new Date(selectedTranscriptData.summary.endedAt).toLocaleString()}</s-text>
                    </s-text>
                  )}
                  {selectedTranscriptData.summary.duration !== undefined && (
                    <s-text color="subdued">
                      Duration: <s-text type="strong">{formatDuration(selectedTranscriptData.summary.duration)}</s-text>
                    </s-text>
                  )}
                  <s-text color="subdued">
                    Messages: <s-text type="strong">{selectedTranscriptData.logs.length}</s-text>
                  </s-text>
                </s-stack>
              </div>
            </div>
            
          </s-stack>

          <s-button 
            slot="secondary-actions" 
            commandFor="insights-modal" 
            command="--hide"
          >
            Close
          </s-button>
        </s-modal>
      )}
    </Page>
  );
}

// --- Type Declarations for Polaris Web Components ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      's-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      's-section': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { heading?: string }, HTMLElement>;
      's-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { columns?: string | number, gap?: string, gridTemplateColumns?: string }, HTMLElement>;
      's-grid-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { gridColumn?: string }, HTMLElement>;
      's-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { padding?: string, background?: string, borderWidth?: string, borderColor?: string, borderRadius?: string }, HTMLElement>;
      's-banner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { tone?: string, heading?: string }, HTMLElement>;
      's-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { tone?: string, interestFor?: string }, HTMLElement>;
      's-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 
        commandFor?: string, 
        command?: string, 
        variant?: string,
        size?: string,
        tone?: string 
      }, HTMLElement>;
      's-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 
        id?: string, 
        heading?: string, 
        size?: string 
      }, HTMLElement>;
      's-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      's-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { variant?: string, as?: string, tone?: string, type?: string, interestFor?: string, color?: string }, HTMLElement>;
      's-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { accessibilityLabel?: string }, HTMLElement>;
      's-stack': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { gap?: string }, HTMLElement>;
      's-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { id?: string }, HTMLElement>;
    }
  }
}