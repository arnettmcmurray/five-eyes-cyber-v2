import type { QuizCandidate } from '../../models/kb/quiz-candidate.js';

/** Manages QuizCandidates — pending review, approval, rejection, and promotion. */
export class KBQuizCandidateService {
  async create(data: Omit<QuizCandidate, 'id' | 'createdAt'>): Promise<QuizCandidate> {
    throw new Error('Not implemented: KBQuizCandidateService.create');
  }

  async listForItem(kbItemId: string): Promise<QuizCandidate[]> {
    throw new Error('Not implemented: KBQuizCandidateService.listForItem');
  }

  async approve(candidateId: string, reviewedBy: string): Promise<QuizCandidate> {
    throw new Error('Not implemented: KBQuizCandidateService.approve');
  }

  async reject(candidateId: string, reviewedBy: string): Promise<QuizCandidate> {
    throw new Error('Not implemented: KBQuizCandidateService.reject');
  }

  async promote(candidateId: string, moduleId: string): Promise<QuizCandidate> {
    throw new Error('Not implemented: KBQuizCandidateService.promote');
  }
}
