<template>
  <div v-if="this.$store.state.server_down" class="browser-alert">
    <h1>
      Please give us a couple of hours to upgrade our servers.
    </h1>
    <br />
    <h1>
      We'll be back by 7:30 PM GMT.
    </h1>
    <br />
    <h2>
      BTW we've never seen a pigeon sitting on a tree. Have you?
    </h2>
  </div>

  <div
    id="app"
    v-else-if="this.$store.state.session_id"
    :style="
      is_mobile
        ? 'width:100%;'
        : 'width: 1000px;margin-left: calc(50vw - 500px);'
    "
  >
    <TopBar
      v-if="
        !this.is_search_page &&
        !this.is_user_search_page &&
        !this.is_onboarding &&
        !this.is_landing_page
      "
    />

    <router-view
      @update-friends="updateFriendsPage"
      @logging-out="loggingOut"
      @refresh-feed="refreshDiscoverPage"
      @update-api-counter="updateApiCounter"
      @open-content-page="openContentPage"
      @submit-rating="submitRating"
      @add-to-watchlist="addToWatchlist"
      @open-uesr-profile="goToProfile"
      @reset-feed-page="resetFeedPage"
    />

    <MainNavigation
      v-if="!this.is_onboarding && !this.is_landing_page"
      @update-api-counter="updateApiCounter"
    />
  </div>

  <!-- <div v-else-if="(this.$store.state.session_id && !this.is_mobile)
                  ||
                  (!this.$store.state.session_id && this.is_content_page && !this.is_mobile)
                  ||
                  (!this.$store.state.session_id && this.is_profile_page && !this.is_mobile)" class="browser-alert"> -->
  <!-- <div class="flibo-logo-desktop"/> -->
  <!-- <h1>
      Currently FLIBO works only on mobile browsers.
    </h1>
    <h1>
      Please switch to a mobile device to use FLIBO.
    </h1> -->
  <!-- </div> -->

  <LandingPage
    v-else-if="
      !this.$store.state.session_id &&
      !this.logging_out &&
      !this.is_signup_page &&
      !this.is_content_page &&
      !this.is_search_page &&
      !this.is_search_results_page &&
      !this.is_profile_page &&
      !this.is_policy_page &&
      !this.is_alert_page &&
      !this.is_blog_page
    "
    :is_mobile="is_mobile"
  />

  <Loader v-else-if="!this.$store.state.session_id & this.logging_out"></Loader>

  <div
    id="app"
    v-else-if="
      this.is_signup_page |
        this.is_content_page |
        this.is_profile_page |
        this.is_search_page |
        this.is_search_results_page |
        this.is_policy_page |
        this.is_alert_page |
        this.is_blog_page
    "
    :style="
      is_mobile
        ? 'width:100%;'
        : 'width: 1000px;margin-left: calc(50vw - 500px);'
    "
  >
    <router-view
      @update-api-counter="updateApiCounter"
      @open-content-page="openContentPage"
      @open-uesr-profile="goToProfile"
      @reset-feed-page="resetFeedPage"
    />
    <MainNavigation
      v-if="!this.is_policy_page && !this.is_alert_page && !this.is_blog_page"
    />
    <TopBar
      v-if="
        !this.is_search_page &&
        !this.is_policy_page &&
        !this.is_alert_page &&
        !this.is_blog_page
      "
    />
    <SignUpPrompt />
  </div>
</template>

<script>
import Loader from "./components/Loader";
import axios from "axios";
import DeviceDetector from "device-detector-js";
import TopBar from "./components/TopBar";
import MainNavigation from "./components/MainNavigation";
import LandingPage from "./components/LandingPage";
import SignUpPrompt from "./components/SignUpPrompt";

