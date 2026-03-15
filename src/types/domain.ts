/**
 * domain.ts — Single source of truth for all Five Eyes v2 domain types.
 * Referenced across layouts, pages, services, and components.
 */

// ---------------------------------------------------------------------------
// User & Groups
// ---------------------------------------------------------------------------

/** A platform user with role-based tier access. */
export interface User {
  id: string;
  email: string;
  tier: 'free' | 'individual' | 'premium' | 'supervisor' | 'admin';
  company?: string;
  department?: string;
  createdAt: string;
}

/** A named collection of users used for bulk assignment targeting. */
export interface GroupTag {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
}

// ---------------------------------------------------------------------------
// Knowledge Base
// ---------------------------------------------------------------------------

/** A versioned knowledge base article stored in the kb_items table. */
export interface KnowledgeItem {
  id: string;
  slug: string;
  title: string;
  type: 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term';
  tags: string[];
  status: 'draft' | 'under-review' | 'published';
  sourceTrust: 'internal' | 'external-curated' | 'raw-upload';
  createdBy: string;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
}

/** A specific revision of a KnowledgeItem stored in the kb_revisions table. */
export interface KnowledgeRevision {
  id: string;
  itemId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Modules & Quizzes
// ---------------------------------------------------------------------------

/** A single multiple-choice question within a module quiz. */
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** A training module with associated quiz, mapped to the modules table. */
export interface Module {
  id: string;
  slug: string;
  title: string;
  category:
    | 'phishing'
    | 'ransomware'
    | 'supply-chain'
    | 'compliance'
    | 'incident-response'
    | 'physical-security';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  kbArticleId: string;
  estimatedMinutes: number;
  status: 'draft' | 'published' | 'archived';
  order: number;
  prerequisites: string[];
  quiz: QuizQuestion[];
}

// ---------------------------------------------------------------------------
// Assignments & Progress
// ---------------------------------------------------------------------------

/** An assignment of a module or TTX scenario to a user or group. */
export interface Assignment {
  id: string;
  targetType: 'user' | 'group';
  targetId: string;
  contentType: 'module' | 'ttx-scenario';
  contentId: string;
  assignedBy: string;
  assignedAt: string;
  dueAt?: string;
}

/** Per-user progress record for a training module. */
export interface ProgressRecord {
  userId: string;
  moduleId: string;
  state: 'not_started' | 'in_progress' | 'completed';
  quizScore?: number;
  completedAt?: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Tabletop Exercise (TTX)
// ---------------------------------------------------------------------------

/** A TTX scenario definition containing narrative and injects. */
export interface TTXScenario {
  id: string;
  slug: string;
  title: string;
  description: string;
  narrativeMarkdown: string;
  injects: TTXInject[];
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
}

/** An active or completed TTX exercise session run. */
export interface TTXSession {
  id: string;
  scenarioId: string;
  facilitatorId: string;
  participantIds: string[];
  state: 'pending' | 'active' | 'paused' | 'completed';
  startedAt?: string;
  completedAt?: string;
  decisions: TTXDecision[];
  outcomes: TTXOutcome[];
}

/** A scenario prompt or situation delivered to participants during a TTX run. */
export interface TTXInject {
  id: string;
  scenarioId: string;
  order: number;
  title: string;
  body: string;
  kbReferenceSlug?: string;
  aiGenerated: boolean;
  approved: boolean;
}

/** A decision recorded by participants in response to a TTX inject. */
export interface TTXDecision {
  id: string;
  sessionId: string;
  injectId: string;
  decidedBy: string;
  decisionText: string;
  decidedAt: string;
}

/** A post-run after-action review (AAR) outcome entry for a TTX session. */
export interface TTXOutcome {
  id: string;
  sessionId: string;
  summary: string;
  lessonsLearned: string[];
  recommendedModuleSlugs: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// KB Retrieval & AI
// ---------------------------------------------------------------------------

/** The structured result returned by the knowledge base retrieval API. */
export interface RetrievalResult {
  query: string;
  confidence: number;
  band: 'high' | 'medium' | 'low';
  matchedItems: Array<{
    itemId: string;
    slug: string;
    title: string;
    excerpt: string;
    score: number;
  }>;
  suggestedModuleSlug?: string;
  aiCalledFallback: boolean;
  answer?: string;
}

/** An AI usage log entry, stored in event_logs with event_type = 'ai_call'. */
export interface AIUsageLog {
  id: string;
  userId: string;
  surface:
    | 'cabinet_search'
    | 'module_explanation'
    | 'ttx_inject'
    | 'cabinet_fallback';
  query: string;
  confidenceAtTrigger: number;
  responseType: 'synthesis' | 'explanation' | 'inject' | 'fallback';
  timestamp: string;
}
