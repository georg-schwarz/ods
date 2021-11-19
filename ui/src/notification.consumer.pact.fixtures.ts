import { RequestOptions, ResponseOptions } from '@pact-foundation/pact';
import { eachLike } from '@pact-foundation/pact/src/dsl/matchers';

import NotificationConfig, {
  NotificationType,
} from './notification/notificationConfig';
import { NotificationApiReadModel } from './notification/NotificationRest';

export const exampleReceivedNotificationConfig: NotificationApiReadModel = {
  id: 123,
  pipelineId: 5,
  condition: 'true',
  type: NotificationType.WEBHOOK,
  parameter: {
    url: 'www.test-data.de',
  },
};

export const exampleNotificationConfig: NotificationConfig = {
  id: 123,
  pipelineId: 5,
  condition: 'true',
  type: NotificationType.WEBHOOK,
  parameters: {
    url: 'www.test-data.de',
  },
};

export const getAllRequestTitle =
  'a request for getting all notifications of pipeline 5';
export const getAllRequest: RequestOptions = {
  method: 'GET',
  path: '/configs',
  query: 'pipelineId=5',
};

export const getAllEmptyResponse: ResponseOptions = {
  // TODO any success status code is actually acceptable (i.e. 2xx)
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: [],
};

export const getAllSuccessResponse: ResponseOptions = {
  // TODO any success status code is actually acceptable (i.e. 2xx)
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: eachLike(exampleReceivedNotificationConfig),
};

export const getByIdRequestTitle =
  'a request for getting a notification by id 5';
export const getByIdRequest: RequestOptions = {
  method: 'GET',
  path: '/configs/5',
};

export const getByIdRequestEmptyResponse: ResponseOptions = {
  status: 204,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: '',
};

export const getByIdRequestSuccessResponse: ResponseOptions = {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: eachLike(exampleReceivedNotificationConfig),
};
