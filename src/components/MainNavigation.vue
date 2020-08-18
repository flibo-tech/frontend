<template>
  <div>
    <div
      class="main-navigation"
      :style="
        is_mobile
          ? ''
          : this.$store.state.session_id
          ? 'width: 1000px;left: calc(50vw - 500px);box-shadow: black 0px -7px 8px -10px;'
          : 'width: 1000px;left: calc(50vw - 500px);box-shadow: black 0px -7px 8px -10px;display: flex;align-items: center;'
      "
      :class="{ 'main-navigation--hidden': !showNavbar }"
    >
      <nav v-if="this.$store.state.session_id">
        <div
          class="main-icon discover"
          v-bind:class="{ active: isDiscover }"
          @click="GoToDiscover"
        >
          <transition
            appear
            :enter-active-class="
              store.suggestions.rate_counter_all > 25
                ? 'animated fadeIn'
                : 'animated fadeIn'
            "
            leave-active-class="animated fadeOut"
          >
            <button
              v-if="
                isSuggNotification && store.suggestions.rate_counter_all >= 25
              "
              class="nav-suggestions-notification"
              :style="is_mobile ? '' : 'right: 70px;'"
            />
          </transition>
          <span class="home-text">
            Home
          </span>
        </div>

        <div
          class="main-icon search"
          v-bind:class="{ active: isSearch }"
          @click="GoToSearch"
        >
          <span class="search-text">
            Search
          </span>
        </div>

        <div
          class="main-icon rate"
          v-bind:class="{ active: isRate }"
          @click="GoToRate"
        >
          <span class="rate-text">
            Rate
          </span>
        </div>

        <div
          class="main-icon watchlist"
          v-bind:class="{ active: isWatchlist }"
          @click="GoToWatchlist"
        >
          <span class="watchlist-text">
            Watchlist
          </span>
        </div>

        <div
          class="main-icon profile"
          v-bind:class="{ active: isProfile }"
          @click="GoToUserProfile"
        >
          <div class="pp-cropper">
            <img
              class="profile-picture"
              v-bind:src="store.user.picture"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
            />
          </div>
          <button
            v-if="store.notifications.friends | store.notifications.requests"
            class="nav-suggestions-notification"
            :style="is_mobile ? '' : 'right: 70px;'"
          />
          <span class="profile-text">
            Profile
          </span>
        </div>
      </nav>

      <div
        :class="is_mobile ? 'google-play' : 'desktop-google-play'"
        @click="
          goToApp(
            'https://play.google.com/store/apps/details?id=com.pivot.flibo'
          )
        "
        v-if="!this.$store.state.session_id & !this.is_policy_page"
      >
        <div
          :class="is_mobile ? 'google-play-icon' : 'desktop-google-play-icon'"
        />
        <span>
          Google Play
        </span>
      </div>

      <div
        :class="is_mobile ? 'ios' : 'desktop-ios'"
        @click="goToApp('/')"
        v-if="!this.$store.state.session_id & !this.is_policy_page"
      >
        <div :class="is_mobile ? 'ios-icon' : 'desktop-ios-icon'" />
        <span>
          iOS (M-Site)
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from "./SearchBar";

