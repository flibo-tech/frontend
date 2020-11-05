<template>
  <div
    class="notification-container"
    :style="
      notification.tapped_on == null ||
      notification.tapped_on == 'in_app_notification_seen'
        ? 'background: aliceblue;'
        : ''
    "
    @click="openNotification"
  >
    <div class="notification-image-cropper" v-if="notification.image">
      <img class="notification-pp" :src="notification.image" alt="image" />
    </div>

    <div class="notification-text">
      <p
        :style="
          is_mobile
            ? 'font-weight: bold; width: calc(100vw - 98px); margin-bottom: 3px;'
            : 'font-weight: bold; width: calc(1000px - 98px); margin-bottom: 3px;'
        "
      >
        {{ notification.content }}
      </p>

      <TextView
        v-if="notification.title"
        :style="
          is_mobile
            ? 'width: calc(100vw - 98px); overflow: hidden;'
            : 'width: calc(1000px - 98px); overflow: hidden;'
        "
        :text="notification.title"
        parent="notification"
        :preventClick="true"
        :noWrap="true"
      />

      <TimeSince :timestamp="notification.created_at" />
    </div>
  </div>
</template>

<script>
import TextView from "./TextView";
import TimeSince from "./../atomic/TimeSince";

export default {
  name: "Notification",
  components: {
    TextView,
    TimeSince,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
    };
  },
  methods: {
    openNotification() {
      if (
        this.notification.tapped_on == null ||
        this.notification.tapped_on == "in_app_notification_seen"
      ) {
        this.$emit("mark-notification-seen", {
          notification_id: this.notification.notification_id,
          status: "in_app_notification_tapped",
        });
      }
      this.$router.push(
        this.notification.url
          .replace("https://yzal-dev.flibo.ai", "")
          .replace("https://flibo.ai", "")
      );
    },
  },
};
</script>

<style scoped>
.notification-container {
  display: flex;
  width: 100%;
  padding: 8px 16px;
  overflow: hidden;
  cursor: pointer;
}
.notification-image-cropper {
  height: 50px;
  width: 50px;
  min-width: 50px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.notification-pp {
  width: 101%;
}
.notification-text {
  margin-left: 16px;
  font-size: 14px;
  display: inline;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333;
  font-family: "Roboto", sans-serif;
  text-align: left;
}
</style>
