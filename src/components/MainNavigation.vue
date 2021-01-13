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
      v-if="
        this.$store.state.session_id
          ? !RegExp(/^\/(review|request|suggest|activity|list)\/.*$/).test(
              $route.path
            )
          : true
      "
    >
      <nav v-if="this.$store.state.session_id">
        <div
          class="main-icon"
          v-bind:class="{ active: isDiscover && !promptPost }"
          @click="GoToDiscover"
        >
          <img
            class="discover"
            :src="
              isDiscover
                ? require('./../images/home-icon-filled.svg')
                : require('./../images/home-icon.svg')
            "
            alt="home-icon"
          />
        </div>

        <div
          class="main-icon"
          v-bind:class="{ active: isSearch && !promptPost }"
          @click="GoToSearch"
        >
          <img
            class="search"
            :src="
              isSearch
                ? require('./../images/search-icon-thicker.svg')
                : require('./../images/search-icon.svg')
            "
            alt="search-icon"
          />
        </div>

        <div
          class="main-icon"
          v-bind:class="{ active: promptPost }"
          @click="promptPost = true"
        >
          <img
            class="post"
            :src="require('./../images/plus.svg')"
            alt="post-icon"
          />
        </div>

        <div
          class="main-icon"
          v-bind:class="{ active: isRate && !promptPost }"
          @click="GoToRate"
        >
          <img
            class="rate"
            :src="
              isRate
                ? require('./../images/heart-filled.svg')
                : require('./../images/heart.svg')
            "
            alt="rate-icon"
          />
        </div>

        <div
          class="main-icon profile"
          v-bind:class="{ active: isProfile && !promptPost }"
          @click="GoToUserProfile"
        >
          <div
            class="pp-cropper"
            :style="
              isProfile
                ? 'border: solid 2px #333;width: 34px;height: 33px;'
                : ''
            "
          >
            <img
              class="profile-picture"
              v-bind:src="store.user.picture"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
            />
          </div>
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
        <span> Google Play </span>
      </div>

      <div
        :class="is_mobile ? 'ios' : 'desktop-ios'"
        @click="goToApp('/')"
        v-if="!this.$store.state.session_id & !this.is_policy_page"
      >
        <div :class="is_mobile ? 'ios-icon' : 'desktop-ios-icon'" />
        <span> iOS (M-Site) </span>
      </div>
    </div>

    <CreatePostPrompt v-if="promptPost" @close="promptPost = false" />
    <div
      class="post-prompt-bg"
      v-if="promptPost"
      @click="promptPost = false"
    ></div>
  </div>
</template>

<script>
import CreatePostPrompt from "./molecular/CreatePostPrompt";

export default {
  name: "App",
  components: {
    CreatePostPrompt,
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
      isProfile: false,
      is_policy_page: false,
      promptPost: false,
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
    router_path: function () {
      return this.$route.path;
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
      this.$router.push("/rate");
      this.isRate = true;
      this.isSearch = false;
      this.isDiscover = false;
      this.isProfile = false;
    },
    GoToDiscover() {
      this.$router.push("/discover");
      this.isRate = false;
      this.isSearch = false;
      this.isDiscover = true;
      this.isProfile = false;
      this.$emit("update-api-counter", { api: "home_button" });
    },
    GoToUserProfile() {
      this.$router.push(
        "/profile/" +
          this.$store.state.user.id +
          "/" +
          this.$store.state.user.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
      this.isRate = false;
      this.isSearch = false;
      this.isDiscover = false;
      this.isProfile = true;
      this.$emit("update-api-counter", { api: "profile" });
    },
    GoToSearch() {
      this.$router.push("/search");
      this.isRate = false;
      this.isSearch = true;
      this.isDiscover = false;
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
      if (this.store.letNavAutoHide) {
        this.showNavbar = currentScrollPosition < this.lastScrollPosition;
      } else {
        this.showNavbar = false;
      }
      this.lastScrollPosition = currentScrollPosition;
    },
    getNumFromStyle: (numStr) => Number(numStr.substring(0, numStr.length - 2)),
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
  width: 30px;
  height: 30px;
  top: 0px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
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
.main-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
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
  align-items: stretch;
  justify-content: space-around;
  height: 50px;
}
.main-icon {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  width: 50px;
}
.main-icon .rate {
  width: 29px;
}
.main-icon .search {
  width: 27px;
}
.main-icon .post {
  width: 29px;
}
.main-icon .discover {
  width: 26px;
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
.post-prompt-bg {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 1000000;
  animation: 0.2s ease-out 0s 1 load;
}
@keyframes load {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
