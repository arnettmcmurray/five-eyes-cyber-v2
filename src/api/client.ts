const BASE = import.meta.env['VITE_API_BASE'] ?? 'http://localhost:3001';
// VITE_API_KEY is bundled into the JS at build time and visible to any browser user.
// It is a weak gate (prevents scan bots) — not a secret. Real auth uses Bearer tokens.
const API_KEY = import.meta.env['VITE_API_KEY'] ?? 'dev-local-key';

function getLearnerToken(): string | null {
  return localStorage.getItem('learner_token');
}

function getAdminToken(): string | null {
  return localStorage.getItem('admin_token');
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
  const token = getLearnerToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function adminReq<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
  const token = getAdminToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    requestOtp: (handle: string) =>
      req<void>('POST', '/auth/otp/request', { handle }),
    verifyOtp: (handle: string, code: string) =>
      req<{ token: string; learnerId: string; handle: string }>('POST', '/auth/otp/verify', { handle, code }),
    adminLogin: (username: string, password: string) =>
      req<{ token: string; username: string }>('POST', '/auth/admin/login', { username, password }),
  },
  items: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return adminReq<KBItem[]>('GET', `/kb/items${qs}`);
    },
    get: (id: string) => adminReq<KBItem>('GET', `/kb/items/${id}`),
    delete: (id: string) => adminReq<void>('DELETE', `/kb/items/${id}`),
    update: (id: string, body: Partial<Pick<KBItem, 'title' | 'type' | 'tags' | 'status'>>) =>
      adminReq<KBItem>('PATCH', `/kb/items/${id}`, body),
  },
  ingest: {
    manual: (body: { content: string; label: string; createdBy: string }) =>
      adminReq('POST', '/kb/ingest/manual', body),
    file: (body: { rawContent: string; filename: string; mimeType: string; uploadedBy: string }) =>
      adminReq('POST', '/kb/ingest/file', body),
    url: (body: { url: string; fetchedBy: string }) =>
      adminReq('POST', '/kb/ingest/url', body),
  },
  quizCandidates: {
    forItem: (itemId: string) => adminReq<QuizCandidate[]>('GET', `/kb/items/${itemId}/quiz-candidates`),
    create: (itemId: string, body: {
      revisionId: string;
      questionText: string;
      options: [string, string, string, string];
      suggestedCorrectIndex: number;
      explanation: string;
      confidence: number;
    }) => adminReq<QuizCandidate>('POST', `/kb/items/${itemId}/quiz-candidates`, body),
    approve: (id: string, reviewedBy: string) =>
      adminReq<QuizCandidate>('POST', `/kb/quiz-candidates/${id}/approve`, { reviewedBy }),
    reject: (id: string, reviewedBy: string) =>
      adminReq<QuizCandidate>('POST', `/kb/quiz-candidates/${id}/reject`, { reviewedBy }),
    promote: (id: string, moduleId: string) =>
      adminReq<QuizCandidate>('POST', `/kb/quiz-candidates/${id}/promote`, { moduleId }),
  },
  lessons: {
    forItem: (itemId: string) => adminReq<LessonLink[]>('GET', `/kb/items/${itemId}/module-links`),
    link: (moduleId: string, body: { kbItemId: string; role: string; order: number; addedBy: string }) =>
      adminReq<LessonLink>('POST', `/kb/modules/${moduleId}/links`, body),
    remove: (linkId: string) => adminReq<void>('DELETE', `/kb/links/${linkId}`),
  },
  search: async (q: string, mode: 'fts' | 'quiz-aid' = 'fts', topK = 10): Promise<SearchResult> => {
    const raw = await adminReq<Record<string, unknown>>('GET', `/kb/search?q=${encodeURIComponent(q)}&mode=${mode}&topK=${topK}`);
    return { ...raw, mode } as SearchResult;
  },
  ingestJobs: {
    list: () => adminReq<IngestJob[]>('GET', '/kb/ingest/jobs'),
  },
  revisions: {
    list: (itemId: string) => adminReq<Revision[]>('GET', `/kb/items/${itemId}/revisions`),
    create: (itemId: string, content: string, createdBy: string) =>
      adminReq<Revision>('POST', `/kb/items/${itemId}/revisions`, { content, createdBy }),
    rollback: (itemId: string, revisionId: string, performedBy: string) =>
      adminReq<Revision>('POST', `/kb/items/${itemId}/revisions/${revisionId}/rollback`, { performedBy }),
  },
  topics: {
    list: () => adminReq<Topic[]>('GET', '/kb/topics'),
    create: (body: { slug: string; name: string; description: string }) =>
      adminReq<Topic>('POST', '/kb/topics', body),
    forItem: (itemId: string) => adminReq<TopicRelationship[]>('GET', `/kb/topics/for-item/${itemId}`),
    assign: (topicId: string, itemId: string) =>
      adminReq('POST', `/kb/topics/${topicId}/assign`, { itemId, weight: 1.0, assignedBy: 'admin' }),
    unassign: (topicId: string, itemId: string) =>
      adminReq<void>('DELETE', `/kb/topics/${topicId}/items/${itemId}`),
  },
  workflow: {
    history: (itemId: string) => adminReq<WorkflowEvent[]>('GET', `/kb/items/${itemId}/workflow`),
    action: (itemId: string, action: string, performedBy: string, note?: string) =>
      adminReq('POST', `/kb/items/${itemId}/workflow/${action}`, { performedBy, note }),
  },
  learn: {
    modules: () =>
      req<LearnModulesResponse>('GET', '/learn/modules'),
    module: (id: string) =>
      req<LearnModuleResponse>('GET', `/learn/modules/${id}`),
    practice: (id: string, answers: Array<{ questionId: string; selectedIndex: number }>) =>
      req<PracticeResult>('POST', `/learn/modules/${id}/practice`, { answers }),
    help: (id: string, q: string) =>
      req<KBHelpResult>('GET', `/learn/modules/${id}/help?q=${encodeURIComponent(q)}`),
    attempts: (id: string) =>
      req<AttemptSummary[]>('GET', `/learn/modules/${id}/attempts`),
    prerequisites: (id: string) =>
      req<Array<{ id: string; slug: string; title: string; completed: boolean }>>('GET', `/learn/modules/${id}/prerequisites`),
  },
  adminProfile: {
    get: () => adminReq<{ username: string }>('GET', '/admin/profile'),
    changePassword: (newPassword: string) =>
      adminReq<{ ok: boolean }>('POST', '/admin/profile/change-password', { newPassword }),
  },
  adminProgress: {
    learners: () => adminReq<LearnerSummary[]>('GET', '/admin/progress/learners'),
    learner: (learnerId: string) => adminReq<LearnerProgressDetail>('GET', `/admin/progress/learners/${learnerId}`),
    module: (moduleId: string) => adminReq<ModuleProgressDetail>('GET', `/admin/progress/modules/${moduleId}`),
  },
  assignments: {
    forModule: (moduleId: string) => adminReq<Assignment[]>('GET', `/admin/assignments/module/${moduleId}`),
    create: (body: { moduleId: string; learnerId: string }) => adminReq<Assignment>('POST', '/admin/assignments', body),
    remove: (id: string) => adminReq<void>('DELETE', `/admin/assignments/${id}`),
  },
  modules: {
    list: () => adminReq<LearningModule[]>('GET', '/kb/modules'),
    get: (id: string) => adminReq<LearningModule>('GET', `/kb/modules/${id}`),
    create: (body: { slug: string; title: string; description: string; displayOrder?: number; estimatedMinutes?: number | null; createdBy: string }) =>
      adminReq<LearningModule>('POST', '/kb/modules', body),
    update: (id: string, body: Partial<Pick<LearningModule, 'title' | 'description' | 'displayOrder' | 'nextModuleId' | 'estimatedMinutes'>>) =>
      adminReq<LearningModule>('PATCH', `/kb/modules/${id}`, body),
    publish: (id: string) => adminReq<LearningModule>('POST', `/kb/modules/${id}/publish`, {}),
    unpublish: (id: string) => adminReq<LearningModule>('POST', `/kb/modules/${id}/unpublish`, {}),
    prerequisites: {
      get: (id: string) => adminReq<ModulePrerequisite[]>('GET', `/kb/modules/${id}/prerequisites`),
      set: (id: string, prerequisiteIds: string[]) =>
        adminReq<ModulePrerequisite[]>('PUT', `/kb/modules/${id}/prerequisites`, { prerequisiteIds }),
    },
    dependents: (id: string) => adminReq<ModulePrerequisite[]>('GET', `/kb/modules/${id}/dependents`),
    content: (id: string) => adminReq<AdminModuleContent>('GET', `/kb/modules/${id}/content`),
    delete: (id: string) => adminReq<void>('DELETE', `/kb/modules/${id}`),
  },
  ttx: {
    assist: {
      draftScenario: (body: { title: string; objective: string }) =>
        adminReq<TtxDraftScenario>('POST', '/ttx/assist/scenario', body),
      draftInjects: (body: { stepPrompt: string; scenarioContext?: string; count?: number }) =>
        adminReq<{ injects: TtxDraftInject[] }>('POST', '/ttx/assist/injects', body),
    },
    scenarios: {
      list: () => adminReq<TtxScenario[]>('GET', '/ttx/scenarios'),
      get: (id: string) => adminReq<TtxScenarioDetail>('GET', `/ttx/scenarios/${id}`),
      create: (body: { slug: string; title: string; description?: string; objective?: string }) =>
        adminReq<TtxScenario>('POST', '/ttx/scenarios', body),
      update: (id: string, body: Partial<{ title: string; description: string; objective: string }>) =>
        adminReq<TtxScenario>('PATCH', `/ttx/scenarios/${id}`, body),
      delete: (id: string) => adminReq<void>('DELETE', `/ttx/scenarios/${id}`),
      sections: {
        create: (scenarioId: string, body: { title: string; order?: number }) =>
          adminReq<TtxSection>('POST', `/ttx/scenarios/${scenarioId}/sections`, body),
        update: (scenarioId: string, sectionId: string, body: Partial<{ title: string; order: number }>) =>
          adminReq<TtxSection>('PATCH', `/ttx/scenarios/${scenarioId}/sections/${sectionId}`, body),
        delete: (scenarioId: string, sectionId: string) =>
          adminReq<void>('DELETE', `/ttx/scenarios/${scenarioId}/sections/${sectionId}`),
      },
      steps: {
        create: (scenarioId: string, sectionId: string, body: { title: string; facilitatorNarrative?: string; participantSituationRoom?: string; order?: number }) =>
          adminReq<TtxStep>('POST', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps`, body),
        update: (scenarioId: string, sectionId: string, stepId: string, body: Partial<{ title: string; facilitatorNarrative: string; participantSituationRoom: string; order: number }>) =>
          adminReq<TtxStep>('PATCH', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}`, body),
        delete: (scenarioId: string, sectionId: string, stepId: string) =>
          adminReq<void>('DELETE', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}`),
      },
      injects: {
        create: (scenarioId: string, sectionId: string, stepId: string, body: { content: string; injectType?: string; targetRoles?: string[]; consequenceLogic?: string; order?: number }) =>
          adminReq<TtxInject>('POST', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}/injects`, body),
        update: (scenarioId: string, sectionId: string, stepId: string, injectId: string, body: Partial<{ content: string; injectType: string; targetRoles: string[]; consequenceLogic: string; order: number }>) =>
          adminReq<TtxInject>('PATCH', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}/injects/${injectId}`, body),
        delete: (scenarioId: string, sectionId: string, stepId: string, injectId: string) =>
          adminReq<void>('DELETE', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}/injects/${injectId}`),
      },
    },
    participate: {
      join: (sessionId: string, role: string) =>
        req<TtxParticipant>('POST', `/ttx/participate/${sessionId}/join`, { role }),
      view: (sessionId: string) =>
        req<TtxParticipateView>('GET', `/ttx/participate/${sessionId}/view`),
      respond: (sessionId: string, body: { eventType: string; body: string }) =>
        req<TtxEvent>('POST', `/ttx/participate/${sessionId}/respond`, body),
      streamUrl: (sessionId: string) =>
        `${BASE}/ttx/participate/${sessionId}/stream?token=${getLearnerToken() ?? ''}&x-api-key=${API_KEY}`,
    },
    sessions: {
      list: () => adminReq<TtxExerciseRun[]>('GET', '/ttx/sessions'),
      get: (id: string) => adminReq<TtxExerciseRunDetail>('GET', `/ttx/sessions/${id}`),
      create: (body: { scenarioId: string; title: string; scheduledAt?: string }) =>
        adminReq<TtxExerciseRun>('POST', '/ttx/sessions', body),
      start: (id: string) => adminReq<TtxExerciseRun>('POST', `/ttx/sessions/${id}/start`, {}),
      end: (id: string) => adminReq<TtxExerciseRun>('POST', `/ttx/sessions/${id}/end`, {}),
      advance: (id: string, params: { stepId?: string; injectId?: string }) =>
        adminReq<{ currentStepId: string; event: TtxEvent }>('POST', `/ttx/sessions/${id}/advance`, params),
      join: (id: string, handle: string, role: string) =>
        adminReq<TtxParticipant>('POST', `/ttx/sessions/${id}/join`, { handle, role }),
      submitEvent: (id: string, body: { eventType: string; actorHandle: string; body: string; linkedInjectId?: string }) =>
        adminReq<TtxEvent>('POST', `/ttx/sessions/${id}/events`, body),
      aar: {
        get: (sessionId: string) => adminReq<TtxAARSummary>('GET', `/ttx/sessions/${sessionId}/aar`),
        save: (sessionId: string, body: { summary?: string }) =>
          adminReq<TtxExerciseRun>('POST', `/ttx/sessions/${sessionId}/aar`, body),
        finalize: (sessionId: string) => adminReq<TtxExerciseRun>('PATCH', `/ttx/sessions/${sessionId}/aar/finalize`, {}),
        addActionItem: (sessionId: string, body: { title?: string; body: string; owner?: string; dueAt?: string }) =>
          adminReq<TtxActionItem>('POST', `/ttx/sessions/${sessionId}/aar/action-items`, body),
        updateActionItem: (sessionId: string, itemId: string, body: Partial<{ body: string; owner: string; dueAt: string; status: string; evidence: string }>) =>
          adminReq<TtxActionItem>('PATCH', `/ttx/sessions/${sessionId}/aar/action-items/${itemId}`, body),
      },
      export: (id: string) => adminReq<TtxExport>('GET', `/ttx/sessions/${id}/export`),
      streamUrl: (sessionId: string) =>
        `${BASE}/ttx/sessions/${sessionId}/stream?token=${getAdminToken() ?? ''}&x-api-key=${API_KEY}`,
    },
  },
  governance: {
    trustLevels: () => adminReq<SourceTrustLevel[]>('GET', '/admin/source-trust-levels'),
    sources: {
      list: () => adminReq<Source[]>('GET', '/admin/sources'),
      get: (id: string) => adminReq<Source>('GET', `/admin/sources/${id}`),
      create: (body: Partial<Source>) => adminReq<Source>('POST', '/admin/sources', body),
      update: (id: string, body: Partial<Source>) => adminReq<Source>('PATCH', `/admin/sources/${id}`, body),
    },
    freshnessRules: {
      list: () => adminReq<FreshnessRule[]>('GET', '/admin/freshness-rules'),
      create: (body: Partial<FreshnessRule>) => adminReq<FreshnessRule>('POST', '/admin/freshness-rules', body),
      update: (id: string, body: Partial<FreshnessRule>) => adminReq<FreshnessRule>('PATCH', `/admin/freshness-rules/${id}`, body),
    },
    reviewQueue: {
      list: (params?: { status?: string; priority?: string }) => {
        const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return adminReq<ReviewQueueItem[]>('GET', `/admin/review-queue${qs}`);
      },
      get: (id: string) => adminReq<ReviewQueueItem>('GET', `/admin/review-queue/${id}`),
      decision: (id: string, body: { status: string; resolutionNotes?: string }) => adminReq<ReviewQueueItem>('POST', `/admin/review-queue/${id}/decision`, body),
    },
    contentAlerts: {
      list: (params?: { status?: string; severity?: string }) => {
        const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return adminReq<ContentAlert[]>('GET', `/admin/content-alerts${qs}`);
      },
      update: (id: string, body: { status: string }) => adminReq<ContentAlert>('PATCH', `/admin/content-alerts/${id}`, body),
    },
    summary: () => adminReq<GovernanceAdminSummary>('GET', '/admin/kb/governance-summary'),
    staleScan: () => adminReq<{ flagged: number; items: any[] }>('GET', '/admin/kb/governance/stale-scan'),
    runScan: () => adminReq<{ itemsScanned: number; nextReviewAtSet: number; freshnessUpdated: number; reviewQueueEnqueued: number; alertsCreated: number }>('POST', '/admin/kb/governance/run-scan', {}),
    backfill: () => adminReq<{ updated: number }>('POST', '/admin/kb/governance/backfill', {}),
  },
  itemsGov: {
    summary: (id: string) => adminReq<KBGovernanceSummary>('GET', `/admin/kb/items/${id}/governance`),
    update: (id: string, body: Partial<KBGovernanceSummary['item']>) => adminReq<KBItem>('PATCH', `/admin/kb/items/${id}/governance`, body),
    enqueue: (id: string, body: { reasonCode?: string; priority?: string }) => adminReq<ReviewQueueItem>('POST', `/admin/kb/items/${id}/governance/enqueue`, body),
    alert: (id: string, body: { alertType: string; severity?: string; message: string }) => adminReq<ContentAlert>('POST', `/admin/kb/items/${id}/governance/alert`, body),
    publishDecision: (id: string, body: { decision: string; reasonCode?: string; notes?: string }) => adminReq<PublishDecision>('POST', `/admin/kb/items/${id}/governance/publish-decision`, body),
  },
};

