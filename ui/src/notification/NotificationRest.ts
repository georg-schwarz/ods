import axios, { AxiosInstance } from 'axios';

import NotificationConfig, {
  NotificationParameters,
  NotificationType,
} from '@/notification/notificationConfig';

export class NotificationRest {
  private readonly configsHttpClient: AxiosInstance;

  constructor(notificationServiceUrl: string) {
    /**
     * Axios instance with default headers and base url.
     * The option transformResponse is set to an empty array
     * because of explicit JSON.parser call with custom reviver.
     */
    this.configsHttpClient = axios.create({
      baseURL: `${notificationServiceUrl}`,
      headers: { 'Content-Type': 'application/json' },
      transformResponse: [],
    });
  }

  async getAllByPipelineId(pipelineId: number): Promise<NotificationConfig[]> {
    const response = await this.configsHttpClient.get(
      `/configs?pipelineId=${pipelineId}`,
    );
    const notifications = JSON.parse(
      response.data,
    ) as NotificationApiReadModel[];
    return this.fromApiReadModels(notifications);
  }

  async getById(id: number): Promise<NotificationConfig | undefined> {
    const response = await this.configsHttpClient.get(`/configs/${id}`);

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(
        `Request failed to get notification with id ${id}:\n${JSON.stringify(
          response.data,
        )}`,
      );
    }

    if (response.status === 204) {
      return undefined;
    }

    const notificationApiModel = JSON.parse(
      response.data,
    ) as NotificationApiReadModel;

    return this.fromApiReadModel(notificationApiModel);
  }

  async create(
    notificationConfig: NotificationConfig,
  ): Promise<NotificationConfig> {
    const apiModel = this.toApiWriteModel(notificationConfig);

    const response = await this.configsHttpClient.post(
      '/configs',
      JSON.stringify(apiModel),
    );
    const notificationApiModel = JSON.parse(
      response.data,
    ) as NotificationApiReadModel;
    return this.fromApiReadModel(notificationApiModel);
  }

  async update(notificationConfig: NotificationConfig): Promise<void> {
    const id = notificationConfig.id;
    const apiModel = this.toApiWriteModel(notificationConfig);

    return await this.configsHttpClient.put(
      `/configs/${id}`,
      JSON.stringify(apiModel),
    );
  }

  async remove(notificationConfig: NotificationConfig): Promise<void> {
    const id = notificationConfig.id;

    return await this.configsHttpClient.delete(`/configs/${id}`);
  }

  private toApiWriteModel(
    notification: NotificationConfig,
  ): NotificationApiWriteModel {
    return {
      pipelineId: notification.pipelineId,
      condition: notification.condition,
      type: notification.type,
      parameter: notification.parameters,
    };
  }

  private fromApiReadModel(
    notificationApiModel: NotificationApiReadModel,
  ): NotificationConfig {
    return {
      id: notificationApiModel.id,
      pipelineId: notificationApiModel.pipelineId,
      condition: notificationApiModel.condition,
      type: NotificationType[notificationApiModel.type],
      parameters: notificationApiModel.parameter,
    };
  }

  private fromApiReadModels(
    notificationApiModels: NotificationApiReadModel[],
  ): NotificationConfig[] {
    return notificationApiModels.map(x => this.fromApiReadModel(x));
  }
}

export interface NotificationApiReadModel extends NotificationApiWriteModel {
  id: number;
}

export interface NotificationApiWriteModel {
  pipelineId: number;
  condition: string;
  type: ApiNotificationType;
  parameter: NotificationParameters | Record<string, unknown>;
}

type ApiNotificationType = 'WEBHOOK' | 'SLACK' | 'FCM';