export default {
  name: "App",
  components: {
    SearchBar,
  },
  props: {
    active: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      showNavbar: true,
      lastScrollPosition: 0,
      store: this.$store.state,
      isRate: false,
      isSearch: false,
      isDiscover: false,
      isWatchlist: false,
      isProfile: false,
      is_policy_page: false,
    };
  },
  created() {
    var current_path = this.$route.path;
    this.is_policy_page = current_path == "/privacy-policy";
    if (this.$route.path == "/rate") {
      this.isRate = true;
    } else {
      this.isRate = false;
    }

    if (this.$route.path == "/discover") {
      this.isDiscover = true;
    } else {
      this.isDiscover = false;
    }

    if (this.$route.path == "/watchlist") {
      this.isWatchlist = true;
    } else {
      this.isWatchlist = false;
    }

    if (this.$route.path == "/more") {
      this.isProfile = true;
    } else {
      this.isProfile = false;
    }

    if (this.$route.path == "/search") {
      this.isSearch = true;
    } else {
      this.isSearch = false;
    }
  },
  computed: {
    my_active: function () {
      return this.active;
    },
    isSuggNotification: function () {
      return this.$store.state.notifications.suggestions;
    },
    router_path: function () {
      return this.$route.path;
    },
    discover_type_tab_string() {
      return JSON.stringify(
        this.$store.state.suggestions.discover_type_tab
      ).replace(/['"]+/g, "");
    },
    toggle_search() {
      return this.$store.state.toggle_search;
    },
  },
  watch: {
    router_path: {
      handler: function (path) {
        if (path == "/rate") {
          this.isRate = true;
        } else {
          this.isRate = false;
        }

        if (path == "/discover") {
          this.isDiscover = true;
        } else {
          this.isDiscover = false;
        }

        if (path == "/watchlist") {
          this.isWatchlist = true;
        } else {
          this.isWatchlist = false;
        }

        if (
          path.startsWith("/profile/" + this.$store.state.user.id) |
          (path == "/connections")
        ) {
          this.isProfile = true;
        } else {
          this.isProfile = false;
        }

        if (["/search", "/search-results"].includes(path)) {
          this.isSearch = true;
        } else {
          this.isSearch = false;
        }
      },
    },
  },
  methods: {
    goToApp(app_location) {
      window.open(app_location);
    },
    logOut() {
      window.location =
        this.$store.state.login_host +
        "logout?session_id=" +
        this.$store.state.session_id;
      this.$store.state.session_id = null;
      this.$emit("logging-out");
    },
    GoToRate() {
      this.updateFeedScroll();
      this.$router.push("/rate");
      this.isRate = true;
      this.isSearch = false;
      this.isDiscover = false;
      this.isWatchlist = false;
      this.isProfile = false;
    },
    GoToDiscover() {
      this.updateFeedScroll();
      this.$router.push("/discover");
      this.isRate = false;
      this.isSearch = false;
      this.isDiscover = true;
      this.isWatchlist = false;
      this.isProfile = false;
      this.$emit("update-api-counter", { api: "home_button" });
    },
    GoToWatchlist() {
      this.updateFeedScroll();
      this.$router.push("/watchlist");
      this.isRate = false;
      this.isSearch = false;
      this.isDiscover = false;
      this.isWatchlist = true;
      this.isProfile = false;
      this.$emit("update-api-counter", { api: "watchlist" });
    },
    GoToUserProfile() {
      this.updateFeedScroll();
      this.$router.push(
        "/profile/" +
          this.$store.state.user.id +
          "/" +
          this.$store.state.user.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
      this.isRate = false;
      this.isSearch = false;
      this.isDiscover = false;
      this.isWatchlist = false;
      this.isProfile = true;
      this.$emit("update-api-counter", { api: "profile" });
    },
    GoToSearch() {
      this.updateFeedScroll();
      this.$router.push("/search");
      this.isRate = false;
      this.isSearch = true;
      this.isDiscover = false;
      this.isWatchlist = false;
      this.isProfile = false;
    },
    onScroll() {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition < 0) {
        return;
      }
      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - this.lastScrollPosition) < 0) {
        return;
      }
      this.showNavbar = currentScrollPosition < this.lastScrollPosition;
      this.lastScrollPosition = currentScrollPosition;
    },
    getNumFromStyle: (numStr) => Number(numStr.substring(0, numStr.length - 2)),
    updateFeedScroll() {
      var parent = null;
      if (this.$route.path == "/discover") {
        parent = "home";
      } else if (this.$route.path == "/search-results") {
        parent = "search_results";
      } else if (this.$route.path == "/watchlist") {
        parent = "watchlist";
      }
      if (parent) {
        const container = document.querySelector(".feed-cards-container");
        if (container != null) {
          eval(
            "this.$store.state.feed." +
              parent +
              ".padding_top = this.getNumFromStyle(container.style.paddingTop)"
          );
          eval(
            "this.$store.state.feed." +
              parent +
              ".padding_bottom = this.getNumFromStyle(container.style.paddingBottom)"
          );
        }

        eval(
          "this.$store.state.feed." +
            parent +
            ".scroll_position = window.scrollY"
        );
      }
    },
  },
  mounted() {
    window.addEventListener("scroll", this.onScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  },
};
</script>