export interface KBItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  sourceTrust: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currentRevisionId: string | null;
  reviewStatus: string | null;
  freshnessStatus: string | null;
  freshnessCycle: string | null;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  sourceId: string | null;
  sourceUrl: string | null;
  sourceTrustLevelId: string | null;
  learnerVisible: boolean;
  publishedAt: string | null;
}

export interface QuizCandidate {
  id: string;
  kbItemId: string;
  revisionId: string;
  questionText: string;
  options: string[];
  suggestedCorrectIndex: number;
  explanation: string;
  confidence: number;
  status: 'pending-review' | 'approved' | 'rejected' | 'promoted';
  createdAt: string;
}

export interface LessonLink {
  id: string;
  moduleId: string;
  kbItemId: string;
  role: 'primary' | 'supplementary' | 'prerequisite-reading';
  order: number;
  addedBy: string;
  addedAt: string;
}

export type TopicRef = { topicId: string; topicSlug: string; topicName: string; weight: number };

export interface SearchHit {
  itemId: string;
  slug: string;
  title: string;
  excerpt: string;
  score: number;
  topics: TopicRef[];
}

export interface FtsResult {
  mode: 'fts';
  query: string;
  confidence: number;
  band: string;
  hits: SearchHit[];
}

export interface QuizAidHint {
  itemId: string;
  slug: string;
  title: string;
  learningHint: string;
  referenceScore: number;
  topics: TopicRef[];
}

