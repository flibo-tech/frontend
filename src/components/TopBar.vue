<template>
  <div
    class="top-bar"
    :style="is_mobile ? '' : 'width:1000px;box-shadow: 0 5px 8px -10px black;'"
  >
    <div
      v-if="
        this.$route.path.includes('/connections') ||
        this.$route.path.includes('/posts/') ||
        this.$route.path.includes('/content') ||
        this.$route.path.includes('/about-us') ||
        this.$route.path.includes('/search-results') ||
        this.$route.path.includes('/settings') ||
        this.$route.path.includes('/review/') ||
        this.$route.path.includes('/request/') ||
        this.$route.path.includes('/suggest/') ||
        this.$route.path.includes('/activity/') ||
        this.$route.path.includes('/list/') ||
        this.$route.path.includes('/ratings/') ||
        this.$route.path.includes('/watchlist/') ||
        this.$route.path == '/notifications' ||
        this.$route.path == '/suggestions'
      "
      class="go-back-button"
      :style="is_mobile ? '' : 'left: calc(50vw - 500px);'"
      @click="goBack"
    />

    <div
      :class="is_mobile ? 'page-name' : 'desktop-page-name'"
      :style="
        this.$route.path.includes('/connections') ||
        this.$route.path.includes('/posts/') ||
        this.$route.path.includes('/content') ||
        this.$route.path.includes('/about-us') ||
        this.$route.path.includes('/search-results') ||
        this.$route.path.includes('/settings') ||
        this.$route.path.includes('/review/') ||
        this.$route.path.includes('/request/') ||
        this.$route.path.includes('/suggest/') ||
        this.$route.path.includes('/activity/') ||
        this.$route.path.includes('/list/') ||
        this.$route.path.includes('/ratings/') ||
        this.$route.path.includes('/watchlist/') ||
        this.$route.path == '/notifications' ||
        this.$route.path == '/suggestions'
          ? is_mobile
            ? 'left: calc(5% + 15px);'
            : 'left: calc(50vw - 500px + 30px);'
          : ''
      "
    >
      {{
        this.$route.path.includes("/rate")
          ? "Rate"
          : this.$route.path.includes("/discover")
          ? "Discover"
          : this.$route.path.includes("/watchlist/")
          ? "Watchlist"
          : this.$route.path.includes("/profile/")
          ? "Profile"
          : this.$route.path.includes("/connections")
          ? "Connections"
          : this.$route.path.includes("/posts/")
          ? "Posts"
          : this.$route.path.includes("/content/1")
          ? "Movie"
          : this.$route.path.includes("/content/2")
          ? "TV Series"
          : this.$route.path.includes("/more")
          ? "More"
          : this.$route.path.includes("/about-us")
          ? "About Us"
          : this.$route.path.includes("/search-results")
          ? "Results"
          : this.$route.path.includes("/settings")
          ? "Settings"
          : this.$route.path.includes("/review/")
          ? "Review"
          : this.$route.path.includes("/request/")
          ? "Request"
          : this.$route.path.includes("/suggest/")
          ? "Suggestion"
          : this.$route.path.includes("/list/")
          ? "List"
          : this.$route.path.includes("/ratings/")
          ? "Ratings"
          : this.$route.path.includes("/activity/")
          ? "Activity"
          : this.$route.path == "/notifications"
          ? "Notifications"
          : this.$route.path == "/suggestions"
          ? "Suggestions"
          : ""
      }}
    </div>

    <button
      class="top-bar-search-icon"
      v-if="store.session_id == null"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px);'"
      @click="$router.push('/search')"
      type="button"
    ></button>

    <div
      v-else-if="!['/notifications', '/connections'].includes($route.path)"
      class="top-bar-notification"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px);'"
      @click="$router.push('/notifications')"
    >
      <Button buttonType="iconOnly" icon="notification" :size="26" />

      <button
        v-if="store.notifications.notifications"
        class="new-notification"
      />
    </div>

    <SpeechRecognition
      v-if="!['/connections'].includes($route.path)"
      class="topbar-mic"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px + 30px);'"
    />
  </div>
</template>

<script>
import { mixin as onClickOutside } from "vue-on-click-outside";
import Button from "./../components/atomic/Button";
import SpeechRecognition from "./../components/molecular/SpeechRecognition";
import axios from "axios";

export default {
  name: "TopBar",
  components: {
    Button,
    SpeechRecognition,
  },

  mixins: [onClickOutside],
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      window_width: window.innerWidth,
      filters_meta: this.$store.state.discover_filters.filters_meta,
      filters_applied: this.$store.state.discover_filters.filters_applied,
    };
  },
  methods: {
    goBack() {
      if (window.history.length <= 2) {
        this.$router.push("/discover");
      } else {
        window.history.back();
      }
    },
    goToLandingPage() {
      window.location = "/";
    },
  },
};
</script>

<style lang="scss">
.top-bar {
  position: fixed;
  width: 100%;
  top: 0%;
  background-color: #ffffff;
  z-index: 10000;
  height: 50px;
  border-bottom: 1px solid #ebebeb;
}
.page-name {
  position: fixed;
  font-size: 27px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.23;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  left: 5%;
  top: 8px;
  width: 65%;
}
.desktop-page-name {
  position: fixed;
  font-size: 27px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.23;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  top: 8px;
}
.go-back-button {
  position: fixed;
  left: 2%;
  top: 14px;
  height: 22px;
  width: 22px;
  background-image: url("./../images/back-button.svg");
  background-size: 100% 100%;
  background-color: #ffffff;
  border: none;
  outline: 0px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.top-bar-search-icon {
  position: fixed;
  display: block;
  right: 0;
  top: 0;
  height: 50px;
  width: 50px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/search-icon.svg");
  background-size: 50% 50%;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 100000;
}
.top-bar-notification {
  position: fixed;
  right: 5%;
  top: 12px;
  transform: rotate(-30deg);
  z-index: 100000;
}
.new-notification {
  position: absolute;
  right: -12px;
  top: 5px;
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background-color: #f26b6b;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.topbar-mic {
  position: fixed;
  top: -1px;
  right: calc(5% + 30px);
}
</style>
