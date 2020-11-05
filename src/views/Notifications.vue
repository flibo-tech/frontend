<template>
  <div class="feed-container">
    <Feed
      v-if="!noNotificationFound"
      parent="notifications"
      @mark-notification-seen="
        (param) => markNotificationsSeen([param.notification_id], param.status)
      "
      v-on="$listeners"
    />
    <div v-else class="na-message">No notifications found.</div>
  </div>
</template>

<script>
import axios from "axios";
import Feed from "./../components/molecular/Feed";

export default {
  name: "app",
  components: {
    Feed,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      noNotificationFound: false,
    };
  },
  created() {
    if (
      this.$store.state.feed.notifications.contents.length == 0 ||
      this.store.notifications.notifications
    ) {
      this.fetchNotifications();
    }
  },
  methods: {
    fetchNotifications(fetchedNotifications = []) {
      var self = this;

      if (fetchedNotifications.length == 0) {
        this.resetNotificationsStore();
      }

      if (fetchedNotifications.length) {
        self.$store.state.feed.notifications.fetching_incremental = true;
      } else {
        self.$store.state.feed.notifications.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "notifications", {
          session_id: self.$store.state.session_id,
          fetched_notifications: fetchedNotifications,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            if (fetchedNotifications.length) {
              self.$store.state.feed.notifications.contents.push(
                ...response.data.notifications
              );
              if (self.$route.path == "/notifications") {
                self.$store.state.feed_filters.apply_filters_wo_reset = true;
              } else if (self.store.feed.notifications.feed_list.length < 50) {
                self.store.feed.notifications.apply_filters_on_create = true;
              }
            } else {
              self.$store.state.feed.notifications.contents =
                response.data.notifications;
              self.store.feed.notifications.feed_list = self.$store.state.feed.notifications.contents.slice(
                0,
                self.$store.state.feed.defaultListSize
              );

              self.fetchNotifications(
                response.data.notifications.map(
                  (notification) => notification.notification_id
                )
              );

              if (self.$route.path == "/notifications") {
                self.$nextTick(function () {
                  self.$store.state.feed.update_dom = true;
                });
              }
            }
          } else if (
            [204].includes(response.status) &&
            fetchedNotifications.length == 0
          ) {
            self.noNotificationFound = true;
          }

          if (fetchedNotifications.length) {
            self.$store.state.feed.notifications.fetching_incremental = false;
            self.markNotificationsSeen();
          } else {
            self.$store.state.feed.notifications.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedNotifications.length) {
            self.$store.state.feed.notifications.fetching_incremental = false;
          } else {
            self.$store.state.feed.notifications.fetching = false;
          }
        });
    },
    resetNotificationsStore() {
      this.store.feed.notifications.contents = [];
      this.store.feed.notifications.apply_filters_on_create = false;
      this.store.feed.notifications.element_heights = {};
      this.store.feed.notifications.feed_list = [];
      this.store.feed.notifications.fetching = false;
      this.store.feed.notifications.fetching_incremental = false;
      this.store.feed.notifications.padding_top = 0;
      this.store.feed.notifications.padding_bottom = 0;
      this.store.feed.notifications.scroll_position = 0;
      this.store.feed.notifications.observer_current_index = 0;
    },
    markNotificationsSeen(
      notification_ids = [],
      status = "in_app_notification_seen"
    ) {
      if (notification_ids.length == 0) {
        notification_ids = this.store.feed.notifications.contents
          .filter((notification) => notification.tapped_on == null)
          .map((notification) => notification.notification_id);
      }

      if (notification_ids.length) {
        this.store.feed.notifications.contents = this.store.feed.notifications.contents.map(
          (notification) =>
            notification_ids.includes(notification.notification_id)
              ? { ...notification, tapped_on: status }
              : notification
        );

        this.store.feed.notifications.feed_list = this.store.feed.notifications.feed_list.map(
          (notification) =>
            notification_ids.includes(notification.notification_id)
              ? { ...notification, tapped_on: status }
              : notification
        );

        this.store.notifications.notifications = 0;

        axios.post(this.$store.state.api_host + "mark_notifications_seen", {
          session_id: this.$store.state.session_id,
          notification_ids: notification_ids,
          status: status,
        });
      }
    },
  },
};
</script>

<style scoped>
.feed-container {
  width: 100vw;
  max-width: 1000px;
}
.na-message {
  position: fixed;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  padding: 16px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: center;
  cursor: none;
}
</style>