export default {
  name: "App",
  components: {
    Loader,
    TopBar,
    MainNavigation,
    LandingPage,
    SignUpPrompt,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      logging_out: false,
      is_landing_page: false,
      is_signup_page: false,
      is_content_page: false,
      is_profile_page: false,
      is_search_page: false,
      is_search_results_page: false,
      is_user_search_page: false,
      is_policy_page: false,
      is_alert_page: false,
      is_onboarding: false,
      store: this.$store.state,
      ip_info: {
        ip: null,
        city: null,
        region: null,
        country: null,
        location: null,
        network_org: null,
        postal: null,
        timezone: null,
      },
      is_blog_page: false,
      feed_mappings: {
        home: {
          contents: "this.$store.state.suggestions.contents",
          feed: "this.$store.state.suggestions.feed_list",
          content_filter: "this.$store.state.suggestions.content_type_tab",
          discover_filters: "this.$store.state.suggestions.discover_type_tab",
          platform_filters:
            "this.$store.state.feed_filters.filters_applied.home.platforms",
          genre_filters: null,
        },
        search_results: {
          contents: "this.$store.state.discover_filters.filtered_content",
          feed: "this.$store.state.feed.search_results.feed_list",
          content_filter: "this.$store.state.discover_filters.content_type_tab",
          discover_filters:
            "this.$store.state.discover_filters.discover_type_tab",
          platform_filters: null,
          genre_filters: null,
        },
        watchlist: {
          contents: "this.$store.state.watchlist",
          feed: "this.$store.state.feed.watchlist.feed_list",
          content_filter:
            "this.$store.state.watchlist_filters.content_type_tab",
          discover_filters: null,
          platform_filters:
            "this.$store.state.feed_filters.filters_applied.watchlist.platforms",
          genre_filters:
            "this.$store.state.feed_filters.filters_applied.watchlist.genres",
        },
      },
    };
  },

  computed: {
    my_store: function () {
      return this.$store.state;
    },
    router_path: function () {
      return this.$route.path;
    },
    refreshFeed() {
      return this.$store.state.suggestions.refresh_feed;
    },
  },

  watch: {
    my_store: {
      handler(val) {
        localStorage.setItem("my_store", JSON.stringify(this.my_store));
      },
      deep: true,
    },
    router_path: {
      handler: function (path) {
        this.is_signup_page = path.startsWith("/signup");
        this.is_content_page = path.startsWith("/content/");
        this.is_profile_page = path.startsWith("/profile/");
        this.is_landing_page = path == "/";
        this.is_search_page = path == "/search";
        this.is_search_results_page = path == "/search-results";
        this.is_user_search_page = path == "/search-users";
        this.is_policy_page = path == "/privacy-policy";
        this.is_alert_page = path == "/alert";
        this.is_onboarding = path == "/onboarding";
        this.is_blog_page = path.startsWith("/blog/");

        if (
          this.$store.state.current_path.startsWith("/content/") &&
          path.startsWith("/content/")
        ) {
          this.$store.state.content_page.rerender = true;
        }
      },
    },
    refreshFeed: {
      handler: function (refresh) {
        if (refresh) {
          var self = this;

          var reset_info = {
            parent: "home",
            filters: true,
            skip_suggestions_filter: false,
            scroll: true,
            paddings: true,
            observer_current_index: true,
            element_heights: true,
          };
          self.resetFeedPage(reset_info);

          self.refreshDiscoverPage();

          self.$store.state.suggestions.refresh_feed = false;
        }
      },
    },
  },

  created() {
    var self = this;
    var route_session_id = this.$route.query.id;
    var is_webview = this.$route.query.webview;
    var store_session_id = this.$store.state.session_id;
    var current_path = this.$route.path;
    this.is_signup_page = current_path.startsWith("/signup");
    this.is_content_page = current_path.startsWith("/content/");
    this.is_profile_page = current_path.startsWith("/profile/");
    this.is_landing_page = current_path == "/";
    this.is_search_page = current_path == "/search";
    this.is_search_results_page = current_path == "/search-results";
    this.is_user_search_page = current_path == "/search-users";
    this.is_policy_page = current_path == "/privacy-policy";
    this.is_alert_page = current_path == "/alert";
    this.is_blog_page = current_path.startsWith("/blog/");
    this.is_onboarding = current_path == "/onboarding";

    if (!route_session_id && !store_session_id && !this.is_signup_page) {
      if (
        current_path.startsWith("/content/") |
        current_path.startsWith("/profile/") |
        this.is_search_page |
        this.is_search_results_page |
        this.is_policy_page |
        this.is_alert_page |
        this.is_blog_page
      ) {
        if (this.$store.state.guest_id == null) {
          var chars =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          var length = 16;
          var result = "";
          for (var i = length; i > 0; --i)
            result += chars[Math.floor(Math.random() * chars.length)];
          this.$store.state.guest_id = "guest_" + Date.now() + result;
        }

        if (this.$store.state.guest_country == null) {
          axios
            .get("https://ipinfo.io/?token=a354c067e1fef5")
            .then(function (response) {
              if ([200].includes(response.status)) {
                self.ip_info.ip = response.data.ip;
                self.ip_info.city = response.data.city;
                self.ip_info.region = response.data.region;
                self.ip_info.country = response.data.country;
                self.ip_info.location = response.data.loc;
                self.ip_info.network_org = response.data.org;
                self.ip_info.postal = response.data.postal;
                self.ip_info.timezone = response.data.timezone;

                if (
                  Object.keys(self.$store.state.country_mappings).includes(
                    self.ip_info.country
                  )
                ) {
                  self.$store.state.guest_country =
                    self.$store.state.country_mappings[response.data.country];
                }
              }

              if (
                self.$store.state.rate_filters.filters_meta.genres.length == 0
              ) {
                axios
                  .post(self.$store.state.api_host + "search_filters", {
                    session_id: null,
                    country: self.$store.state.guest_country,
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

                axios
                  .post(
                    self.$store.state.api_host + "get_favorite_artists_search",
                    {
                      session_id: null,
                    }
                  )
                  .then(function (response) {
                    if ([200].includes(response.status)) {
                      self.$store.state.discover_filters.filters_meta.artists =
                        response.data.favorite_artists;
                    } else {
                      // console.log(response.status);
                    }
                  });
              }
            });
        } else if (
          this.$store.state.rate_filters.filters_meta.genres.length == 0
        ) {
          axios
            .post(this.$store.state.api_host + "search_filters", {
              session_id: null,
              country: this.$store.state.guest_country,
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

          axios
            .post(self.$store.state.api_host + "get_favorite_artists_search", {
              session_id: null,
            })
            .then(function (response) {
              if ([200].includes(response.status)) {
                self.$store.state.discover_filters.filters_meta.artists =
                  response.data.favorite_artists;
              } else {
                // console.log(response.status);
              }
            });
        }
        this.$router.push(this.$route.fullPath);
        if (!this.$route.query.search) {
          this.updateDeviceInfo();
        }
      } else if (current_path != "/") {
        this.$router.push("/");
      }
    } else if (route_session_id || store_session_id) {
      if (route_session_id) {
        this.$store.state.session_id = route_session_id;
        if (is_webview) {
          this.$store.state.is_webview = is_webview;
        }
      }
      if (!this.$store.state.session_id) {
        window.location = this.$store.state.login_host;
      } else {
        var self = this;

        if (this.$store.state.user.id != null && !this.$route.query.search) {
          var reset_info = {
            parent: "to_be_assigned",
            filters: true,
            skip_suggestions_filter: false,
            scroll: true,
            paddings: true,
            observer_current_index: true,
            element_heights: true,
          };

          var feed_parents = ["home", "search_results", "watchlist"];
          feed_parents.forEach(function (item, index) {
            reset_info.parent = item;
            self.resetFeedPage(reset_info);
          });

          this.refreshDiscoverPage();
          this.updateWatchlist(true);

          this.$store.state.discover_filters.filtered_content = [];
          this.$store.state.discover_filters.more_filtered_content = [];
          this.$store.state.feed.search_results.feed_list = [];
        }

        axios
          .post(this.$store.state.api_host + "get_name_picture", {
            session_id: this.$store.state.session_id,
          })
          .then(
            (response) => (
              (self.$store.state.user.id = response.data.id),
              (self.$store.state.user.name = response.data.name),
              (self.$store.state.user.picture = response.data.picture),
              (self.$store.state.user.authorized = response.data.authorized)
            )
          )
          .catch(function (error) {
            if ([401, 419].includes(error.response.status)) {
              window.location =
                self.$store.state.login_host +
                "logout?session_id=" +
                self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.logging_out = true;
            } else {
              // console.log(error.response.status);
            }
          });
        if (
          current_path != "/" &&
          current_path != "/onboarding" &&
          !this.is_signup_page
        ) {
          this.$store.state.current_path = this.$route.fullPath;
        }

        if (this.$store.state.current_path) {
          this.$router.push(this.$store.state.current_path);
        } else {
          this.$router.push("/");
        }

        var self = this;
        axios
          .get(self.$store.state.api_host + "get_countries_platforms")
          .then(
            (response) =>
              (self.$store.state.countries = response.data.countries)
          );

        if (this.$store.state.rate_filters.filters_meta.genres.length == 0) {
          var self = this;
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
        }

        axios
          .post(self.$store.state.api_host + "counts", {
            session_id: self.$store.state.session_id,
          })
          .then(function (response) {
            self.$store.state.suggestions.rate_counter_all =
              response.data.contents_rated;
            if (response.data.contents_rated < 25) {
              self.$router.push("/onboarding");
            }

            self.$store.state.user.profile.country = response.data.country;

            if (response.data.contents_rated != 0) {
              if (
                self.$store.state.suggestions.contents.length == 0 &&
                !self.$store.state.suggestions.fetching_suggestions
              ) {
                self.refreshDiscoverPage();
              }

              if (
                self.$store.state.watchlist.length == 0 &&
                !self.$store.state.feed.watchlist.fetching
              ) {
                self.updateWatchlist(true);
              }
            }

            if (
              self.$store.state.rate.visible_cards.length == 0 &&
              !self.store.rate.fetching_cards &&
              response.data.country != null
            ) {
              self.getSwipeCards();
            }
            self.$store.state.user.profile.platforms = response.data.platforms;
            if (self.is_mobile) {
              self.$store.state.instructions_seen =
                response.data.instructions_seen;
            } else {
              if (self.$store.state.user.profile.country == null) {
                self.$store.state.instructions_seen =
                  response.data.instructions_seen;
              } else {
                self.$store.state.instructions_seen = true;
              }
            }
            self.$store.state.content_page.never_tapped_any_artist =
              response.data.never_tapped_any_artist;
            self.$store.state.rate.never_tapped_any_card =
              response.data.never_tapped_any_card;
            self.$store.state.suggestions.suggestions_ready_message_seen =
              response.data.suggestions_ready_message_seen;
            if (!self.$route.query.search) {
              self.updateDeviceInfo();
            }
          });

        axios
          .post(self.$store.state.api_host + "get_favorite_artists_search", {
            session_id: self.$store.state.session_id,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.$store.state.discover_filters.filters_meta.artists =
                response.data.favorite_artists;
            } else {
              // console.log(response.status);
            }
          });

        if (!this.$route.query.search) {
          self.timeout = setTimeout(function () {
            self.updateProfile();
            self.updateFriendsPage();
          }, 5000);
        }

        self.timeout = setInterval(function () {
          self.updateWatchlist(false);
          self.updateProfile();
          self.updateFriendsPage();
        }, 2 * 60 * 1000);
      }
    } else if (this.is_signup_page) {
      this.$router.push(current_path);
    }
  },
  methods: {
    updateWatchlist(on_load) {
      if (this.router_path != "/watchlist" || on_load) {
        var self = this;
        self.$store.state.feed.watchlist.fetching = true;
        axios
          .post(self.$store.state.api_host + "watchlist", {
            session_id: self.$store.state.session_id,
            country: self.$store.state.user.profile.country,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.$store.state.watchlist = response.data.watchlist;
              self.$store.state.feed.watchlist.feed_list = self.$store.state.watchlist.slice(
                0,
                self.$store.state.feed.defaultListSize
              );

              if (self.$route.path == "/watchlist") {
                self.$nextTick(function () {
                  self.$store.state.feed.update_dom = true;
                });
              }
            } else {
              // console.log(response.status);
            }
            self.$store.state.feed.watchlist.fetching = false;
          })
          .catch(function (error) {
            self.$store.state.feed.watchlist.fetching = false;
            // console.log(error);
            if ([401, 419].includes(error.response.status)) {
              window.location =
                self.$store.state.login_host +
                "logout?session_id=" +
                self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.logging_out = true;
            } else {
              // console.log(error.response.status);
            }
          });
      }
    },
    updateProfile() {
      if (
        !this.router_path.startsWith(
          "/profile/" + this.$store.state.user.id + "/"
        )
      ) {
        var self = this;
        axios
          .post(self.$store.state.api_host + "profile", {
            session_id: self.$store.state.session_id,
            user_id: self.$store.state.user.id,
            user_name: self.$store.state.user.name
              .replace(/[^a-z0-9]+/gi, "-")
              .toLowerCase(),
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.$store.state.user.profile.posters =
                response.data.profile_cover.posters;
              self.$store.state.user.profile.covers =
                response.data.profile_cover.covers;
              self.$store.state.user.profile.total_watched =
                response.data.total_watched;
              self.$store.state.user.profile.contents_rated =
                response.data.contents_rated;
              self.$store.state.user.profile.genres = response.data.genres;
              self.$store.state.user.profile.watched_timeline =
                response.data.rating_timeline;
              self.$store.state.user.profile.profile_status =
                response.data.profile_status;
              self.$store.state.user.profile.profile_views =
                response.data.profile_views;
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
              self.logging_out = true;
            } else {
              // console.log(error.response.status);
            }
          });
      }
    },
    updateFriendsPage() {
      var current_friends = [];
      var user;
      for (user in this.$store.state.friends_page.friends) {
        if (
          this.$store.state.friends_page.friends[user].friend_type == "friend"
        ) {
          current_friends.push(
            this.$store.state.friends_page.friends[user].friend_id
          );
        }
      }

      var current_requests = [];
      for (user in this.$store.state.friends_page.friends) {
        if (
          this.$store.state.friends_page.friends[user].friend_type ==
          "unapproved"
        ) {
          current_requests.push(
            this.$store.state.friends_page.friends[user].friend_id
          );
        }
      }

      var self = this;
      var new_friends = [];
      var index;
      var friends_notification = false;
      var requests_notification = false;
      axios
        .post(this.$store.state.api_host + "get_friends", {
          session_id: this.$store.state.session_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            new_friends = response.data.people;

            if (Date.now() - self.$store.state.updated_at > 2 * 60 * 1000) {
              for (user in new_friends) {
                if (new_friends[user].friend_type == "friend") {
                  index = current_friends.indexOf(new_friends[user].friend_id);
                  if (index == -1) {
                    friends_notification = true;
                    new_friends[user].highlight = true;
                  } else {
                    new_friends[user].highlight = false;
                  }
                }
              }

              for (user in new_friends) {
                if (new_friends[user].friend_type == "unapproved") {
                  index = current_requests.indexOf(new_friends[user].friend_id);
                  if (index == -1) {
                    requests_notification = true;
                    new_friends[user].highlight = true;
                  } else {
                    new_friends[user].highlight = false;
                  }
                }
              }
            }

            self.$store.state.friends_page.friends = new_friends;
            if (friends_notification) {
              self.$store.state.notifications.friends = true;
            }
            if (requests_notification) {
              self.$store.state.notifications.requests = true;
            }
          } else if ([204].includes(response.status)) {
            self.$store.state.friends_page.friends = [];
          }
        })
        .catch(function (error) {
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    loggingOut() {
      this.logging_out = true;
    },
    refreshDiscoverPage() {
      var self = this;
      self.$store.state.suggestions.fetching_suggestions = true;
      self.$store.state.notifications.suggestions = false;

      axios
        .post(self.$store.state.api_host + "flibo_feed", {
          session_id: self.$store.state.session_id,
          country: self.$store.state.user.profile.country,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.$store.state.suggestions.contents = response.data.contents;
            self.store.suggestions.feed_list = self.store.suggestions.contents.slice(
              0,
              self.$store.state.feed.defaultListSize
            );
            self.$store.state.suggestions.more_contents =
              response.data.more_contents;
            self.fetchRemaining();

            if (self.$route.path == "/discover") {
              self.$nextTick(function () {
                self.$store.state.feed.update_dom = true;
              });
            }
          } else {
            // console.log(response.status);
          }
          self.$store.state.suggestions.fetching_suggestions = false;
        })
        .catch(function (error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
          self.$store.state.suggestions.fetching_suggestions = false;
        });

      axios
        .post(self.$store.state.api_host + "users_to_befriend", {
          session_id: self.$store.state.session_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.$store.state.suggestions.users_suggestions =
              response.data.users;
          } else if ([204].includes(response.status)) {
            self.$store.state.suggestions.users_suggestions = [];
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
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    updateApiCounter(activity) {
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_api_counter", {
          session_id: self.$store.state.session_id,
          api: activity.api,
          content_id: Object.keys(activity).includes("content_id")
            ? activity.content_id
            : null,
          rating: Object.keys(activity).includes("rating")
            ? activity.rating
            : null,
          tab_name: Object.keys(activity).includes("tab_name")
            ? activity.tab_name
            : null,
          url: Object.keys(activity).includes("url") ? activity.url : null,
          traffic_origin: Object.keys(activity).includes("traffic_origin")
            ? activity.traffic_origin
            : null,
          trailer_origin: Object.keys(activity).includes("trailer_origin")
            ? activity.trailer_origin
            : null,
        })
        .then(function (response) {
          if (Object.keys(activity).includes("url")) {
            window.open(activity.url);
          }
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          if (Object.keys(activity).includes("url")) {
            window.open(activity.url);
          }
          // console.log(error);
          if (self.$store.state.session_id) {
            if ([401, 419].includes(error.response.status)) {
              window.location =
                self.$store.state.login_host +
                "logout?session_id=" +
                self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.logging_out = true;
            } else {
              // console.log(error.response.status);
            }
          }
        });
    },
    updateDeviceInfo() {
      var self = this;

      if (this.ip_info.country == null) {
        axios
          .get("https://ipinfo.io/?token=a354c067e1fef5")
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.ip_info.ip = response.data.ip;
              self.ip_info.city = response.data.city;
              self.ip_info.region = response.data.region;
              self.ip_info.country = response.data.country;
              self.ip_info.location = response.data.loc;
              self.ip_info.network_org = response.data.org;
              self.ip_info.postal = response.data.postal;
              self.ip_info.timezone = response.data.timezone;

              if (
                self.$store.state.session_id &&
                !self.$store.state.user.profile.country
              ) {
                if (
                  Object.keys(self.$store.state.country_mappings).includes(
                    self.ip_info.country
                  )
                ) {
                  self.$store.state.user.profile.country =
                    self.$store.state.country_mappings[response.data.country];
                } else {
                  self.$store.state.user.profile.country = "United States";
                }
                self.saveCountry();

                if (
                  self.$store.state.rate.visible_cards.length == 0 &&
                  !self.store.rate.fetching_cards
                ) {
                  self.getSwipeCards();
                }
              }
            }

            const deviceDetector = new DeviceDetector();
            const device = deviceDetector.parse(navigator.userAgent);

            axios.post(self.$store.state.api_host + "update_device_info", {
              user_id: self.$store.state.user.id,
              session_id: self.$store.state.session_id,
              guest_id: self.$store.state.guest_id,

              is_app: self.$store.state.is_webview == "true",

              ip: self.ip_info.ip,
              city: self.ip_info.city,
              region: self.ip_info.region,
              country: self.ip_info.country,
              location: self.ip_info.location,
              network_org: self.ip_info.network_org,
              postal: self.ip_info.postal,
              timezone: self.ip_info.timezone,

              client_type: device.client.type,
              client_name: device.client.name,
              client_version: device.client.version,
              client_engine: device.client.engine,
              client_engine_version: device.client.engineVersion,

              os_name: device.os.name,
              os_version: device.os.version,
              os_platform: device.os.platform,

              device_type: device.device.type,
              device_brand: device.device.brand,
              device_model: device.device.model,

              bot: device.bot,

              screen_width: window.outerWidth,
              screen_height: window.outerHeight,
            });
          });
      } else {
        const deviceDetector = new DeviceDetector();
        const device = deviceDetector.parse(navigator.userAgent);

        axios.post(this.$store.state.api_host + "update_device_info", {
          user_id: this.$store.state.user.id,
          session_id: this.$store.state.session_id,
          guest_id: this.$store.state.guest_id,

          is_app: this.$store.state.is_webview == "true",

          ip: this.ip_info.ip,
          city: this.ip_info.city,
          region: this.ip_info.region,
          country: this.ip_info.country,
          location: this.ip_info.location,
          network_org: this.ip_info.network_org,
          postal: this.ip_info.postal,
          timezone: this.ip_info.timezone,

          client_type: device.client.type,
          client_name: device.client.name,
          client_version: device.client.version,
          client_engine: device.client.engine,
          client_engine_version: device.client.engineVersion,

          os_name: device.os.name,
          os_version: device.os.version,
          os_platform: device.os.platform,

          device_type: device.device.type,
          device_brand: device.device.brand,
          device_model: device.device.model,

          bot: device.bot,

          screen_width: window.outerWidth,
          screen_height: window.outerHeight,
        });
      }
    },
    saveCountry() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          country: self.$store.state.user.profile.country,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
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
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    getSwipeCards() {
      var self = this;
      self.store.rate.fetching_cards = true;
      axios
        .post(self.$store.state.api_host + "get_contents_to_rate", {
          session_id: self.$store.state.session_id,
          content_ids: null,
          rest_of_queue: null,
          visible_cards: null,
          country: self.$store.state.user.profile.country,
        })
        .then(
          (response) => (
            (self.$store.state.rate.visible_cards = response.data.contents),
            (self.$store.state.rate.content_ids = response.data.content_ids),
            (self.store.rate.fetching_cards = false)
          )
        )
        .catch(function (error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    fetchRemaining() {
      var self = this;
      self.store.suggestions.fetching_feed_incremental = true;

      axios
        .post(self.$store.state.api_host + "get_incremental_feed_contents", {
          session_id: self.$store.state.session_id,
          more_contents: self.$store.state.suggestions.more_contents.slice(),
          country: self.$store.state.user.profile.country,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.$store.state.suggestions.contents.push(
              ...response.data.contents
            );
            if (self.$route.path == "/discover") {
              self.$store.state.feed_filters.apply_filters_wo_reset = true;
            }
            self.$store.state.suggestions.more_contents = [];
          } else {
            // console.log(response.status);
          }
          self.store.suggestions.fetching_feed_incremental = false;
        })
        .catch(function (error) {
          self.store.suggestions.fetching_feed_incremental = false;
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    openContentPage(info) {
      this.$store.state.content_page.more_by_artist = null;
      this.$store.state.content_page.artist = null;

      var origin_full = info.origin;
      if (info.origin == "home") {
        var discover_type_tab_string = JSON.stringify(
          this.$store.state.suggestions.discover_type_tab
        ).replace(/['"]+/g, "");
        origin_full =
          "discover__" +
          (discover_type_tab_string == "[flibo]"
            ? "suggestions_tab__"
            : discover_type_tab_string == "[filter]"
            ? "filter_tab__"
            : "feed_tab__") +
          info.sub_origin;
      } else if (info.origin == "search_results") {
        var discover_type_tab_string = JSON.stringify(
          this.$store.state.discover_filters.discover_type_tab
        ).replace(/['"]+/g, "");
        if (info.sub_origin) {
          origin_full =
            "search_filter__" +
            (discover_type_tab_string == "[flibo]"
              ? "suggestions_tab__"
              : discover_type_tab_string == "[filter]"
              ? "filter_tab__"
              : "feed_tab__") +
            info.sub_origin;
        } else {
          origin_full =
            "search_filter__" +
            (discover_type_tab_string == "[flibo]"
              ? "suggestions_tab"
              : discover_type_tab_string == "[filter]"
              ? "filter_tab"
              : "feed_tab");
        }
      }
      this.$store.state.content_page.origin = Object.keys(info || {}).includes(
        "suffix"
      )
        ? info.suffix
          ? origin_full + "__" + info.suffix
          : origin_full
        : origin_full;

      this.$router.push(
        "/content/" +
          info.content_id +
          "/" +
          info.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    getContentIndex(content_id, list_location) {
      for (let i = 0; i < eval(list_location).length; i++) {
        if (eval(list_location)[i].content_id == content_id) {
          return i;
        }
      }
    },
    submitRating(info) {
      var self = this;

      var content_list_location = this.feed_mappings[info.origin].contents;
      var contents_index = this.getContentIndex(
        info.content_id,
        content_list_location
      );

      var feed_list_location = this.feed_mappings[info.origin].feed;
      var feed_index = this.getContentIndex(
        info.content_id,
        feed_list_location
      );

      var prev_rating = null;
      prev_rating = eval(content_list_location)[contents_index].rating;

      eval(content_list_location)[contents_index].rating = info.user_rating;
      eval(feed_list_location)[feed_index].rating = info.user_rating;

      axios
        .post(this.$store.state.api_host + "submit_rating", {
          session_id: this.$store.state.session_id,
          content_ids: [info.content_id],
          rating: info.user_rating,
        })
        .then(function (response) {
          var index = self.$store.state.suggestions.rate_counter.indexOf(
            info.content_id
          );
          if (index == -1) {
            self.$store.state.suggestions.rate_counter.push(info.content_id);
            if (
              self.$store.state.suggestions.rate_counter.length ==
              self.$store.state.suggestions.calc_after
            ) {
              self.$store.state.suggestions.rate_counter = [];
              axios
                .post(
                  self.$store.state.ai_host + "calculate_contents_to_recommend",
                  {
                    session_id: self.$store.state.session_id,
                  }
                )
                .then(function (response) {
                  self.$store.state.notifications.suggestions = true;
                });
            }
          }
        })
        .catch(function (error) {
          eval(content_list_location)[contents_index].rating = prev_rating;
          eval(feed_list_location)[feed_index].rating = prev_rating;

          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    addToWatchlist(info) {
      var self = this;

      var content_list_location = this.feed_mappings[info.origin].contents;
      var contents_index = this.getContentIndex(
        info.content_id,
        content_list_location
      );

      var feed_list_location = this.feed_mappings[info.origin].feed;
      var feed_index = this.getContentIndex(
        info.content_id,
        feed_list_location
      );

      var prev_state = null;
      prev_state = eval(content_list_location)[contents_index].watch_later;

      eval(content_list_location)[contents_index].watch_later = info.watch_later
        ? false
        : true;
      eval(feed_list_location)[feed_index].watch_later = info.watch_later
        ? false
        : true;

      axios
        .post(this.$store.state.api_host + "update_watchlist", {
          session_id: this.$store.state.session_id,
          content_id: info.content_id,
          status: info.watch_later ? false : true,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.updateWatchlist(false);
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          eval(content_list_location)[contents_index].watch_later = prev_state;
          eval(feed_list_location)[feed_index].watch_later = prev_state;

          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.logging_out = true;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    goToProfile(info) {
      this.$router.push(
        "/profile/" +
          info.user_id +
          "/" +
          info.user_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    resetFeedPage(info) {
      if (info.filters) {
        if (this.feed_mappings[info.parent].content_filter != null) {
          eval(
            this.feed_mappings[info.parent].content_filter +
              ' = ["movie", "tv"]'
          );
        }

        if (
          this.feed_mappings[info.parent].discover_filters != null &&
          !info.skip_suggestions_filter
        ) {
          eval(
            this.feed_mappings[info.parent].discover_filters +
              ' = ["community", "friends", "flibo"]'
          );
        } else if (
          this.feed_mappings[info.parent].discover_filters != null &&
          info.skip_suggestions_filter
        ) {
          eval(
            this.feed_mappings[info.parent].discover_filters + ' = ["flibo"]'
          );
        }

        if (this.feed_mappings[info.parent].platform_filters != null) {
          eval(this.feed_mappings[info.parent].platform_filters + " = []");
        }

        if (this.feed_mappings[info.parent].genre_filters != null) {
          eval(this.feed_mappings[info.parent].genre_filters + " = []");
        }
      }

      if (info.scroll) {
        eval("this.$store.state.feed." + info.parent + ".scroll_position = 0");
      }

      if (info.paddings) {
        eval("this.$store.state.feed." + info.parent + ".padding_top = 0");
        eval("this.$store.state.feed." + info.parent + ".padding_bottom = 0");
      }

      if (info.observer_current_index) {
        eval(
          "this.$store.state.feed." +
            info.parent +
            ".observer_current_index = 0"
        );
      }

      if (info.element_heights) {
        eval("this.$store.state.feed." + info.parent + ".element_heights = {}");
      }
    },
  },
};
</script>

<style lang="scss">
@import "./styles/mixins.scss";
// @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800&display=swap');
// @import url('https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,700&display=swap');
@import url("https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700|Roboto:400,500,700,900|Roboto:wght@900&display=swap");
@import url("https://fonts.googleapis.com/css?family=Poiret+One&display=swap");

#app {
  font-family: "Roboto", sans-serif;
  text-align: center;
}

.flibo-logo-desktop {
  position: fixed;
  display: block;
  width: 150px;
  height: 80px;
  top: 0%;
  background-image: url("./images/flibo-logo-dark.svg");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.browser-alert {
  font-family: "Open Sans", sans-serif;
  text-align: center;
  margin-top: 40vh;
}
</style>
