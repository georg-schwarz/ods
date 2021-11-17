<template>
  <v-card>
    <v-card-title>
      <span class="headline">Create Notification</span>
    </v-card-title>
    <v-card-text>
      <notification-form
        v-model="notification"
        @changeValidity="isValid = $event"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        class="ma-2"
        :disabled="!isValid"
        @click="onCreate()"
      >
        Save
      </v-btn>
      <v-btn color="error" class="ma-2" @click="onCancel()">
        Cancel
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { NotificationRest } from './NotificationRest';

import { NOTIFICATION_SERVICE_URL } from '@/env';
import NotificationConfig, {
  NotificationType,
} from '@/notification/notificationConfig';
import NotificationForm from '@/notification/NotificationForm.vue';

@Component({
  components: { NotificationForm },
})
export default class NotificationCreate extends Vue {
  private isValid = false;
  private notificationRest = new NotificationRest(NOTIFICATION_SERVICE_URL);

  private notification: NotificationConfig = {
    id: -1,
    pipelineId: -1,
    condition: 'true',
    type: NotificationType.WEBHOOK,
    parameters: {},
  };

  private mounted(): void {
    this.notification.pipelineId = Number.parseInt(
      this.$route.params.pipelineId,
      10,
    );
  }

  private async onCreate(): Promise<void> {
    await this.notificationRest.create(this.notification);
    this.$router
      .push({ name: 'notification-overview' })
      .catch(error =>
        console.log('Failed to route to notification-overview', error),
      );
  }

  private onCancel(): void {
    this.$router.back();
  }
}
</script>
