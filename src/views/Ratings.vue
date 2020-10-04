<template>
  <div class="feed-container">
    <Feed
      v-if="!profileClosed && !noRatingsFound"
      parent="ratings"
      :userType="store.user.id == userId ? 'self' : 'other'"
      :userName="userName"
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
      profileClosed: false,
      noRatingsFound: false,
      userId: null,
      userName: null,
      userUrlName: null,
    };
  },
  created() {
    var self = this;
    this.$store.state.current_path = this.$route.path;
    this.userId = parseInt(this.$route.params.user_id);
    this.userUrlName = this.$route.params.user_name;

    if (self.$store.state.feed.ratings.contents.length == 0) {
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

      if (fetchedRatings.length) {
        self.$store.state.feed.ratings.fetching_incremental = true;
      } else {
        self.$store.state.feed.ratings.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "user_ratings", {
          session_id: self.$store.state.session_id,
          country: self.store.guest_country,
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