export interface QuizAidRelated {
  itemId: string;
  slug: string;
  title: string;
  topics: TopicRef[];
}

export interface QuizAidResult {
  mode: 'quiz-aid';
  query: string;
  confidence: number;
  band: string;
  kbBacked: boolean;
  hint: QuizAidHint | null;
  relatedItems: QuizAidRelated[];
}

export type SearchResult = FtsResult | QuizAidResult;

export interface IngestJob {
  id: string;
  status: string;
  sourceType: string;
  label: string;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  resultItemId?: string;
  errorMessage?: string;
}

export interface Revision {
  id: string;
  itemId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentTopicId?: string;
  createdAt: string;
}

export interface TopicRelationship {
  id: string;
  itemId: string;
  topicId: string;
  weight: number;
  assignedBy: string;
  assignedAt: string;
}

export interface LearnModuleWithProgress extends LearningModule {
  locked: boolean;
  inProgress: boolean;
  completed: boolean;
  score: number | null;
  total: number | null;
  percentage: number | null;
}

export interface LearnModulesResponse {
  modules: LearnModuleWithProgress[];
  nextRecommendedId: string | null;
}

// Learner-facing types — no admin fields
export interface LearnTopicRef { slug: string; name: string }

export interface LearnStudyItem {
  id: string; slug: string; title: string; type: string; role: string;
  content: string; topics: LearnTopicRef[];
}

