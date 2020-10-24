<template>
  <div class="feed-container">
    <Feed v-if="!noSuggestionFound" parent="suggestions" v-on="$listeners" />
    <div v-else class="na-message">No suggestions found.</div>
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
      noSuggestionFound: false,
    };
  },
  created() {
    if (
      this.$store.state.feed.suggestions.contents.length == 0 ||
      this.$route.query.refresh ||
      this.$store.state.suggestions.refresh_feed
    ) {
      if (this.$route.query.refresh) {
        let query = Object.assign({}, this.$route.query);
        delete query.refresh;
        this.$router.replace({ query });
      }
      this.$store.state.suggestions.refresh_feed = false;

      this.fetchSuggestions();
    }
  },
  methods: {
    fetchSuggestions(fetchedSuggestions = []) {
      var self = this;

      if (fetchedSuggestions.length == 0) {
        this.resetSuggestionsStore();
      }

      if (fetchedSuggestions.length) {
        self.$store.state.feed.suggestions.fetching_incremental = true;
      } else {
        self.$store.state.feed.suggestions.fetching = true;
      }

      axios
        .post(self.$store.state.api_host + "suggestions", {
          session_id: self.$store.state.session_id,
          fetched_suggestions: fetchedSuggestions,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
        })
        .then((response) => {
          if ([200].includes(response.status)) {
            if (fetchedSuggestions.length) {
              self.$store.state.feed.suggestions.contents.push(
                ...response.data.suggestions
              );
              if (self.$route.path == "/suggestions") {
                self.$store.state.feed_filters.apply_filters_wo_reset = true;
              } else if (
                self.store.feed.suggestions.feed_list.length <
                self.$store.state.feed.defaultListSize
              ) {
                self.store.feed.suggestions.apply_filters_on_create = true;
              }
            } else {
              self.$store.state.feed.suggestions.contents =
                response.data.suggestions;
              self.store.feed.suggestions.feed_list = self.$store.state.feed.suggestions.contents.slice(
                0,
                self.$store.state.feed.defaultListSize
              );

              if (
                response.data.total_suggestions >
                response.data.suggestions.length
              ) {
                self.fetchSuggestions(
                  response.data.suggestions.map(
                    (suggestion) => suggestion.action_id
                  )
                );
              }

              if (self.$route.path == "/suggestions") {
                self.$nextTick(function () {
                  self.$store.state.feed.update_dom = true;
                });
              }
            }
          } else if (
            [204].includes(response.status) &&
            fetchedSuggestions.length == 0
          ) {
            self.noSuggestionFound = true;
          }

          if (fetchedSuggestions.length) {
            self.$store.state.feed.suggestions.fetching_incremental = false;
          } else {
            self.$store.state.feed.suggestions.fetching = false;
          }
        })
        .catch(function (error) {
          // console.log(error);
          if (fetchedSuggestions.length) {
            self.$store.state.feed.suggestions.fetching_incremental = false;
          } else {
            self.$store.state.feed.suggestions.fetching = false;
          }
        });
    },
    resetSuggestionsStore() {
      this.store.feed.suggestions.contents = [];
      this.store.feed.suggestions.apply_filters_on_create = false;
      this.store.feed.suggestions.element_heights = {};
      this.store.feed.suggestions.see_more_elements = [];
      this.store.feed.suggestions.feed_list = [];
      this.store.feed.suggestions.fetching = false;
      this.store.feed.suggestions.fetching_incremental = false;
      this.store.feed.suggestions.content_type_tab = ["movie", "tv"];
      this.store.feed.suggestions.discover_type_tab = ["flibo"];
      this.store.feed.suggestions.platforms = [];
      this.store.feed.suggestions.genres = [];
      this.store.feed.suggestions.padding_top = 0;
      this.store.feed.suggestions.padding_bottom = 0;
      this.store.feed.suggestions.scroll_position = 0;
      this.store.feed.suggestions.observer_current_index = 0;
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