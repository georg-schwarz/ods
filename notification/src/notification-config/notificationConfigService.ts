import { NotificationConfig } from './notificationConfig';
import { NotificationRepository } from './notificationRepository';

export class NotificationConfigService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getForPipeline(pipelineId: number): Promise<NotificationConfig[]> {
    return await this.notificationRepository.getForPipeline(pipelineId);
  }

  async getById(id: number): Promise<NotificationConfig | undefined> {
    return await this.notificationRepository.getById(id);
  }

  async getAll(): Promise<NotificationConfig[]> {
    return await this.notificationRepository.getAll();
  }

  async create(config: NotificationConfig): Promise<NotificationConfig> {
    return await this.notificationRepository.create(config);
  }

  async update(
    id: number,
    config: NotificationConfig,
  ): Promise<NotificationConfig | undefined> {
    return await this.notificationRepository.update(id, config);
  }

  delete(id: number): Promise<NotificationConfig | undefined> {
    return this.notificationRepository.delete(id);
  }
}
