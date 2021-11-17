import path from 'path';

import { JestPactOptions, pactWith } from 'jest-pact';

import {
  exampleNotificationConfig,
  getAllEmptyResponse,
  getAllRequest,
  getAllRequestTitle,
  getAllSuccessResponse,
} from './notification.consumer.pact.fixtures';
import { NotificationRest } from './notification/NotificationRest';

const options: JestPactOptions = {
  consumer: 'UI',
  provider: 'Notification',
  dir: path.resolve(process.cwd(), '..', 'pacts'),
  logDir: path.resolve(process.cwd(), '..', 'pacts', 'logs'),
  pactfileWriteMode: 'overwrite',
};

pactWith(options, provider => {
  let restService: NotificationRest;

  describe('using notification rest', () => {
    beforeAll(() => {
      const notificationServiceUrl = provider.mockService.baseUrl;
      restService = new NotificationRest(notificationServiceUrl);
    });

    describe('getting all notifications for a pipeline', () => {
      describe('when some notifications exist for that pipeline', () => {
        beforeEach(async () => {
          await provider.addInteraction({
            state: 'some notifications exist for pipeline 5',
            uponReceiving: getAllRequestTitle,
            withRequest: getAllRequest,
            willRespondWith: getAllSuccessResponse,
          });
        });

        it('returns a non-empty notification array', async () => {
          const notifications = await restService.getAllByPipelineId(5);

          expect(notifications).toStrictEqual([exampleNotificationConfig]);
        });
      });

      describe('when no notification exists for that pipeline', () => {
        beforeEach(async () => {
          await provider.addInteraction({
            state: 'no notifications exist for pipeline 5',
            uponReceiving: getAllRequestTitle,
            withRequest: getAllRequest,
            willRespondWith: getAllEmptyResponse,
          });
        });

        it('returns an empty pipeline array', async () => {
          const notifications = await restService.getAllByPipelineId(5);

          expect(notifications).toStrictEqual([]);
        });
      });
    });
  });
});
