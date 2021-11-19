import path from 'path';

import { Verifier } from '@pact-foundation/pact';

import {
  NotificationConfig,
  NotificationType,
} from './notification-config/notificationConfig';

import { port, server } from './index'; // The main method is automatically called due to this import

const notificationConfigs: NotificationConfig[] = [];
let nextNotificationConfigId = 0;

jest.mock('./notification-config/notificationConfigService', () => {
  return {
    NotificationConfigService: jest.fn().mockImplementation(() => {
      return {
        getAll: jest.fn().mockImplementation(() => notificationConfigs),
        getForPipeline: jest
          .fn()
          .mockImplementation(async (pipelineId: number) => {
            const result = notificationConfigs.filter(
              (config) => config.pipelineId === pipelineId,
            );
            return Promise.resolve(result);
          }),

        getById: jest.fn().mockImplementation(async (id: number) => {
          const result = notificationConfigs.find((config) => config.id === id);
          return Promise.resolve(result);
        }),

        create: jest
          .fn()
          .mockImplementation(
            async (config: NotificationConfig): Promise<NotificationConfig> => {
              const result: NotificationConfig = {
                ...config,
                id: ++nextNotificationConfigId,
              };
              notificationConfigs.push(result);
              return await Promise.resolve(result);
            },
          ),

        update: jest.fn(
          async (
            id: number,
            config: NotificationConfig,
          ): Promise<NotificationConfig | undefined> => {
            const configToUpdate = notificationConfigs.find(
              (config) => config.id === id,
            );
            return Promise.resolve(Object.assign(configToUpdate, config));
          },
        ),

        delete: jest.fn((id: number): Promise<void> => {
          const indexOfConfigToDelete = notificationConfigs.findIndex(
            (config) => config.id === id,
          );
          if (indexOfConfigToDelete !== -1) {
            notificationConfigs.splice(indexOfConfigToDelete, 1);
          }
          return Promise.resolve();
        }),
      };
    }),
  };
});

// The following mocks are needed for propper execution of the main function
jest.mock('./notification-execution/notificationExecutor', () => {
  return function (): unknown {
    return {};
  };
});
jest.mock('./api/amqp/pipelineSuccessConsumer', () => {
  return {
    createPipelineSuccessConsumer: jest.fn(),
  };
});
jest.mock('@jvalue/node-dry-amqp', () => {
  return {
    AmqpConnection: jest.fn(),
  };
});

describe('Pact Provider Verification', () => {
  it('validates the expectations of the UI', async () => {
    const verifier = new Verifier({
      provider: 'Notification',
      providerBaseUrl: `http://localhost:${port}`,
      pactUrls: [
        path.resolve(process.cwd(), '..', 'pacts', 'ui-notification.json'),
      ],
      logDir: path.resolve(process.cwd(), '..', 'pacts', 'logs'),
      stateHandlers: {
        'some notifications exist for pipeline 5': setupSomeNotificationConfigs,
        'no notifications exist for pipeline 5': setupEmptyState,
        'notifications with id 3 exists': setupSomeNotificationConfigs,
        'no notifications with id 3 exists': setupEmptyState,
        // eslint-disable-next-line prettier/prettier
        'whenever': setupSomeNotificationConfigs,
      },
    });
    await verifier.verifyProvider().finally(() => {
      server?.close();
    });
  });
});

async function setupEmptyState(): Promise<void> {
  clearState();

  return Promise.resolve();
}

async function setupSomeNotificationConfigs(): Promise<void> {
  clearState();
  addSampleNotificationConfig(++nextNotificationConfigId, 2);
  addSampleNotificationConfig(++nextNotificationConfigId, 3);
  addSampleNotificationConfig(++nextNotificationConfigId, 5);

  return Promise.resolve();
}

function clearState(): void {
  nextNotificationConfigId = 0;
  clearNotificationConfigs();
}

function clearNotificationConfigs(): void {
  notificationConfigs.splice(0, notificationConfigs.length);
}

function addSampleNotificationConfig(id: number, pipelineId: number): void {
  const notificationConfig: NotificationConfig = {
    id: id,
    pipelineId: pipelineId,
    type: NotificationType.WEBHOOK,
    parameter: {
      url: 'http://www.example-data.com',
    },
    condition: 'true',
  };
  notificationConfigs.push(notificationConfig);
}
