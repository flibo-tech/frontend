<template>
  <div class="feed-container">
    <Feed
      v-if="!profileClosed && !noRatingsFound"
      parent="ratings"
      :userType="store.user.id == userId ? 'self' : 'other'"
      :userName="userName"
      @update-profile="updateProfileStatus('public')"
      @prompt-reset-ratings="resetRatingsBanner = true"
      v-on="$listeners"
    />

    <div v-else class="na-message">
      {{
        store.user.id != userId
          ? profileClosed
            ? userName.split(" ")[0] + "'s profile is private."
            : userName.split(" ")[0] + " hasn't rated any movies or shows."
          : "Please rate some movies & shows to get personalized suggestions."
      }}
    </div>

    <div
      class="reset-prompted-box"
      v-if="resetRatingsBanner && store.user.id == userId"
    >
      <p style="font-size: 20px; white-space: nowrap; margin-bottom: 24px">
        Reset all your ratings?
      </p>

      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 50%;
        "
      >
        <Button
          buttonType="secondary"
          text="Cancel"
          @clicked="resetRatingsBanner = false"
        />

        <Button
          buttonType="primary"
          text="Reset"
          :capitalize="false"
          :loading="true"
          @clicked="resetRatings"
        />
      </div>
    </div>

    <div
      v-if="resetRatingsBanner"
      class="modal-bg"
      @click="resetRatingsBanner = false"
    ></div>
  </div>
</template>

<script>
import axios from "axios";
import Feed from "./../components/molecular/Feed";
import Button from "./../components/atomic/Button";

export default {
  name: "app",
  components: {
    Feed,
    Button,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      profileClosed: false,
      noRatingsFound: false,
      userId: null,
      userName: null,
      userUrlName: null,
      resetRatingsBanner: false,
    };
  },
  created() {
    var self = this;
    this.$store.state.current_path = this.$route.path;
    this.userId = parseInt(this.$route.params.user_id);
    this.userUrlName = this.$route.params.user_name;

    if (this.$store.state.feed.ratings.contents.length) {
      if (
        this.$store.state.feed.ratings.contents[0].creator_id != this.userId
      ) {
        this.fetchRatings([]);
      } else {
        this.userName = this.$store.state.feed.ratings.contents[0].creator_name;
      }
    }

    if (
      self.$store.state.feed.ratings.contents.length == 0 &&
      !self.$store.state.feed.ratings.fetching
    ) {
      if (
        this.store.user.profile.country == null &&
        this.store.guest_country == null
      ) {
        axios
          .get("https://ipinfo.io/?token=a354c067e1fef5")
          .then(function (response) {
            if ([200].includes(response.status)) {
              var country_code = response.data.country;
              if (
                Object.keys(self.$store.state.country_mappings).includes(
                  country_code
                )
              ) {
                self.store.guest_country =
                  self.$store.state.country_mappings[response.data.country];
              }
            }
            self.fetchRatings([]);
          });
      } else {
        self.fetchRatings([]);
      }
    }
  },
  methods: {
    fetchRatings(fetchedRatings) {
      var self = this;

      if (fetchedRatings.length == 0) {
        this.resetRatingsStore();
      }

      if (fetchedRatings.length) {
        self.$store.state.feed.ratings.fetching_incremental = true;
      } else {
        self.$store.state.feed.ratings.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "user_ratings", {
          session_id: self.$store.state.session_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
          user_id: self.userId,
          user_name: self.userUrlName,
          fetched_contents: fetchedRatings,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            self.userName = response.data.user_name;

            if (response.data.profile_status == "open") {
              if (fetchedRatings.length) {
                self.$store.state.feed.ratings.contents.push(
                  ...response.data.ratings
                );
                if (self.$route.path.includes("/ratings/")) {
                  self.$store.state.feed_filters.apply_filters_wo_reset = true;
                } else if (
                  self.store.feed.ratings.feed_list.length <
                  self.$store.state.feed.defaultListSize
                ) {
                  self.store.feed.ratings.apply_filters_on_create = true;
                }
              } else {
                self.$store.state.feed.ratings.contents = response.data.ratings;
                self.store.feed.ratings.feed_list = self.$store.state.feed.ratings.contents.slice(
                  0,
                  self.$store.state.feed.defaultListSize
                );
                if (response.data.total_ratings > response.data.ratings.length)
                  self.fetchRatings(
                    response.data.ratings.map((content) => content.content_id)
                  );

                if (self.$route.path.includes("/ratings/")) {
                  self.$nextTick(function () {
                    self.$store.state.feed.update_dom = true;
                  });
                }
              }
            } else {
              self.profileClosed = true;
            }
          } else if ([204].includes(response.status)) {
            self.userName = response.data.user_name;
            self.noRatingsFound = true;
          }

          if (fetchedRatings.length) {
            self.$store.state.feed.ratings.fetching_incremental = false;
          } else {
            self.$store.state.feed.ratings.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedRatings.length) {
            self.$store.state.feed.ratings.fetching_incremental = false;
          } else {
            self.$store.state.feed.ratings.fetching = false;
          }
        });
    },
    updateProfileStatus(profile_status) {
      var self = this;
      this.$store.state.user.profile.profile_status = profile_status;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          profile_status: profile_status,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
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
    resetRatings() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "reset_ratings", {
          session_id: self.$store.state.session_id,
        })
        .then(function (response) {
          self.resetRatingsBanner = false;
          if ([200].includes(response.status)) {
            self.$store.state.user.profile.contents_rated = [];
            self.$router.push(
              "/profile/" +
                self.$store.state.user.id +
                "/" +
                self.$store.state.user.name
                  .replace(/[^a-z0-9]+/gi, "-")
                  .toLowerCase()
            );
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          // self.resetRatingsBanner = false;
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
    resetRatingsStore() {
      this.store.feed.ratings.contents = [];
      this.store.feed.ratings.apply_filters_on_create = false;
      this.store.feed.ratings.element_heights = {};
      this.store.feed.ratings.see_more_elements = [];
      this.store.feed.ratings.element_comments = {};
      this.store.feed.ratings.feed_list = [];
      this.store.feed.ratings.fetching = false;
      this.store.feed.ratings.fetching_incremental = false;
      this.store.feed.ratings.content_type_tab = ["movie", "tv"];
      this.store.feed.ratings.discover_type_tab = [
        "community",
        "friends",
        "flibo",
        "self",
      ];
      this.store.feed.ratings.platforms = [];
      this.store.feed.ratings.genres = [];
      this.store.feed.ratings.rating_tab = [1, 2, 3];
      this.store.feed.ratings.padding_top = 0;
      this.store.feed.ratings.padding_bottom = 0;
      this.store.feed.ratings.scroll_position = 0;
      this.store.feed.ratings.observer_current_index = 0;
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
.modal-bg {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
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
.reset-prompted-box {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  width: 90vw;
  max-width: 500px;
  z-index: 100001;
  animation: 0.2s ease-out 0s 1 load;
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
}
</style>