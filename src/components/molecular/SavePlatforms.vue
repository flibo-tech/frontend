<template>
  <div
    class="save-platforms-container"
    :style="is_mobile ? '' : 'width: 950px;'"
    v-if="store.user.profile.platforms == null"
  >
    <p class="save-platforms-text">
      Select your subscriptions for more personalized suggestions
    </p>

    <div class="save-platforms-items">
      <label
        class="save-platforms"
        v-for="(item, index) in meta_platforms"
        :key="index"
      >
        <input
          type="checkbox"
          v-bind:value="item.platform_name"
          v-model="temp_platforms"
          class="save-platforms-checkbox-input"
        />
        <span
          class="save-platforms-checkbox-abled"
          style="border-radius: 5px"
        />
        <div class="save-platforms-icon" style="border-radius: 5px">
          <img :src="item.platform_link" class="save-platforms-icon-pp" />
        </div>
      </label>
    </div>

    <div class="save-platforms-button">
      <Button
        buttonType="primary"
        :disabled="temp_platforms.length ? false : true"
        :loading="true"
        text="Save"
        v-on:clicked="savePlatforms(true)"
      />
    </div>

    <div class="save-platforms-button" style="margin-right: 15px">
      <Button
        buttonType="secondary"
        :loading="true"
        text="Cancel"
        v-on:clicked="savePlatforms(false)"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Button from "./../atomic/Button";

export default {
  name: "App",
  components: {
    Button,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      meta_platforms: this.$store.state.feed_filters.filters_meta.platforms,
      temp_platforms: [],
    };
  },
  methods: {
    savePlatforms(any_platforms) {
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          platforms: any_platforms ? self.temp_platforms : [],
        })
        .then(function (response) {
          self.$emit("refresh-suggestions");
          if ([200].includes(response.status)) {
            self.store.user.profile.platforms = any_platforms
              ? self.temp_platforms
              : [];
            axios
              .post(self.$store.state.api_host + "search_filters", {
                session_id: self.$store.state.session_id,
              })
              .then(
                (response) => (
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
        .catch(function (error) {
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
  },
};
</script>

<style lang="scss" scoped>
.save-platforms-container {
  position: relative;
  display: inline-block;
  width: calc(100vw - 30px);
  margin-left: 15px;
  text-align: left;
  background-color: #fff;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.07);
  padding: 16px;
  margin-bottom: 16px;
  margin-top: 8px;
  border-radius: 12px;
}
.save-platforms-text {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  white-space: normal;
}
.save-platforms {
  position: relative;
  margin-left: 5px;
  margin-right: 10px;
  border-radius: 7px;
}
.save-platforms-icon {
  position: relative;
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
}
.save-platforms-icon-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.save-platforms h5 {
  position: relative;
  white-space: initial;
  margin-top: 5px;
  text-transform: capitalize;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  color: #333333;
  text-align: center;
}
.save-platforms input:checked ~ .save-platforms-checkbox-abled {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-image: url("./../../images/checked_white.svg");
}
.save-platforms-checkbox-abled {
  position: absolute;
  height: 50px;
  width: 50px;
  z-index: 3;
  border-radius: 50%;
}
.save-platforms-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.save-platforms-items {
  display: flex;
  overflow-x: scroll;
  margin-top: 20px;
  padding: 0px 5px 0px 10px;
}
.save-platforms-button {
  width: max-content;
  margin-top: 20px;
  float: right;
}
::-webkit-scrollbar {
  display: none;
}
</style>