import type { LessonContentLink } from '../../models/kb/lesson.js';

/** Manages LessonContentLinks between training modules and KB items. */
export class KBLessonService {
  async linkToModule(data: Omit<LessonContentLink, 'id' | 'addedAt'>): Promise<LessonContentLink> {
    throw new Error('Not implemented: KBLessonService.linkToModule');
  }

  async getLinksForModule(moduleId: string): Promise<LessonContentLink[]> {
    throw new Error('Not implemented: KBLessonService.getLinksForModule');
  }

  async getLinksForItem(kbItemId: string): Promise<LessonContentLink[]> {
    throw new Error('Not implemented: KBLessonService.getLinksForItem');
  }

  async removeLink(id: string): Promise<void> {
    throw new Error('Not implemented: KBLessonService.removeLink');
  }
}
