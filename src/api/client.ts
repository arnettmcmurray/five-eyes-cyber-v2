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
  modules: {
    list: () => adminReq<LearningModule[]>('GET', '/kb/modules'),
    get: (id: string) => adminReq<LearningModule>('GET', `/kb/modules/${id}`),
    create: (body: { slug: string; title: string; description: string; displayOrder?: number; createdBy: string }) =>
      adminReq<LearningModule>('POST', '/kb/modules', body),
    update: (id: string, body: Partial<Pick<LearningModule, 'title' | 'description' | 'displayOrder' | 'nextModuleId'>>) =>
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
        create: (scenarioId: string, sectionId: string, body: { prompt: string; facilitatorNotes?: string; order?: number }) =>
          adminReq<TtxStep>('POST', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps`, body),
        update: (scenarioId: string, sectionId: string, stepId: string, body: Partial<{ prompt: string; facilitatorNotes: string; order: number }>) =>
          adminReq<TtxStep>('PATCH', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}`, body),
        delete: (scenarioId: string, sectionId: string, stepId: string) =>
          adminReq<void>('DELETE', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}`),
      },
      injects: {
        create: (scenarioId: string, sectionId: string, stepId: string, body: { body: string; injectType?: string; targetRoles?: string[]; suggestedTimingMinutes?: number; order?: number }) =>
          adminReq<TtxInject>('POST', `/ttx/scenarios/${scenarioId}/sections/${sectionId}/steps/${stepId}/injects`, body),
        update: (scenarioId: string, sectionId: string, stepId: string, injectId: string, body: Partial<{ body: string; injectType: string; targetRoles: string[]; suggestedTimingMinutes: number; order: number }>) =>
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
      list: () => adminReq<TtxSession[]>('GET', '/ttx/sessions'),
      get: (id: string) => adminReq<TtxSessionDetail>('GET', `/ttx/sessions/${id}`),
      create: (body: { scenarioId: string; title: string; scheduledAt?: string }) =>
        adminReq<TtxSession>('POST', '/ttx/sessions', body),
      start: (id: string) => adminReq<TtxSession>('POST', `/ttx/sessions/${id}/start`, {}),
      end: (id: string) => adminReq<TtxSession>('POST', `/ttx/sessions/${id}/end`, {}),
      advance: (id: string, injectId: string) =>
        adminReq<{ currentInjectId: string; event: TtxEvent }>('POST', `/ttx/sessions/${id}/advance`, { injectId }),
      join: (id: string, handle: string, role: string) =>
        adminReq<TtxParticipant>('POST', `/ttx/sessions/${id}/join`, { handle, role }),
      submitEvent: (id: string, body: { eventType: string; actorHandle: string; body: string; linkedInjectId?: string }) =>
        adminReq<TtxEvent>('POST', `/ttx/sessions/${id}/events`, body),
      aar: {
        get: (sessionId: string) => adminReq<TtxAAR>('GET', `/ttx/sessions/${sessionId}/aar`),
        save: (sessionId: string, body: { summary?: string; strengths?: string; improvements?: string }) =>
          adminReq<TtxAAR>('POST', `/ttx/sessions/${sessionId}/aar`, body),
        finalize: (sessionId: string) => adminReq<TtxAAR>('PATCH', `/ttx/sessions/${sessionId}/aar/finalize`, {}),
        addActionItem: (sessionId: string, body: { body: string; owner?: string; dueAt?: string }) =>
          adminReq<TtxActionItem>('POST', `/ttx/sessions/${sessionId}/aar/action-items`, body),
        updateActionItem: (sessionId: string, itemId: string, body: Partial<{ body: string; owner: string; dueAt: string; status: string; evidence: string }>) =>
          adminReq<TtxActionItem>('PATCH', `/ttx/sessions/${sessionId}/aar/action-items/${itemId}`, body),
      },
      export: (id: string) => adminReq<TtxExport>('GET', `/ttx/sessions/${id}/export`),
      streamUrl: (sessionId: string) =>
        `${BASE}/ttx/sessions/${sessionId}/stream?token=${getAdminToken() ?? ''}&x-api-key=${API_KEY}`,
    },
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
  id: string; stepId: string; body: string; injectType: string;
  targetRoles: string[]; suggestedTimingMinutes: number | null; order: number;
}

export interface TtxStep {
  id: string; sectionId: string; prompt: string; facilitatorNotes: string; order: number;
  injects: TtxInject[];
}

export interface TtxSection {
  id: string; scenarioId: string; title: string; order: number;
  steps: TtxStep[];
}

export interface TtxScenario {
  id: string; slug: string; title: string; description: string;
  objective: string; createdBy: string; createdAt: string; updatedAt: string;
}

export interface TtxScenarioDetail extends TtxScenario {
  sections: TtxSection[];
}

export interface TtxEvent {
  id: string; sessionId: string; eventType: string; actorHandle: string;
  body: string; linkedInjectId: string | null; occurredAt: string;
}

export interface TtxParticipant {
  id: string; sessionId: string; handle: string; role: string; joinedAt: string;
}

export interface TtxSession {
  id: string; scenarioId: string; title: string;
  scheduledAt: string | null; startedAt: string | null; endedAt: string | null;
  status: 'planned' | 'active' | 'ended';
  facilitatorId: string; currentInjectId: string | null; createdAt: string;
}

export interface TtxSessionDetail extends TtxSession {
  participants: TtxParticipant[];
  events: TtxEvent[];
}

export interface TtxActionItem {
  id: string; aarId: string; body: string; owner: string;
  dueAt: string | null; status: string; closedAt: string | null; evidence: string;
}

export interface TtxAAR {
  id: string; sessionId: string; summary: string; strengths: string;
  improvements: string; status: string; createdBy: string;
  createdAt: string; updatedAt: string;
  actionItems: TtxActionItem[];
}

export interface TtxExport {
  session: TtxSession;
  scenario: TtxScenario | null;
  participants: TtxParticipant[];
  events: TtxEvent[];
  aar: TtxAAR | null;
}

export interface TtxParticipateView {
  session: TtxSession;
  scenarioTitle: string;
  participants: TtxParticipant[];
  events: TtxEvent[];
  currentInject: (TtxInject & { stepPrompt: string }) | null;
  myHandle: string;
}

export interface TtxDraftInject {
  body: string;
  injectType: string;
  targetRoles: string[];
  suggestedTimingMinutes: number | null;
}

export interface TtxDraftStep {
  prompt: string;
  facilitatorNotes: string;
  injects: TtxDraftInject[];
}

export interface TtxDraftSection {
  title: string;
  steps: TtxDraftStep[];
}

export interface TtxDraftScenario {
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
