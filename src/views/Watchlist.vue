<template>
  <div class="feed-container">
    <Feed
      v-if="!profileClosed && !noWatchlistFound"
      parent="watchlist"
      :userType="store.user.id == userId ? 'self' : 'other'"
      :userName="userName"
      @update-profile="updateProfileStatus('public')"
      v-on="$listeners"
    />
    <div v-else class="na-message">
      {{
        store.user.id != userId
          ? profileClosed
            ? userName.split(" ")[0] + "'s profile is private."
            : userName.split(" ")[0] + " hasn't added any movies or shows."
          : "Please add some movies & shows to your watchlist."
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
      noWatchlistFound: false,
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

    if (this.$store.state.feed.watchlist.contents.length) {
      if (
        this.$store.state.feed.watchlist.contents[0].creator_id != this.userId
      ) {
        this.fetchWatchlist([]);
      } else {
        this.userName = this.$store.state.feed.watchlist.contents[0].creator_name;
      }
    }

    if (
      self.$store.state.feed.watchlist.contents.length == 0 &&
      !self.$store.state.feed.watchlist.fetching
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
            self.fetchWatchlist([]);
          });
      } else {
        self.fetchWatchlist([]);
      }
    }
  },
  methods: {
    fetchWatchlist(fetchedWatchlistItems) {
      var self = this;

      if (fetchedWatchlistItems.length == 0) {
        this.resetWatchlistStore();
      }

      if (fetchedWatchlistItems.length) {
        self.$store.state.feed.watchlist.fetching_incremental = true;
      } else {
        self.$store.state.feed.watchlist.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "user_watchlist", {
          session_id: self.$store.state.session_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
          user_id: self.userId,
          user_name: self.userUrlName,
          fetched_contents: fetchedWatchlistItems,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            self.userName = response.data.user_name;

            if (response.data.profile_status == "open") {
              if (fetchedWatchlistItems.length) {
                self.$store.state.feed.watchlist.contents.push(
                  ...response.data.watchlist
                );
                if (self.$route.path.includes("/watchlist/")) {
                  self.$store.state.feed_filters.apply_filters_wo_reset = true;
                } else if (
                  self.store.feed.watchlist.feed_list.length <
                  self.$store.state.feed.defaultListSize
                ) {
                  self.store.feed.watchlist.apply_filters_on_create = true;
                }
              } else {
                self.$store.state.feed.watchlist.contents =
                  response.data.watchlist;
                self.store.feed.watchlist.feed_list = self.$store.state.feed.watchlist.contents.slice(
                  0,
                  self.$store.state.feed.defaultListSize
                );
                if (
                  response.data.total_watchlist_items >
                  response.data.watchlist.length
                ) {
                  self.fetchWatchlist(
                    response.data.watchlist.map((content) => content.content_id)
                  );
                }

                if (self.$route.path.includes("/watchlist/")) {
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
            self.noWatchlistFound = true;
          }

          if (fetchedWatchlistItems.length) {
            self.$store.state.feed.watchlist.fetching_incremental = false;
          } else {
            self.$store.state.feed.watchlist.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedWatchlistItems.length) {
            self.$store.state.feed.watchlist.fetching_incremental = false;
          } else {
            self.$store.state.feed.watchlist.fetching = false;
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
    resetWatchlistStore() {
      this.store.feed.watchlist.contents = [];
      this.store.feed.watchlist.apply_filters_on_create = false;
      this.store.feed.watchlist.element_heights = {};
      this.store.feed.watchlist.see_more_elements = [];
      this.store.feed.watchlist.element_comments = {};
      this.store.feed.watchlist.feed_list = [];
      this.store.feed.watchlist.fetching = false;
      this.store.feed.watchlist.fetching_incremental = false;
      this.store.feed.watchlist.content_type_tab = ["movie", "tv"];
      this.store.feed.watchlist.discover_type_tab = [
        "community",
        "friends",
        "flibo",
        "self",
      ];
      this.store.feed.watchlist.platforms = [];
      this.store.feed.watchlist.genres = [];
      this.store.feed.watchlist.padding_top = 0;
      this.store.feed.watchlist.padding_bottom = 0;
      this.store.feed.watchlist.scroll_position = 0;
      this.store.feed.watchlist.observer_current_index = 0;
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