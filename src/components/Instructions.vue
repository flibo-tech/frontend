<template>
  <div
    :class="
      is_mobile ? 'instructions-container' : 'desktop-instructions-container'
    "
    :style="page < 4 ? 'background-color:#ffffff;' : ''"
  >
    <div v-if="page == 1" class="main-text" style="color: #333333;">
      <h1>Welcome, {{ store.user.name.split(" ")[0] }}!</h1>
      <p>
        Swipe, Discover & Watch
      </p>
    </div>

    <h1
      v-if="page == 2"
      style="top: 3vh;
                   position: fixed;
                   width: 100%;"
    >
      Select your country
    </h1>
    <div v-if="page == 2" class="countries" style="height: 70vh;">
      <label
        :class="is_mobile ? 'country' : 'desktop-country'"
        :style="
          store.user.profile.country == item.country_name
            ? 'background-color: rgba(203, 212, 247, 0.75);'
            : ''
        "
        v-for="(item, index) in store.countries"
        @click="saveCountry"
      >
        <input
          type="radio"
          v-bind:value="item.country_name"
          v-model="store.user.profile.country"
          class="country-checkbox-input"
        />
        <span class="country-checkbox-abled" />
        <div class="country-flag">
          <img :src="item.country_flag" class="country-flag-pp" />
        </div>

        <h5 class="country-name">
          {{ item.country_name }}
        </h5>
      </label>
    </div>

    <h1
      v-if="page == 3"
      style="top: 3vh;
                   position: fixed;
                   width: 100%;"
    >
      Select your platforms
    </h1>
    <div v-if="page == 3" class="countries">
      <label
        :class="is_mobile ? 'country' : 'desktop-country'"
        v-for="(item, index) in this.platforms"
        :style="
          store.user.profile.platforms.includes(item.platform_name)
            ? 'background-color: rgba(203, 212, 247, 0.75);'
            : ''
        "
      >
        <input
          type="checkbox"
          v-bind:value="item.platform_name"
          v-model="store.user.profile.platforms"
          class="country-checkbox-input"
        />
        <span class="country-checkbox-abled" style="border-radius: 5px;" />
        <div class="country-flag" style="border-radius: 5px;">
          <img :src="item.platform_link" class="country-flag-pp" />
        </div>

        <h5 class="country-name">
          {{ item.platform_name }}
        </h5>
      </label>
    </div>
    <div
      v-if="page == 3"
      class="signup-platforms-buttons"
      :style="is_mobile ? '' : 'display: flex;align-items: center;bottom: 20%;'"
    >
      <span
        :class="
          is_mobile
            ? 'signup-platforms-back-button'
            : 'desktop-signup-platforms-back-button'
        "
        @click="page = page - 1"
      >
        <
      </span>
      <span
        :class="
          is_mobile
            ? 'signup-platforms-next-button'
            : 'desktop-signup-platforms-next-button'
        "
        :style="
          store.user.profile.platforms
            ? ''
            : `cursor: none;
                                                                        border: solid 2px #333333;
                                                                        background-color: #ffffff;
                                                                        color: #333333;
                                                                        padding: 8px 0px;`
        "
        @click="store.user.profile.platforms ? savePlatforms() : ''"
      >
        {{ is_mobile ? "Let's Swipe" : "Let's Go" }}
      </span>
    </div>

    <div v-if="page == 4">
      <div class="horizontal-swipe" />

      <div class="dislike-text">
        Dislike
      </div>

      <div class="like-text">
        Like
      </div>
    </div>

    <div v-if="page == 5">
      <div class="vertical-swipe" />

      <div class="love-text">
        Love it
      </div>

      <div class="not-seen-text">
        Haven't watched it
      </div>
    </div>

    <div v-if="page == 6">
      <div class="tap-to-open" />

      <div class="tap-text">
        Tap to open
      </div>
    </div>

    <div v-if="page == 7">
      <div class="rate-bar" />
      <div class="rate-bar-filled" />

      <div
        class="main-text"
        style="top: 80px;font-size: 1.4rem;font-weight: bold;"
      >
        Complete this bar to enjoy great suggestions
      </div>
    </div>

    <div class="instructions-buttons" v-if="page > 3" />

    <div v-if="page > 4" class="prev-button" @click="page = page - 1" />

    <div class="counter" v-if="page > 3">{{ page - 3 }}/4</div>

    <div
      v-if="(page > 3) & (page < 7)"
      class="next-button"
      @click="page = page + 1"
    ></div>

    <div
      class="instructions-button"
      :style="
        is_mobile
          ? ''
          : 'width: 50%;left: 50%;transform: translateX(-50%);bottom: 20%;'
      "
      v-if="page == 1"
      @click="page = page + 1"
    >
      Get Started
    </div>

    <div
      v-if="page == 7"
      class="instructions-button"
      @click="finishInstructions"
    >
      GOT IT
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      page: 1,
      store: this.$store.state,
      animation_url: "https://d2txrzi4o7g0yi.cloudfront.net/"
    };
  },
  created() {
    if (this.store.instructions_seen && this.is_mobile) {
      this.page = 4;
    }
  },
  computed: {
    platforms: function() {
      var country;
      for (country in this.store.countries) {
        if (
          this.store.user.profile.country ==
          this.store.countries[country].country_name
        ) {
          return this.store.countries[country].platforms;
        }
      }
    }
  },
  methods: {
    finishInstructions() {
      this.store.instructions_seen = true;
      this.$emit("close-instructions");
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          instructions_seen: true
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    saveCountry() {
      var self = this;
      setTimeout(self._saveCountry, 0);
    },
    _saveCountry() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          country: self.store.user.profile.country
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
      this.page = 3;
      this.store.user.profile.platforms = [];
    },
    savePlatforms() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          platforms: self.store.user.profile.platforms
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            axios
              .post(self.$store.state.api_host + "get_contents_to_rate", {
                session_id: self.$store.state.session_id,
                content_ids: null,
                rest_of_queue: null,
                visible_cards: null,
                country: self.$store.state.user.profile.country,
                signup_call: true
              })
              .then(
                response => (
                  (self.$store.state.rate.visible_cards =
                    response.data.contents),
                  (self.$store.state.rate.content_ids =
                    response.data.content_ids)
                )
              );

            axios
              .post(self.$store.state.api_host + "search_filters", {
                session_id: self.$store.state.session_id
              })
              .then(
                response => (
                  (self.$store.state.rate_filters.filters_meta.genres =
                    response.data.genres),
                  (self.$store.state.rate_filters.filters_meta.decades =
                    response.data.decades),
                  (self.$store.state.rate_filters.filters_meta.awards =
                    response.data.awards),
                  (self.$store.state.rate_filters.filters_meta.platforms =
                    response.data.platforms),
                  (self.$store.state.rate_filters.filters_meta.languages =
                    response.data.languages),
                  (self.$store.state.discover_filters.filters_meta.genres =
                    response.data.genres),
                  (self.$store.state.discover_filters.filters_meta.decades =
                    response.data.decades),
                  (self.$store.state.discover_filters.filters_meta.awards =
                    response.data.awards),
                  (self.$store.state.discover_filters.filters_meta.platforms =
                    response.data.platforms),
                  (self.$store.state.discover_filters.filters_meta.languages =
                    response.data.languages),
                  (self.$store.state.watchlist_filters.filters_meta.genres =
                    response.data.genres),
                  (self.$store.state.watchlist_filters.filters_meta.platforms =
                    response.data.platforms),
                  (self.$store.state.feed_filters.filters_meta.platforms =
                    response.data.platforms),
                    (self.$store.state.feed_filters.filters_meta.genres =
                        response.data.genres)
                )
              );
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
      if (this.is_mobile) {
        this.page = this.page + 1;
      } else {
        this.store.instructions_seen = true;
        this.$emit("close-instructions");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./../styles/mixins.scss";

.instructions-container {
  position: fixed;
  width: 100%;
  height: 110vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.85);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.desktop-instructions-container {
  position: fixed;
  width: 1000px;
  height: 110vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.85);
  display: table;
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
}
.main-text {
  position: fixed;
  left: 50%;
  top: 40vh;
  width: 95%;
  transform: translateX(-50%);
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
h1 {
  line-height: 2;
}
p {
  line-height: 1.5;
}
.dislike-text {
  position: absolute;
  left: 12%;
  margin-top: -12.5vw;
  font-size: 1.6rem;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.3;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.like-text {
  position: absolute;
  right: 12%;
  margin-top: -12.5vw;
  font-size: 1.6rem;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.3;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.horizontal-swipe {
  position: relative;
  margin-top: calc(50vh - 20vw);
  margin-left: 37.5%;
  height: 25vw;
  width: 25vw;
  background-image: url("./../images/swipe-instruction.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 100001;
}
.love-text {
  position: absolute;
  margin-left: 50%;
  margin-top: -43%;
  width: 95%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.3;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.tap-text {
  position: absolute;
  margin-left: 50%;
  margin-top: -43%;
  width: 95%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.3;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.not-seen-text {
  position: absolute;
  margin-left: 50%;
  margin-top: 8%;
  width: 95%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.3;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.vertical-swipe {
  position: relative;
  margin-top: calc(50vh - 20vw);
  margin-left: 37.5vw;
  transform: rotate(270deg);
  height: 25vw;
  width: 25vw;
  background-image: url("./../images/swipe-instruction.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 100001;
}
.tap-to-open {
  position: relative;
  margin-top: calc(50vh - 26vw);
  margin-left: 36vw;
  height: 31.5vw;
  width: 31.5vw;
  background-image: url("./../images/tap.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 100001;
}
.counter {
  position: fixed;
  text-align: center;
  font-size: 5vw;
  width: 25%;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20.2%;
  color: rgb(0, 0, 0);
  padding: 2%;
  z-index: 100001;
}
.prev-button {
  position: fixed;
  bottom: 21%;
  left: 25%;
  height: 8vw;
  width: 8vw;
  background-image: url("./../images/less-than.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 100001;
}
.next-button {
  position: fixed;
  bottom: 21%;
  right: 25%;
  height: 8vw;
  width: 8vw;
  background-image: url("./../images/greater-than.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 100001;
}
.instructions-button {
  position: fixed;
  text-align: center;
  font-size: 1.2rem;
  width: 80%;
  left: 10%;
  bottom: 10%;
  color: #ffffff;
  background-color: #3366bb;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.instructions-content-type-tabs {
  margin-top: 50px;
  width: 100%;
  background-color: #f8f8f8;
  position: fixed;
  overflow: hidden;
  padding: 5px;
  z-index: 4;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
  border-radius: 20px;
}
.instructions-content-type-tabs a {
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  padding: 6px 0px;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  font-weight: normal;
  font-size: 15px;
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
}
.instructions-content-type-tabs a.is-active {
  font-weight: bold;
}
.instructions-content-type-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
}
@media only screen and (max-width: 350px) {
  h1 {
    line-height: 1.5;
    font-size: 1.4rem;
  }
  p {
    font-size: 0.9rem;
  }
}
iframe {
  width: 100%;
  height: 100vh;
  margin-top: -10vh;
}
.instructions-buttons {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(21% - 10px);
  width: 60%;
  border-radius: 50px;
  height: calc(8vw + 20px);
  overflow: hidden;
  background-color: #ffffff;
  display: table;
  z-index: 100000;
}
.rate-bar {
  top: 50px;
  width: 100%;
  background-color: #ebebeb;
  height: 5px;
  position: fixed;
}
.rate-bar-filled {
  top: 50px;
  width: 35%;
  max-width: 100%;
  background-color: #a1a0a0;
  height: 5px;
  position: fixed;
}
.countries {
  position: fixed;
  display: inline-block;
  top: 15vh;
  overflow-y: scroll;
  height: 65vh;
  background-color: #ffffff;
  border-radius: 7px;
  transform: translateX(-50%);
}
.country {
  position: relative;
  display: block;
  vertical-align: top;
  text-align: left;
  margin-bottom: 10px;
  margin-left: 10vw;
  height: 50px;
  width: 60vw;
  border-radius: 7px;
}
.desktop-country {
  position: relative;
  display: block;
  vertical-align: top;
  text-align: left;
  margin-bottom: 10px;
  height: 50px;
  border-radius: 7px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.country-flag {
  position: relative;
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
}
.country-flag-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.countries h5 {
  position: relative;
  margin-top: -34px;
  margin-left: 75px;
  white-space: initial;
  font-size: 15px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333333;
  text-transform: capitalize;
  overflow: hidden;
}
.country input:checked ~ .country-checkbox-abled {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-image: url("./../images/checked_white.svg");
}
.desktop-country input:checked ~ .country-checkbox-abled {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-image: url("./../images/checked_white.svg");
}
.country-checkbox-abled {
  position: absolute;
  height: 50px;
  width: 50px;
  z-index: 3;
  border-radius: 50%;
}
.country-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.signup-platforms-buttons {
  position: fixed;
  width: 100%;
  bottom: 10%;
  left: 0px;
  text-align: left;
  font-size: 1.2rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  background-color: #ffffff;
  padding: 10px 15% 0px 15%;
  z-index: 10000;
}
.signup-platforms-back-button {
  position: absolute;
  width: 15%;
  border-radius: 4px;
  font-size: 33px;
  font-weight: normal;
  border: solid 2px #333333;
  background-color: #ffffff;
  color: #333333;
  text-align: center;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.desktop-signup-platforms-back-button {
  position: relative;
  width: 75px;
  margin-left: calc(50% - 172.5px);
  border-radius: 4px;
  font-size: 33px;
  font-weight: normal;
  border: solid 2px #333333;
  background-color: #ffffff;
  color: #333333;
  text-align: center;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.signup-platforms-next-button {
  float: right;
  width: 75%;
  border-radius: 4px;
  background-color: #294ed2;
  color: #ffffff;
  text-align: center;
  padding: 10px 0px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.desktop-signup-platforms-next-button {
  position: relative;
  margin-left: 20px;
  width: 250px;
  border-radius: 4px;
  background-color: #294ed2;
  color: #ffffff;
  text-align: center;
  padding: 10px 0px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
::-webkit-scrollbar {
  display: none;
}
</style>