export interface LearnReference {
  id: string; slug: string; title: string; type: string;
  excerpt: string; topics: LearnTopicRef[];
}

export interface LearnPracticeQuestion {
  id: string; questionText: string; options: string[];
}

export interface LearnModuleResponse {
  module: { id: string; slug: string; title: string; description: string; nextModuleId: string | null };
  studyItems: LearnStudyItem[];
  references: LearnReference[];
  practiceQuestions: LearnPracticeQuestion[];
}

export interface PracticeResultItem {
  questionId: string; questionText: string; options: string[];
  correct: boolean; selectedIndex: number; correctIndex: number; explanation: string;
}

export interface RemediationItem {
  title: string;
  excerpt: string;
  topics: Array<{ slug: string; name: string }>;
}

export interface PracticeResult {
  score: number; total: number; percentage: number;
  results: PracticeResultItem[];
  recommendedTopics: LearnTopicRef[];
  remediationItems: RemediationItem[];
}

export interface ModulePrerequisite { id: string; slug: string; title: string }

export interface AdminModuleLink {
  link: { id: string; role: string; order: number; addedBy: string; addedAt: string };
  item: { id: string; slug: string; title: string; type: string; status: string };
}

export interface AdminModuleContent {
  module: { id: string; slug: string; title: string };
  items: AdminModuleLink[];
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  displayOrder: number;
  nextModuleId: string | null;
  estimatedMinutes: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KBHelpResult {
  query: string;
  confidence: number;
  band: string;
  hits: Array<{ title: string; excerpt: string; topics: Array<{ slug: string; name: string }> }>;
}

export interface AttemptSummary {
  id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  attemptedAt: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  moduleTitle: string;
  learnerId: string | null;
  groupId: string | null;
  assignedBy: string;
  assignedAt: string;
  dueAt: string | null;
}

export interface LearnerSummary {
  learnerId: string;
  handle: string;
  totalStarted: number;
  totalCompleted: number;
  lastActivityAt: string | null;
}

export interface LearnerProgressDetail {
  learnerId: string;
  handle: string;
  modules: Array<{
    moduleId: string;
    moduleTitle: string;
    status: string;
    score: number | null;
    total: number | null;
    percentage: number | null;
    lastAttemptAt: string;
    completedAt: string | null;
  }>;
}

export interface ModuleProgressDetail {
  moduleId: string;
  moduleTitle: string;
  learners: Array<{
    learnerId: string;
    handle: string;
    status: string;
    score: number | null;
    total: number | null;
    percentage: number | null;
    lastAttemptAt: string;
    completedAt: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// TTX types
// ---------------------------------------------------------------------------

export interface TtxInject {
  id: string;
  stepId: string;
  content: string;
  injectType: string;
  targetRoles: string[];
  consequenceLogic: string;
  order: number;
}

export interface TtxStep {
  id: string;
  sectionId: string;
  title: string;
  facilitatorNarrative: string;
  participantSituationRoom: string;
  prompts: string[];
  whatGoodLooksLike: string;
  consequenceNote: string;
  order: number;
  injects: TtxInject[];
}

export interface TtxSection {
  id: string;
  scenarioId: string;
  title: string;
  background: string;
  order: number;
  steps: TtxStep[];
}

export interface TtxScenario {
  id: string;
  slug: string;
  title: string;
  description: string;
  executiveSummary: string;
  objective: string;
  goals: string[];
  targetAudience: string[];
  signatureTheme: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TtxScenarioDetail extends TtxScenario {
  sections: TtxSection[];
}

export interface TtxEvent {
  id: string;
  runId: string;
  eventType: string;
  actorHandle: string;
  body: string;
  linkedInjectId: string | null;
  occurredAt: string;
}

export interface TtxParticipant {
  id: string;
  runId: string;
  handle: string;
  role: string;
  joinedAt: string;
}

export interface TtxExerciseRun {
  id: string;
  scenarioId: string;
  title: string;
  snapshot: TtxScenarioDetail; // The snapshotted scenario content
  decisions: any;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: 'planned' | 'active' | 'complete';
  facilitatorId: string;
  currentStepId: string | null;
  createdAt: string;
}

export interface TtxExerciseRunDetail extends TtxExerciseRun {
  participants: TtxParticipant[];
  events: TtxEvent[];
}

export interface TtxActionItem {
  id: string;
  runId: string;
  title: string;
  body: string;
  owner: string;
  dueAt: string | null;
  status: 'open' | 'closed' | 'retesting';
  closedAt: string | null;
  evidence: string;
  createdAt: string;
}

export interface TtxAARSummary {
  summary: string;
  actionItems: TtxActionItem[];
  [key: string]: any;
}

export interface TtxExport {
  session: TtxExerciseRun;
  participants: TtxParticipant[];
  events: TtxEvent[];
  actionItems: TtxActionItem[];
}

export interface TtxParticipateView {
  session: TtxExerciseRun;
  scenarioTitle: string;
  participants: TtxParticipant[];
  events: TtxEvent[];
  currentStep: TtxStep | null;
  myHandle: string;
}

export interface TtxDraftInject {
  content: string;
  injectType: string;
  targetRoles: string[];
  consequenceLogic: string;
}

export interface TtxDraftStep {
  title: string;
  facilitatorNarrative: string;
  participantSituationRoom: string;
  prompts: string[];
  whatGoodLooksLike: string;
  consequenceNote: string;
  injects: TtxDraftInject[];
}

export interface TtxDraftSection {
  title: string;
  background: string;
  steps: TtxDraftStep[];
}

export interface TtxDraftScenario {
  title: string;
  executiveSummary: string;
  goals: string[];
  targetAudience: string[];
  signatureTheme: string;
  sections: TtxDraftSection[];
}

export interface WorkflowEvent {
  id: string;
  itemId: string;
  action: string;
  performedBy: string;
  note?: string;
  fromStatus: string;
  toStatus: string;
  performedAt: string;
}

export interface SourceTrustLevel {
  id: string;
  code: string;
  name: string;
  description: string;
  rank: number;
}

export interface Source {
  id: string;
  name: string;
  sourceType: string;
  domain: string;
  baseUrl: string | null;
  trustLevelId: string;
  status: string;
  ingestMode: string;
  ownerUserId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FreshnessRule {
  id: string;
  appliesToType: string;
  appliesToValue: string;
  reviewAfterDays: number;
  expireAfterDays: number;
  alertBeforeDays: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewQueueItem {
  id: string;
  contentItemId: string;
  sourceId: string | null;
  reasonCode: string;
  priority: string;
  status: string;
  assignedToUserId: string | null;
  resolutionNotes: string | null;
  resolvedByUserId: string | null;
  openedAt: string;
  resolvedAt: string | null;
}

export interface ContentAlert {
  id: string;
  contentItemId: string;
  sourceId: string | null;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface GovernanceAdminSummary {
  total: number;
  published: number;
  learnerVisible: number;
  byReviewStatus: Record<string, number>;
  byFreshnessStatus: Record<string, number>;
  openAlerts: number;
  criticalAlerts: number;
  pendingReviews: number;
  blockingReviews: number;
}

export interface PublishDecision {
  id: string;
  contentItemId: string;
  decision: string;
  reasonCode: string | null;
  notes: string | null;
  decidedByUserId: string;
  decidedAt: string;
}

export interface KBGovernanceSummary {
  item: {
    id: string; slug: string; title: string; status: string;
    reviewStatus: string | null; freshnessStatus: string | null; freshnessCycle: string | null;
    learnerVisible: boolean; lastReviewedAt: string | null; nextReviewAt: string | null;
    publishedAt: string | null; sourceId: string | null; sourceUrl: string | null; sourceTrustLevelId: string | null;
  };
  source: Source | null;
  trustLevel: SourceTrustLevel | null;
  openReviewItems: ReviewQueueItem[];
  openAlerts: ContentAlert[];
  recentDecisions: PublishDecision[];
}