<style lang="scss" scoped>
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.shake {
  animation: shake 0.6s;
}
.top-bar {
  position: fixed;
  width: 100%;
  background-color: rgb(233, 243, 248);
  z-index: 10000;
  height: 35px;
  border-bottom: 2px solid rgb(143, 179, 245);
}
.pp-cropper {
  width: 35px;
  height: 35px;
  top: 0px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  border: 0.5px solid #f3f3f3;
  z-index: 2;
}
.profile-picture {
  display: inline;
  margin: 0 auto;
  width: 100%;
}
.header-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}
h3 {
  display: flex;
  align-items: center;
  margin-left: 10%;
  justify-content: center;
  width: 100%;
  font-size: 16px;
}
button {
  margin-left: 10px;
}
.nav-suggestions-notification {
  position: absolute;
  top: 12px;
  right: 18%;
  height: 7px;
  width: 7px;
  background-image: url("./../images/red_dot.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.main-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 55px;
  background-color: #ffffff;
  border-top: 1px solid #ebebeb;
  z-index: 20000;
  text-align: center;
  transform: translate3d(0, 0, 0);
  transition: 0.5s all ease-out;
}
.main-navigation.main-navigation--hidden {
  transform: translate3d(0, 200%, 0);
}
.main-navigation nav {
  display: flex;
  height: 55px;
}
.main-icon {
  flex-grow: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.main-icon.notification::before {
  display: inline-block;
  content: "";
  position: absolute;
  top: 12px;
  right: 18%;
  width: 7px;
  height: 7px;
  background-color: #f1300e;
  border-radius: 20px;
}
.main-icon.rate {
  background-image: url("./../images/heart.svg");
  background-size: 31px;
  top: -8px;
}
.main-icon.rate.active span {
  font-weight: 900;
  color: black;
}
.main-icon.search {
  background-image: url("./../images/search-icon.svg");
  background-size: 28px;
  top: -8px;
}
.main-icon.search.active span {
  font-weight: 900;
  color: black;
}
.main-icon.discover {
  background-image: url("./../images/home-icon.svg");
  background-size: 28px;
  top: -8px;
}
.main-icon.discover.active span {
  font-weight: 900;
  color: black;
}
.main-icon.watchlist {
  background-image: url("./../images/watchlist-icon.svg");
  background-size: 24px;
  top: -8px;
}
.main-icon.watchlist.active span {
  font-weight: 900;
  color: black;
}
.main-icon.profile {
  width: 0%;
  top: -8px;
}
.main-icon.profile.active span {
  font-weight: 900;
  color: black;
}
.search-page {
  position: fixed;
  top: 0%;
  width: 100%;
  height: 100vh;
  background-color: #fffffffa;
  z-index: 10000;
}
.search-page .search-box {
  width: 260%;
}
.home-text {
  position: absolute;
  bottom: -6px;
  width: 100%;
  font-size: 11px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: center;
  color: #575757;
}
.search-text {
  position: absolute;
  bottom: -6px;
  width: 100%;
  font-size: 11px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: center;
  color: #575757;
}
.rate-text {
  position: absolute;
  bottom: -6px;
  width: 100%;
  font-size: 11px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: center;
  color: #575757;
}
.watchlist-text {
  position: absolute;
  bottom: -6px;
  width: 100%;
  font-size: 11px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: center;
  color: #575757;
}
.profile-text {
  position: absolute;
  bottom: -6px;
  width: 100%;
  font-size: 11px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: center;
  color: #575757;
}
.google-play {
  position: fixed;
  width: 50%;
  height: 55px;
  left: 0%;
  text-align: initial;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.desktop-google-play {
  position: relative;
  width: 50%;
  height: 55px;
  text-align: initial;
  cursor: pointer;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.google-play-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  margin-left: 15%;
  margin-top: 7px;
  background-image: url("./../images/google-play-icon.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.desktop-google-play-icon {
  position: relative;
  width: 40px;
  height: 40px;
  background-image: url("./../images/google-play-icon.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  margin-left: 37%;
}
.google-play span {
  position: absolute;
  margin-top: 9px;
  margin-left: calc(15% + 46px);
  transform: translateY(50%);
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.desktop-google-play span {
  position: relative;
  margin-left: 10px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.ios {
  position: fixed;
  width: 50%;
  height: 55px;
  right: 0%;
  text-align: initial;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.desktop-ios {
  position: relative;
  width: 50%;
  height: 55px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.ios-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  margin-left: 15%;
  margin-top: 5px;
  background-image: url("./../images/apple-icon.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.desktop-ios-icon {
  position: relative;
  width: 40px;
  height: 40px;
  margin-left: 37%;
  background-image: url("./../images/apple-icon.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.ios span {
  position: absolute;
  margin-top: 9px;
  margin-left: calc(15% + 46px);
  transform: translateY(50%);
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.desktop-ios span {
  position: relative;
  margin-top: 2px;
  margin-left: 10px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
</style>
