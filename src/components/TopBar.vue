<template>
  <div
    class="top-bar"
    :style="is_mobile ? '' : 'width:1000px;box-shadow: 0 5px 8px -10px black;'"
  >
    <div
      v-if="
        this.$route.path.includes('/connections') ||
        this.$route.path.includes('/content') ||
        this.$route.path.includes('/about-us') ||
        this.$route.path.includes('/search-results') ||
        this.$route.path.includes('/settings')
      "
      class="go-back-button"
      :style="is_mobile ? '' : 'left: calc(50vw - 500px);'"
      @click="goBack"
    />

    <div
      :class="is_mobile ? 'page-name' : 'desktop-page-name'"
      :style="
        this.$route.path.includes('/connections') ||
        this.$route.path.includes('/content') ||
        this.$route.path.includes('/about-us') ||
        this.$route.path.includes('/search-results') ||
        this.$route.path.includes('/settings')
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
          : this.$route.path.includes("/watchlist")
          ? "Watchlist"
          : this.$route.path.includes("/profile/")
          ? "Profile"
          : this.$route.path.includes("/connections")
          ? "Connections"
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
          : ""
      }}
    </div>
  </div>
</template>

<script>
import { mixin as onClickOutside } from "vue-on-click-outside";
import axios from "axios";

export default {
  name: "App",
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
      if (this.store.is_webview && window.history.length == 2) {
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
.flibo-logo {
  position: fixed;
  display: block;
  right: 5%;
  width: 90px;
  height: 50px;
  background-image: url("./../images/flibo-logo-dark.svg");
  background-position: center;
  background-repeat: no-repeat;
}
</style>
