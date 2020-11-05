<template>
  <div class="feed-container">
    <Feed
      v-if="!profileClosed && !noPostFound"
      parent="posts"
      :userType="
        store.feed.posts.type == 'user' && store.user.id == id
          ? 'self'
          : 'other'
      "
      v-on="$listeners"
    />
    <div v-else class="na-message">
      {{
        store.feed.posts.type == "user" && store.user.id != id
          ? profileClosed
            ? userName.split(" ")[0] + "'s profile is private."
            : userName.split(" ")[0] + " hasn't added any posts."
          : store.feed.posts.type == "user"
          ? "Please add some posts to your profile."
          : "No posts found for the " +
            (RegExp(/^1{1}.*$/).test(id) ? "movie." : "show.")
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
      noPostFound: false,
      id: null,
      urlName: null,
      userName: null,
    };
  },
  created() {
    var self = this;
    this.$store.state.current_path = this.$route.path;
    this.id = parseInt(this.$route.params.id);
    this.urlName = this.$route.params.name;

    if (this.$store.state.feed.posts.contents.length) {
      if (this.$store.state.feed.posts.type != this.$route.params.type) {
        this.$store.state.feed.posts.type = this.$route.params.type;
        this.fetchPosts();
      } else if (this.$store.state.feed.posts.type == "content") {
        if (this.$store.state.feed.posts.contents[0].content_id != this.id) {
          this.fetchPosts();
        }
      } else if (this.$store.state.feed.posts.type == "user") {
        if (this.$store.state.feed.posts.contents[0].creator_id != this.id) {
          this.fetchPosts();
        }
      }
    } else {
      this.$store.state.feed.posts.type = this.$route.params.type;
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
            self.fetchPosts();
          });
      } else {
        self.fetchPosts();
      }
    }
  },
  methods: {
    fetchPosts() {
      if (this.$store.state.feed.posts.type == "content") {
        this.fetchContentPosts();
      } else {
        this.fetchUserPosts();
      }
    },
    fetchContentPosts(fetchedPosts = []) {
      var self = this;

      if (fetchedPosts.length == 0) {
        this.resetPostsStore();
      }

      if (fetchedPosts.length) {
        self.$store.state.feed.posts.fetching_incremental = true;
      } else {
        self.$store.state.feed.posts.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "content_posts", {
          session_id: self.$store.state.session_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
          content_id: self.id,
          fetched_posts: fetchedPosts,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            if (fetchedPosts.length) {
              self.$store.state.feed.posts.contents.push(
                ...response.data.posts
              );
              if (self.$route.path.includes("/posts/")) {
                self.$store.state.feed_filters.apply_filters_wo_reset = true;
              } else if (
                self.store.feed.posts.feed_list.length <
                self.$store.state.feed.defaultListSize
              ) {
                self.store.feed.posts.apply_filters_on_create = true;
              }
            } else {
              self.$store.state.feed.posts.contents = response.data.posts;
              self.store.feed.posts.feed_list = self.$store.state.feed.posts.contents.slice(
                0,
                self.$store.state.feed.defaultListSize
              );
              if (response.data.total_posts > response.data.posts.length) {
                self.fetchContentPosts(
                  response.data.posts.map((post) => post.action_id)
                );
              }

              if (self.$route.path.includes("/posts/")) {
                self.$nextTick(function () {
                  self.$store.state.feed.update_dom = true;
                });
              }
            }
          } else if ([204].includes(response.status)) {
            self.noPostFound = true;
          }

          if (fetchedPosts.length) {
            self.$store.state.feed.posts.fetching_incremental = false;
          } else {
            self.$store.state.feed.posts.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedPosts.length) {
            self.$store.state.feed.posts.fetching_incremental = false;
          } else {
            self.$store.state.feed.posts.fetching = false;
          }
        });
    },
    fetchUserPosts(fetchedPosts = []) {
      var self = this;

      if (fetchedPosts.length == 0) {
        this.resetPostsStore();
      }

      if (fetchedPosts.length) {
        self.$store.state.feed.posts.fetching_incremental = true;
      } else {
        self.$store.state.feed.posts.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "user_posts", {
          session_id: self.$store.state.session_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
          user_id: self.id,
          user_name: self.urlName,
          fetched_posts: fetchedPosts,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            if (response.data.profile_status == "open") {
              if (fetchedPosts.length) {
                self.$store.state.feed.posts.contents.push(
                  ...response.data.posts
                );
                if (self.$route.path.includes("/posts/")) {
                  self.$store.state.feed_filters.apply_filters_wo_reset = true;
                } else if (
                  self.store.feed.posts.feed_list.length <
                  self.$store.state.feed.defaultListSize
                ) {
                  self.store.feed.posts.apply_filters_on_create = true;
                }
              } else {
                self.$store.state.feed.posts.contents = response.data.posts;
                self.store.feed.posts.feed_list = self.$store.state.feed.posts.contents.slice(
                  0,
                  self.$store.state.feed.defaultListSize
                );
                if (response.data.total_posts > response.data.posts.length) {
                  self.fetchUserPosts(
                    response.data.posts.map((post) => post.action_id)
                  );
                }

                if (self.$route.path.includes("/posts/")) {
                  self.$nextTick(function () {
                    self.$store.state.feed.update_dom = true;
                  });
                }
              }
            } else {
              self.userName =
                response.data.user_name.slice(0, 1).toUpperCase() +
                response.data.user_name.slice(1);
              self.profileClosed = true;
            }
          } else if ([204].includes(response.status)) {
            self.noPostFound = true;
          }

          if (fetchedPosts.length) {
            self.$store.state.feed.posts.fetching_incremental = false;
          } else {
            self.$store.state.feed.posts.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedPosts.length) {
            self.$store.state.feed.posts.fetching_incremental = false;
          } else {
            self.$store.state.feed.posts.fetching = false;
          }
        });
    },
    resetPostsStore() {
      this.store.feed.posts.contents = [];
      this.store.feed.posts.apply_filters_on_create = false;
      this.store.feed.posts.element_heights = {};
      this.store.feed.posts.see_more_elements = [];
      this.store.feed.posts.element_comments = {};
      this.store.feed.posts.feed_list = [];
      this.store.feed.posts.fetching = false;
      this.store.feed.posts.fetching_incremental = false;
      this.store.feed.posts.padding_top = 0;
      this.store.feed.posts.padding_bottom = 0;
      this.store.feed.posts.scroll_position = 0;
      this.store.feed.posts.observer_current_index = 0;
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