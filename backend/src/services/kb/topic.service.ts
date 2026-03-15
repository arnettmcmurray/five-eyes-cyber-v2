import type { Topic, TopicRelationship } from '../../models/kb/topic.js';

/** Manages Topics and TopicRelationships. */
export class KBTopicService {
  async createTopic(data: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    throw new Error('Not implemented: KBTopicService.createTopic');
  }

  async getTopic(id: string): Promise<Topic | null> {
    throw new Error('Not implemented: KBTopicService.getTopic');
  }

  async listTopics(): Promise<Topic[]> {
    throw new Error('Not implemented: KBTopicService.listTopics');
  }

  async assignTopic(
    itemId: string,
    topicId: string,
    weight: number,
    assignedBy: 'admin' | 'pipeline',
  ): Promise<TopicRelationship> {
    throw new Error('Not implemented: KBTopicService.assignTopic');
  }

  async getTopicsForItem(itemId: string): Promise<TopicRelationship[]> {
    throw new Error('Not implemented: KBTopicService.getTopicsForItem');
  }

  async getItemsForTopic(topicId: string): Promise<TopicRelationship[]> {
    throw new Error('Not implemented: KBTopicService.getItemsForTopic');
  }
}
