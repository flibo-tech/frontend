<template>
  <div :class="is_mobile ? 'settings-container' : 'desktop-settings-container'">
    <h1
      v-if="page == 2"
      :style="
        is_mobile
          ? 'top: 60px;font-size: 25px;position: fixed;width: 100%;line-height: 2;'
          : 'top: 60px;font-size: 25px;position: fixed;width: 1000px;line-height: 2;'
      "
    >
      Select your country
    </h1>
    <div
      v-if="page == 2"
      class="settings-countries"
      :style="
        is_mobile
          ? store.is_webview
            ? 'height: calc(100vh - 180px);'
            : 'height: calc(100vh - 180px);padding-bottom: 50px;'
          : 'height: calc(100vh - 260px);'
      "
    >
      <label
        :class="is_mobile ? 'settings-country' : 'desktop-settings-country'"
        :style="
          temp_country == item.country_name
            ? 'background-color: rgba(203, 212, 247, 0.75);'
            : ''
        "
        v-for="(item, index) in store.countries"
        @click="saveCountry"
      >
        <input
          type="radio"
          v-bind:value="item.country_name"
          v-model="temp_country"
          class="settings-country-checkbox-input"
        />
        <span class="settings-country-checkbox-abled" />
        <div class="settings-country-flag">
          <img :src="item.country_flag" class="settings-country-flag-pp" />
        </div>

        <h5 class="settings-country-name">
          {{ item.country_name }}
        </h5>
      </label>
    </div>

    <h1
      v-if="page == 3"
      :style="
        is_mobile
          ? 'top: 60px;font-size: 25px;position: fixed;width: 100%;line-height: 2;'
          : 'top: 60px;font-size: 25px;position: fixed;width: 1000px;line-height: 2;'
      "
    >
      Select your platforms
    </h1>
    <div
      v-if="page == 3"
      class="settings-countries"
      :style="
        is_mobile
          ? store.is_webview
            ? 'height: calc(100vh - 235px);'
            : 'height: calc(100vh - 235px);padding-bottom: 50px;'
          : 'height: calc(100vh - 260px);'
      "
    >
      <label
        :class="is_mobile ? 'settings-country' : 'desktop-settings-country'"
        v-for="(item, index) in this.platforms"
        :style="
          temp_platforms.includes(item.platform_name)
            ? 'background-color: rgba(203, 212, 247, 0.75);'
            : ''
        "
      >
        <input
          type="checkbox"
          v-bind:value="item.platform_name"
          v-model="temp_platforms"
          class="settings-country-checkbox-input"
        />
        <span
          class="settings-country-checkbox-abled"
          style="border-radius: 5px;"
        />
        <div class="settings-country-flag" style="border-radius: 5px;">
          <img :src="item.platform_link" class="settings-country-flag-pp" />
        </div>

        <h5 class="settings-country-name">
          {{ item.platform_name }}
        </h5>
      </label>
    </div>
    <div
      v-if="page == 3"
      class="settings-platforms-buttons"
      :style="is_mobile ? '' : 'display: flex;align-items: center;'"
    >
      <span
        :class="
          is_mobile
            ? 'settings-platforms-back-button'
            : 'desktop-settings-platforms-back-button'
        "
        @click="goBackToCountries"
      >
        <
      </span>
      <span
        :class="
          is_mobile
            ? 'settings-platforms-next-button'
            : 'desktop-settings-platforms-next-button'
        "
        :style="
          temp_platforms
            ? ''
            : `cursor: none;
                                                  border: solid 2px #333333;
                                                  background-color: #ffffff;
                                                  color: #333333;
                                                  padding: 8px 0px;`
        "
        @click="temp_platforms ? savePlatforms() : ''"
      >
        Save
      </span>
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
      page: 2,
      temp_country: null,
      temp_platforms: [],
      store: this.$store.state
    };
  },
  created() {
    this.temp_country = this.store.user.profile.country;
    this.temp_platforms = this.store.user.profile.platforms || [];
  },
  computed: {
    platforms: function() {
      var country;
      for (country in this.store.countries) {
        if (this.temp_country == this.store.countries[country].country_name) {
          return this.store.countries[country].platforms;
        }
      }
    }
  },
  methods: {
    goBackToCountries() {
      var self = this;
      setTimeout(self._goBackToCountries, 0);
    },
    _goBackToCountries() {
      this.page = 2;
      if (this.store.user.profile.country != this.temp_country) {
        this.temp_platforms = [];
      }
    },
    saveCountry() {
      var self = this;
      setTimeout(self._saveCountry, 0);
    },
    _saveCountry() {
      this.page = 3;
      if (this.store.user.profile.country != this.temp_country) {
        this.temp_platforms = [];
      }
    },
    savePlatforms() {
      var self = this;
      self.store.user.profile.country = self.temp_country;
      self.store.user.profile.platforms = self.temp_platforms;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          country: self.store.user.profile.country,
          platforms: self.store.user.profile.platforms
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
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
                    response.data.platforms)
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

      window.history.back();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./../styles/mixins.scss";

.settings-container {
  position: fixed;
  width: 100%;
  height: 110vh;
  overflow: hidden;
  background-color: #ffffff;
  display: table;
  top: 0%;
  left: 0%;
  z-index: 1;
}
.desktop-settings-container {
  position: fixed;
  width: 1000px;
  height: 110vh;
  overflow: hidden;
  background-color: #ffffff;
  display: table;
  top: 0%;
  left: calc(50vw - 500px);
  z-index: 1;
}
.settings-countries {
  position: fixed;
  display: inline-block;
  top: 110px;
  overflow-y: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  transform: translateX(-50%);
}
.settings-country {
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
.desktop-settings-country {
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
.settings-country-flag {
  position: relative;
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
}
.settings-country-flag-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.settings-countries h5 {
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
.settings-country input:checked ~ .settings-country-checkbox-abled {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-image: url("./../images/checked_white.svg");
}
.desktop-settings-country input:checked ~ .settings-country-checkbox-abled {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-image: url("./../images/checked_white.svg");
}
.settings-country-checkbox-abled {
  position: absolute;
  height: 50px;
  width: 50px;
  z-index: 3;
  border-radius: 50%;
}
.settings-country-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.settings-platforms-buttons {
  position: fixed;
  width: 100%;
  bottom: 55px;
  left: 0px;
  text-align: left;
  font-size: 1.2rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  background-color: #ffffff;
  padding: 10px 15% 20px 15%;
  z-index: 10000;
}
.settings-platforms-back-button {
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
.desktop-settings-platforms-back-button {
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
.settings-platforms-next-button {
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
.desktop-settings-platforms-next-button {
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
