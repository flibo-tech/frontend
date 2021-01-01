<template>
  <div>
    <div
      v-if="!['posts', 'notifications'].includes(parent) && !fetching_feed"
      class="quick-filters-container"
      :class="{
        'quick-filters-container--hidden':
          parent == 'home' ? false : !showRefreshButton,
      }"
      :style="is_mobile ? '' : 'top: 50px;width: 1000px;'"
    >
      <FeedFilters
        v-if="parent != 'home'"
        :parent="parent"
        @filter-parent="applyQuickFilters"
        v-on="$listeners"
      />

      <Button
        v-if="parent == 'home'"
        class="refresh-feed"
        icon="refresh"
        buttonType="iconOnly"
        :size="24"
        @clicked="refreshFeed"
      />

      <div
        v-if="parent == 'home'"
        class="only-suggestions"
        @click="$router.push('/suggestions')"
      >
        <Button
          buttonType="textOnly"
          fontColor="#405EED"
          text="FLIBO Suggestions"
        />

        <Button
          icon="arrow"
          buttonType="iconOnly"
          :size="14"
          style="margin-left: 4px; margin-top: 1px"
        />
      </div>
    </div>

    <div v-if="hide_feed" class="cover-to-hide-initial-scroll" />

    <div
      v-if="!fetching_feed && feed_list.length"
      :class="mainContainer.replace('.', '')"
      :style="
        is_mobile
          ? ['watchlist', 'ratings', 'suggestions'].includes(parent)
            ? 'margin-top: 200px;'
            : parent == 'search_results'
            ? 'margin-top: 85px;'
            : parent == 'posts'
            ? 'margin-top: 50px;'
            : parent == 'notifications'
            ? 'margin-top: 50px;'
            : 'margin-top: 90px;'
          : ['watchlist', 'ratings', 'suggestions'].includes(parent)
          ? 'position: relative;margin-top: 225px;'
          : parent == 'search_results'
          ? 'position: relative;margin-top: 85px;'
          : parent == 'posts'
          ? 'position: relative;margin-top: 50px;'
          : parent == 'notifications'
          ? 'position: relative;margin-top: 50px;'
          : 'position: relative;margin-top: 90px;'
      "
    >
      <div
        v-for="(item, index) in feed_list"
        :key="index"
        :class="containerTile"
        :id="containerTile + '-' + index"
        :style="
          parent == 'notifications'
            ? {
                width: is_mobile ? '100vw' : '100%;',
                padding: '0',
                border: 0,
                marginBottom: '0px',
              }
            : ['search_results', 'suggestions'].includes(parent) ||
              (item.feed_type && item.feed_type == 'flibo')
            ? {
                padding: '16px 0',
              }
            : { width: is_mobile ? '100vw' : '100%;' }
        "
        :action-id="item.action_id || item.notification_id || item.content_id"
      >
        <div
          v-if="
            parent == 'search_results' &&
            store.session_id != null &&
            currentIndex == 0 &&
            index == 0
          "
          class="user-suggestions-container"
          :style="
            is_mobile
              ? 'margin-bottom: 24px;'
              : 'margin-bottom: 24px;width: 1000px;'
          "
        >
          <p
            v-if="store.discover_filters.query"
            style="font-weight: normal; text-align: center"
          >
            "{{ store.discover_filters.query }}"
          </p>
          <p v-else style="font-weight: normal; text-align: center">
            Your watched movies & shows have been removed from the results.
          </p>
        </div>

        <div
          v-if="
            ['watchlist', 'ratings'].includes(parent) &&
            currentIndex == 0 &&
            index == 0
          "
          class="user-suggestions-container"
          :style="
            is_mobile
              ? 'margin-bottom: 24px; display: flex;align-items: center;justify-content: center;'
              : 'margin-bottom: 24px;width: 1000px;display: flex;align-items: center;justify-content: center;'
          "
        >
          <p
            v-if="is_mobile && !(userType == 'self' && parent == 'ratings')"
            style="font-weight: normal; text-align: center"
          >
            Access
            {{ userType == "self" ? "your" : userName.split(" ")[0] + "'s" }}
            {{ parent }} on desktop at flibo.ai
          </p>

          <p v-else style="font-weight: normal; text-align: center">
            Share
            {{ userType == "self" ? "your" : userName.split(" ")[0] + "'s" }}
            {{ parent }} with friends
          </p>

          <Button
            style="transform: rotate(22deg); margin-left: 16px"
            icon="send_outline"
            buttonType="iconOnly"
            :size="25"
            @clicked="share_prompt = true"
          />
        </div>

        <div
          v-if="
            parent == 'ratings' &&
            userType == 'self' &&
            store.session_id != null &&
            currentIndex == 0 &&
            index == 0
          "
          style="
            padding: 0px 16px;
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
            margin-top: -8px;
          "
        >
          <Button
            buttonType="secondary"
            text="Reset Ratings"
            @clicked="$emit('prompt-reset-ratings')"
          />
        </div>

        <SavePlatforms
          v-if="
            ['home', 'suggestions'].includes(parent) &&
            store.user.profile.platforms == null &&
            currentIndex == 0 &&
            index == 0
          "
          @refresh-suggestions="refreshFeed"
          v-on="$listeners"
        />

        <FeedCard
          v-if="parent != 'notifications'"
          :content="item"
          :parent="parent"
          @see-more="
            [
              updateElementHeights(),
              updateSeeMoreElements(item.action_id || item.content_id),
            ]
          "
          @update-element-heights="updateElementHeights"
          @update-vote="updateVote"
          @add-new-comment="addNewComment"
          @delete-item="deleteItem"
          v-on="$listeners"
        />

        <Notification
          v-if="parent == 'notifications'"
          :notification="item"
          v-on="$listeners"
        />

        <UserSuggestions
          style="margin-top: 24px; margin-bottom: -16px"
          v-if="
            parent == 'home' &&
            store.suggestions.users_suggestions.length &&
            currentIndex <= 6 &&
            index == 6 - currentIndex
          "
          v-on="$listeners"
        />

        <div
          v-if="
            parent == 'home' && currentIndex <= 10 && index == 10 - currentIndex
          "
          class="user-suggestions-container"
          :style="
            is_mobile
              ? 'margin-top: 8px; margin-bottom: -16px;'
              : 'margin-top: 8px; margin-bottom: -16px; width: 1000px;'
          "
        >
          <p style="font-weight: normal; text-align: center">
            Search your friends on FLIBO and connect with them.
          </p>
          <p style="text-align: center">Discover Together</p>
        </div>
      </div>
    </div>

    <div
      v-if="!fetching_feed && !fetching_incremental_feed && !feed_list.length"
      class="no-feed-message"
    >
      {{
        parent == "watchlist"
          ? "Please add some movies & shows to your watchlist."
          : parent == "search_results"
          ? "No movies or shows found."
          : "Feed could not be fetched."
      }}
    </div>

    <div
      class="fetching-feed"
      v-if="fetching_feed || (!feed_list.length && fetching_incremental_feed)"
    >
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
      <br />
      <div v-if="is_string_query" class="quote-font">
        Searching for "{{ store.discover_filters.query }}"
        <br />
        Hold on, good things take time.
      </div>
      <div v-else class="quote-font">
        {{ store.quotes[Math.floor(Math.random() * 22)] }}
      </div>
    </div>

    <div class="fetching-incremental-feed" v-if="fetching_incremental_feed">
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
    </div>

    <SharePrompt
      v-if="share_prompt"
      :parent="parent"
      :url="'https://' + store.hostName + $route.fullPath"
      :profileId="parseInt($route.params.user_id)"
      @close-share-prompt="share_prompt = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import FeedFilters from "./FeedFilters";
import FeedCard from "./FeedCard";
import UserSuggestions from "./UserSuggestions";
import SavePlatforms from "./SavePlatforms";
import SharePrompt from "./../atomic/SharePrompt";
import Button from "./../atomic/Button";
import Notification from "./Notification";
import axios from "axios";

export default {
  name: "app",
  components: {
    FeedFilters,
    FeedCard,
    UserSuggestions,
    SavePlatforms,
    SharePrompt,
    Button,
    Notification,
  },
  props: {
    parent: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: false,
      default: "self",
    },
    userName: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      hide_feed: true,
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      showRefreshButton: true,
      is_string_query: false,
      share_prompt: false,
      feed_mappings: {
        home: {
          contents: "this.$store.state.suggestions.contents",
          feed: "this.$store.state.suggestions.feed_list",
          fetching: "this.$store.state.suggestions.fetching_suggestions",
          fetching_incremental:
            "this.$store.state.suggestions.fetching_feed_incremental",
          content_filter: "this.$store.state.suggestions.content_type_tab",
          discover_filters: "this.$store.state.suggestions.discover_type_tab",
          platform_filters: null,
          genre_filters: null,
          rating_filter: "this.$store.state.feed.home.rating_tab",
          element_heights: "this.$store.state.feed.home.element_heights",
          see_more_elements: "this.$store.state.feed.home.see_more_elements",
        },
        search_results: {
          contents: "this.$store.state.discover_filters.filtered_content",
          feed: "this.$store.state.feed.search_results.feed_list",
          fetching: "this.$store.state.discover_filters.fetching_filtered",
          fetching_incremental:
            "this.$store.state.discover_filters.fetching_filter_incremental",
          content_filter: "this.$store.state.discover_filters.content_type_tab",
          discover_filters:
            "this.$store.state.discover_filters.discover_type_tab",
          platform_filters: null,
          genre_filters: null,
          rating_filter: null,
          element_heights:
            "this.$store.state.feed.search_results.element_heights",
          see_more_elements:
            "this.$store.state.feed.search_results.see_more_elements",
        },
        watchlist: {
          contents: "this.$store.state.feed.watchlist.contents",
          feed: "this.$store.state.feed.watchlist.feed_list",
          fetching: "this.$store.state.feed.watchlist.fetching",
          fetching_incremental:
            "this.$store.state.feed.watchlist.fetching_incremental",
          content_filter: "this.$store.state.feed.watchlist.content_type_tab",
          discover_filters:
            "this.$store.state.feed.watchlist.discover_type_tab",
          platform_filters: "this.$store.state.feed.watchlist.platforms",
          genre_filters: "this.$store.state.feed.watchlist.genres",
          rating_filter: null,
          element_heights: "this.$store.state.feed.watchlist.element_heights",
          see_more_elements:
            "this.$store.state.feed.watchlist.see_more_elements",
        },
        ratings: {
          contents: "this.$store.state.feed.ratings.contents",
          feed: "this.$store.state.feed.ratings.feed_list",
          fetching: "this.$store.state.feed.ratings.fetching",
          fetching_incremental:
            "this.$store.state.feed.ratings.fetching_incremental",
          content_filter: "this.$store.state.feed.ratings.content_type_tab",
          discover_filters: "this.$store.state.feed.ratings.discover_type_tab",
          platform_filters: "this.$store.state.feed.ratings.platforms",
          genre_filters: "this.$store.state.feed.ratings.genres",
          rating_filter: "this.$store.state.feed.ratings.rating_tab",
          element_heights: "this.$store.state.feed.ratings.element_heights",
          see_more_elements: "this.$store.state.feed.ratings.see_more_elements",
        },
        posts: {
          contents: "this.$store.state.feed.posts.contents",
          feed: "this.$store.state.feed.posts.feed_list",
          fetching: "this.$store.state.feed.posts.fetching",
          fetching_incremental:
            "this.$store.state.feed.posts.fetching_incremental",
          content_filter: "this.$store.state.feed.posts.content_type_tab",
          discover_filters: "this.$store.state.feed.posts.discover_type_tab",
          platform_filters: null,
          genre_filters: null,
          rating_filter: null,
          element_heights: "this.$store.state.feed.posts.element_heights",
          see_more_elements: "this.$store.state.feed.posts.see_more_elements",
        },
        notifications: {
          contents: "this.$store.state.feed.notifications.contents",
          feed: "this.$store.state.feed.notifications.feed_list",
          fetching: "this.$store.state.feed.notifications.fetching",
          fetching_incremental:
            "this.$store.state.feed.notifications.fetching_incremental",
          content_filter: null,
          discover_filters: null,
          platform_filters: null,
          genre_filters: null,
          rating_filter: null,
          element_heights:
            "this.$store.state.feed.notifications.element_heights",
        },
        suggestions: {
          contents: "this.$store.state.feed.suggestions.contents",
          feed: "this.$store.state.feed.suggestions.feed_list",
          fetching: "this.$store.state.feed.suggestions.fetching",
          fetching_incremental:
            "this.$store.state.feed.suggestions.fetching_incremental",
          content_filter: "this.$store.state.feed.suggestions.content_type_tab",
          discover_filters:
            "this.$store.state.feed.suggestions.discover_type_tab",
          platform_filters: "this.$store.state.feed.suggestions.platforms",
          genre_filters: "this.$store.state.feed.suggestions.genres",
          rating_filter: null,
          element_heights: "this.$store.state.feed.suggestions.element_heights",
          see_more_elements:
            "this.$store.state.feed.suggestions.see_more_elements",
        },
      },
      observer: null,
      mainContainer: ".feed-cards-container",
      containerTile: "feed-card-tile",
      stopCheck: false,
      topSentinelPreviousY: this.$store.state.feed.topSentinelPreviousY,
      topSentinelPreviousRatio: this.$store.state.feed.topSentinelPreviousRatio,
      bottomSentinelPreviousY: this.$store.state.feed.bottomSentinelPreviousY,
      bottomSentinelPreviousRatio: this.$store.state.feed
        .bottomSentinelPreviousRatio,
      defaultListSize:
        this.parent == "notifications"
          ? 50
          : this.$store.state.feed.defaultListSize,
      listThreshold:
        this.parent == "notifications"
          ? 30
          : this.$store.state.feed.listThreshold,
      first_obervation: true,
      updating_dom: false,
      scroll: {
        updating: false,
        paddingTop: 0,
        paddingBottom: 0,
        scrollPosition: 0,
      },
    };
  },
  created() {
    var self = this;
    document.addEventListener(
      "visibilitychange",
      this.resetIntersectionObserver
    );

    if (this.store.discover_filters.is_string_query) {
      this.is_string_query = true;
      this.store.discover_filters.is_string_query = false;
    }

    if (
      self.parent == "home" &&
      self.store.suggestions.discover_while_onboarding
    ) {
      self.store.suggestions.discover_while_onboarding = false;
      setTimeout(() => {
        this.$router.push("/suggestions?refresh=true");
        this.refreshFeed();
      }, 0);
    } else if (this.listSize || this.contentsCount) {
      this.$nextTick(function () {
        setTimeout(function () {
          if (
            !self.updating_dom &&
            !eval(
              self.feed_mappings[self.parent].fetching.replace("this.", "self.")
            )
          ) {
            self.updating_dom = true;

            if (
              eval(
                "self.store.feed." + self.parent + ".apply_filters_on_create"
              )
            ) {
              self.applyFilters();

              setTimeout(function () {
                eval(
                  "self.store.feed." +
                    self.parent +
                    ".apply_filters_on_create = false"
                );

                self.updatePadding();

                self.updating_dom = false;
                self.updateElementHeights();
              }, 0);
            } else {
              self.updatePadding();

              self.updating_dom = false;
              self.updateElementHeights();
            }
          }
        }, 0);
      });
    }
  },
  mounted() {
    window.addEventListener("scroll", this.watchScroll);
  },
  beforeDestroy() {
    this.beforeLeaving();
    document.removeEventListener(
      "visibilitychange",
      this.resetIntersectionObserver
    );
  },
  computed: {
    ifUpdateDom() {
      return this.$store.state.feed.update_dom;
    },
    ifApplyFilters() {
      return this.$store.state.feed_filters.apply_filters_wo_reset;
    },
    fetching_feed() {
      return eval(this.feed_mappings[this.parent].fetching);
    },
    fetching_incremental_feed() {
      return eval(this.feed_mappings[this.parent].fetching_incremental);
    },
    currentIndex() {
      return eval(
        "this.$store.state.feed." + this.parent + ".observer_current_index"
      );
    },
    feed_list() {
      return eval(this.feed_mappings[this.parent].feed);
    },
    DBSize() {
      return this.parent_feed_list.length;
    },
    listSize() {
      return Math.min(
        this.defaultListSize,
        eval(this.feed_mappings[this.parent].feed).length
      );
    },
    contentsCount() {
      return eval(this.feed_mappings[this.parent].contents).length;
    },
    div_height() {
      var elems = document.getElementsByClassName(this.containerTile);
      if (elems.length) {
        return elems[0].getBoundingClientRect().height;
      } else {
        return 0;
      }
    },
    parent_feed_list() {
      const output_list = [];

      if (this.feed_mappings[this.parent].content_filter != null) {
        var content_type_tab = eval(
          this.feed_mappings[this.parent].content_filter
        );
      } else {
        var content_type_tab = ["pass_check"];
      }

      if (this.feed_mappings[this.parent].rating_filter != null) {
        var rating_tab = eval(this.feed_mappings[this.parent].rating_filter);
      } else {
        var rating_tab = ["pass_check"];
      }

      if (this.feed_mappings[this.parent].discover_filters != null) {
        var discover_type_tab = eval(
          this.feed_mappings[this.parent].discover_filters
        ).slice();

        if (
          this.parent == "search_results" &&
          JSON.stringify(discover_type_tab) != JSON.stringify(["flibo"])
        ) {
          discover_type_tab.push("pass_check");
        }
      } else {
        var discover_type_tab = ["pass_check"];
      }

      if (
        this.feed_mappings[this.parent].platform_filters != null &&
        eval(this.feed_mappings[this.parent].platform_filters).length
      ) {
        var platform_count_check = 0;
      } else {
        var platform_count_check = -100;
      }

      if (
        this.feed_mappings[this.parent].genre_filters != null &&
        eval(this.feed_mappings[this.parent].genre_filters).length
      ) {
        var genre_count_check = 0;
      } else {
        var genre_count_check = -100;
      }

      var feed_contents = eval(this.feed_mappings[this.parent].contents);
      var feed_item;
      for (feed_item in feed_contents) {
        if (
          content_type_tab.includes(
            feed_contents[feed_item].type || "pass_check"
          ) &&
          rating_tab.includes(
            feed_contents[feed_item].creator_rating || "pass_check"
          ) &&
          discover_type_tab.includes(
            feed_contents[feed_item].feed_type || "pass_check"
          ) &&
          (typeof feed_contents[feed_item].platform_count != "undefined"
            ? feed_contents[feed_item].platform_count
            : 1) != platform_count_check &&
          (typeof feed_contents[feed_item].genre_count != "undefined"
            ? feed_contents[feed_item].genre_count
            : 1) != genre_count_check
        ) {
          output_list.push(feed_contents[feed_item]);
        }
      }

      return output_list;
    },
  },
  watch: {
    ifUpdateDom: {
      handler(update) {
        var self = this;
        if (update && !this.updating_dom) {
          this.updating_dom = true;

          if (
            this.parent == "home" &&
            JSON.stringify(this.$store.state.suggestions.discover_type_tab) ==
              '["flibo"]'
          ) {
            this.applyQuickFilters();
          } else {
            this.applyFilters();
            this.updatePadding();
          }

          this.updating_dom = false;
          this.$store.state.feed.update_dom = false;
        }
      },
    },
    ifApplyFilters: {
      handler(apply) {
        if (apply) {
          this.applyFilters();
          this.$store.state.feed_filters.apply_filters_wo_reset = false;
        }
      },
    },
    feed_list: {
      handler(param) {
        this.$nextTick(() => {
          this.updateElementHeights();
        });
      },
    },
  },
  methods: {
    resetIntersectionObserver() {
      if (document.hidden) {
        this.beforeLeaving();
      } else {
        window.addEventListener("scroll", this.watchScroll);
        if (this.observer == null) {
          this.updatePadding();
        }
      }
    },
    updateElementHeights() {
      var self = this;

      var dom_elem_heights = {};
      for (var i in eval(self.feed_mappings[self.parent].element_heights)) {
        dom_elem_heights[i] = eval(
          self.feed_mappings[self.parent].element_heights
        )[i];
      }

      for (let j = 0; j < self.listSize; j++) {
        var elem = document.querySelector(`#${self.containerTile}-${j}`);
        dom_elem_heights[
          elem.getAttribute("action-id")
        ] = elem.getBoundingClientRect().height;
      }

      eval(
        self.feed_mappings[self.parent].element_heights + " = dom_elem_heights"
      );
    },
    updateSeeMoreElements(actionId) {
      eval(
        this.feed_mappings[this.parent].see_more_elements + ".push(actionId)"
      );
    },
    updatePadding() {
      const container = document.querySelector(this.mainContainer);
      if (container != null) {
        container.style.paddingTop =
          eval("this.$store.state.feed." + this.parent + ".padding_top") + "px";
        container.style.paddingBottom =
          eval("this.$store.state.feed." + this.parent + ".padding_bottom") +
          "px";
      }

      const filters = document.querySelector(".quick-filters-container");
      if (filters != null) {
        filters.style.padding = "8px 16px";
      }

      this.scrollToLastPosition();
    },
    scrollToLastPosition() {
      var self = this;

      self.$nextTick(function () {
        window.scrollTo(
          0,
          eval("self.$store.state.feed." + self.parent + ".scroll_position")
        );
        self.hide_feed = false;

        self.initIntersectionObserver();
      });

      if (self.hide_feed) {
        self.hide_feed = false;
      }
    },
    applyQuickFilters() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      var reset_info = {
        parent: this.parent,
        filters: false,
        skip_suggestions_filter: false,
        scroll: true,
        paddings: true,
        observer_current_index: true,
        element_heights: false,
      };
      this.$emit("reset-feed-page", reset_info);

      this.applyFilters();

      this.updatePadding();
    },
    applyFilters() {
      var self = this;

      var filtered_platforms = [];
      if (
        this.feed_mappings[this.parent].platform_filters != null &&
        eval(this.feed_mappings[this.parent].platform_filters).length
      ) {
        var platforms_applied = eval(
          this.feed_mappings[this.parent].platform_filters
        );
        var platform;
        for (platform in platforms_applied) {
          filtered_platforms.push(
            platforms_applied[platform].platform_name
              .replace(/\s+/g, "_")
              .toLowerCase()
          );
        }
      }

      var filtered_genres = [];
      if (
        this.feed_mappings[this.parent].genre_filters != null &&
        eval(this.feed_mappings[this.parent].genre_filters).length
      ) {
        var genres_applied = eval(
          this.feed_mappings[this.parent].genre_filters
        );
        var genre;
        for (genre in genres_applied) {
          filtered_genres.push(genres_applied[genre].genre_name);
        }
      }

      var feed_contents = eval(this.feed_mappings[this.parent].contents);

      var feed_item;
      for (feed_item in feed_contents) {
        var platform_count = 0;
        for (platform in filtered_platforms) {
          if (
            JSON.stringify(
              feed_contents[feed_item].image_info &&
                feed_contents[feed_item].image_info.where_to_watch
                ? feed_contents[feed_item].image_info.where_to_watch
                : feed_contents[feed_item].where_to_watch
                ? feed_contents[feed_item].where_to_watch
                : null
            ).includes(filtered_platforms[platform])
          ) {
            platform_count++;
          }
        }
        feed_contents[feed_item].platform_count = platform_count;

        var genre_count = 0;
        for (genre in feed_contents[feed_item].genres) {
          var index = filtered_genres.indexOf(
            feed_contents[feed_item].genres[genre]
          );
          if (index > -1) {
            genre_count++;
          }
        }
        feed_contents[feed_item].genre_count = genre_count;
      }

      function compare(a, b) {
        if (
          a.genre_count + ("0" + a.platform_count).slice(-2) >
          b.genre_count + ("0" + b.platform_count).slice(-2)
        ) {
          return -1;
        }
        if (
          a.genre_count + ("0" + a.platform_count).slice(-2) ==
          b.genre_count + ("0" + b.platform_count).slice(-2)
        ) {
          return 0;
        }
        return 1;
      }

      eval(
        this.feed_mappings[this.parent].contents +
          " = " +
          this.feed_mappings[this.parent].contents +
          ".sort(compare)"
      );

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;

        eval(
          this.feed_mappings[this.parent].feed +
            " = this.parent_feed_list.slice(0, this.defaultListSize)"
        );

        this.$nextTick(function () {
          self.initIntersectionObserver();
        });
      } else {
        eval(
          this.feed_mappings[this.parent].feed +
            " = this.parent_feed_list.slice(0, this.defaultListSize)"
        );
      }
    },
    refreshFeed() {
      this.hide_feed = true;

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.scroll.paddingTop = 0;
      this.scroll.paddingBottom = 0;
      this.scroll.scrollPosition = 0;

      if (this.parent != "suggestions") {
        var reset_info = {
          parent: this.parent,
          filters: true,
          skip_suggestions_filter: false,
          scroll: true,
          paddings: true,
          observer_current_index: true,
          element_heights: true,
        };
        this.$emit("reset-feed-page", reset_info);

        this.$emit("refresh-feed");
      }
    },
    watchScroll() {
      var self = this;
      var scroll_completion =
        window.scrollY /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight);
      if (
        document.documentElement.scrollHeight ==
        document.documentElement.clientHeight
      ) {
        scroll_completion = 1;
      }

      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition < 0) {
        return;
      }
      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - self.lastScrollPosition) < 0) {
        return;
      }
      if (self.store.letNavAutoHide) {
        self.showRefreshButton =
          currentScrollPosition < self.lastScrollPosition;
        self.lastScrollPosition = currentScrollPosition;
        if ([NaN, 0, 1].includes(scroll_completion)) {
          setTimeout((self.showRefreshButton = true), 0);
        }
      } else {
        self.showRefreshButton = false;
      }

      if (!this.scroll.updating) {
        this.scroll.updating = true;

        const container = document.querySelector(this.mainContainer);
        if (container != null) {
          this.scroll.paddingTop = this.getNumFromStyle(
            container.style.paddingTop
          );
          this.scroll.paddingBottom = this.getNumFromStyle(
            container.style.paddingBottom
          );
          this.scroll.scrollPosition = window.scrollY;
        }

        this.scroll.updating = false;
      }
    },
    beforeLeaving() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      eval(
        "this.$store.state.feed." +
          this.parent +
          ".padding_top = this.scroll.paddingTop"
      );
      eval(
        "this.$store.state.feed." +
          this.parent +
          ".padding_bottom = this.scroll.paddingBottom"
      );
      eval(
        "this.$store.state.feed." +
          this.parent +
          ".scroll_position = this.scroll.scrollPosition"
      );

      window.removeEventListener("scroll", this.watchScroll);
    },
    addNewComment(newComment) {
      var quickComment = newComment.creator_name + "^" + newComment.comment;
      for (let item of eval(this.feed_mappings[this.parent].contents)) {
        if (item.action_id == newComment.action_id) {
          if (item.newComments) {
            item.newComments.push(quickComment);
          } else {
            item.newComments = [quickComment];
          }

          if (item.total_comments != null) {
            item.total_comments++;
          } else {
            item.total_comments = 1;
          }

          this.$nextTick(() => {
            this.updateElementHeights();
          });

          return;
        }
      }
    },
    updateVote(vote) {
      for (let item of eval(this.feed_mappings[this.parent].contents)) {
        if (item.action_id == vote.actionId) {
          if (vote.type == "user") {
            item.user_vote = vote.vote;
          } else if (vote.type == "total") {
            item.upvotes = vote.vote;
          }

          return;
        }
      }
    },
    deleteItem(card) {
      for (let [index, item] of eval(
        this.feed_mappings[this.parent].contents
      ).entries()) {
        if (item.action_id == card.actionId) {
          eval(this.feed_mappings[this.parent].contents + ".splice(index, 1)");

          this.recycleDOM(
            eval(
              "this.$store.state.feed." +
                this.parent +
                ".observer_current_index"
            ),
            true
          );
          this.updateElementHeights();

          return;
        }
      }
    },
    updateSeenList(entry) {
      if (entry.intersectionRatio == 1) {
        var elemId = parseInt(entry.target.id.split("-").pop());

        var elem = null;
        var actionId;
        var actionIds = [];
        for (let i = elemId - 4; i <= elemId; i++) {
          elem = document.querySelector(`#${this.containerTile}-${i}`);
          if (elem) {
            actionId = parseInt(elem.getAttribute("action-id"));
            if (
              !eval(
                "this.$store.state.feed." + this.parent + ".seenElements"
              ).includes(actionId)
            ) {
              eval(
                "this.$store.state.feed." +
                  this.parent +
                  ".seenElements.push(actionId)"
              );
              actionIds.push(actionId);
            }
          }
        }

        if (actionIds.length) {
          axios.post(this.$store.state.api_host + "mark_posts_as_seen", {
            session_id: this.$store.state.session_id,
            action_ids: actionIds,
          });
        }
      }
    },

    // Functions for infinite scroll
    elementsTotalHeight(startIndex, endIndex) {
      var totalHeight = 0;
      for (let i = startIndex; i < endIndex; i++) {
        totalHeight += eval(this.feed_mappings[this.parent].element_heights)[
          this.parent_feed_list[i].action_id ||
            this.parent_feed_list[i].notification_id ||
            this.parent_feed_list[i].content_id
        ];
      }
      return totalHeight;
    },
    getPaddingChange(isScrollDown, paddingFor, newFirstIndex) {
      var currentFirstIndex = eval(
        "this.$store.state.feed." + this.parent + ".observer_current_index"
      );
      if (isScrollDown && paddingFor == "top") {
        return this.elementsTotalHeight(currentFirstIndex, newFirstIndex);
      } else if (isScrollDown && paddingFor == "bottom") {
        return this.elementsTotalHeight(
          currentFirstIndex + this.listSize,
          newFirstIndex + this.listSize
        );
      } else if (!isScrollDown && paddingFor == "top") {
        return this.elementsTotalHeight(newFirstIndex, currentFirstIndex);
      } else if (!isScrollDown && paddingFor == "bottom") {
        return this.elementsTotalHeight(
          newFirstIndex + this.listSize,
          currentFirstIndex + this.listSize
        );
      }
    },

    getSlidingWindow(isScrollDown) {
      let firstIndex;
      let increment;
      if (
        eval(
          "this.$store.state.feed." + this.parent + ".observer_current_index"
        ) +
          this.listThreshold >
        this.DBSize - this.listSize
      ) {
        if (isScrollDown) {
          increment = (this.DBSize - this.listSize) % this.listThreshold;
        } else {
          increment = this.listThreshold;
        }
      } else {
        increment = this.listThreshold;
      }

      if (isScrollDown) {
        firstIndex =
          eval(
            "this.$store.state.feed." + this.parent + ".observer_current_index"
          ) + increment;
      } else {
        firstIndex =
          eval(
            "this.$store.state.feed." + this.parent + ".observer_current_index"
          ) - increment;
      }
      if (firstIndex < 0) {
        firstIndex = 0;
      }

      return firstIndex;
    },

    recycleDOM(firstIndex, isAfterDelete = false) {
      var output = [];
      for (let i = 0; i < this.listSize; i++) {
        output.push(this.parent_feed_list[i + firstIndex]);
      }

      if (isAfterDelete) {
        output = output.filter((item) => item);

        if (firstIndex > 0 && output.length < this.listSize) {
          output = [];
          eval(
            "this.$store.state.feed." +
              this.parent +
              ".observer_current_index = this.$store.state.feed." +
              this.parent +
              ".observer_current_index - 1"
          );

          const container = document.querySelector(this.mainContainer);
          const currentPaddingTop = this.getNumFromStyle(
            container.style.paddingTop
          );
          container.style.paddingTop =
            currentPaddingTop -
            eval(this.feed_mappings[this.parent].element_heights)[
              this.parent_feed_list[firstIndex - 1].action_id
            ] +
            "px";

          for (let i = 0; i < this.listSize; i++) {
            output.push(this.parent_feed_list[i + firstIndex - 1]);
          }
          output = output.filter((item) => item);
        }
      }

      eval(this.feed_mappings[this.parent].feed + " = output.slice()");
    },

    getNumFromStyle: (numStr) => Number(numStr.substring(0, numStr.length - 2)),

    adjustPaddings(firstIndex, isScrollDown, isEndCase = false) {
      this.updateElementHeights();
      const container = document.querySelector(this.mainContainer);

      const currentPaddingTop = this.getNumFromStyle(
        container.style.paddingTop
      );
      const currentPaddingBottom = this.getNumFromStyle(
        container.style.paddingBottom
      );

      var remPaddingsTop = this.getPaddingChange(
        isScrollDown,
        "top",
        firstIndex
      );
      var remPaddingsBottom = this.getPaddingChange(
        isScrollDown,
        "bottom",
        firstIndex
      );

      // console.log(
      //   "Top padding difference in elements -",
      //   remPaddingsTop / this.div_height
      // );
      // console.log(
      //   "Bottom padding difference in elements -",
      //   remPaddingsBottom / this.div_height
      // );
      // console.log(
      //   "Current padding top in elements -",
      //   currentPaddingTop / this.div_height
      // );
      // console.log(
      //   "Current padding bottom in elements -",
      //   currentPaddingBottom / this.div_height
      // );

      if (isScrollDown) {
        container.style.paddingTop = currentPaddingTop + remPaddingsTop + "px";
        container.style.paddingBottom =
          currentPaddingBottom === 0
            ? "0px"
            : Math.abs(currentPaddingBottom - remPaddingsBottom) + "px";
      } else {
        container.style.paddingBottom =
          currentPaddingBottom + remPaddingsBottom + "px";
        container.style.paddingTop =
          currentPaddingTop === 0
            ? "0px"
            : Math.abs(currentPaddingTop - remPaddingsTop) + "px";
      }
    },

    topSentCallback(entry) {
      const container = document.querySelector(this.mainContainer);
      if (container != null) {
        if (
          eval(
            "this.$store.state.feed." + this.parent + ".observer_current_index"
          ) === 0 &&
          !this.first_obervation
        ) {
          container.style.paddingTop = "0px";
          container.style.paddingBottom = "0px";
        }
        this.first_obervation = false;

        const currentY = entry.boundingClientRect.top;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;

        // conditional check for Scrolling up
        if (
          isIntersecting &&
          currentRatio >= this.topSentinelPreviousRatio &&
          eval(
            "this.$store.state.feed." + this.parent + ".observer_current_index"
          ) !== 0
        ) {
          let firstIndex = this.getSlidingWindow(false);
          // console.log("---------------------------------");
          // console.log(
          //   "Top current rendered indices -",
          //   eval(
          //     "this.$store.state.feed." +
          //       this.parent +
          //       ".observer_current_index"
          //   ) +
          //     "-" +
          //     (eval(
          //       "this.$store.state.feed." +
          //         this.parent +
          //         ".observer_current_index"
          //     ) +
          //       this.listSize)
          // );
          // console.log("Top new first index - ", firstIndex);

          if (
            firstIndex === 0 &&
            eval(
              "this.$store.state.feed." +
                this.parent +
                ".observer_current_index"
            ) < this.listThreshold
          ) {
            this.adjustPaddings(firstIndex, false, true);
          } else {
            this.adjustPaddings(firstIndex, false);
          }
          this.recycleDOM(firstIndex);
          eval(
            "this.$store.state.feed." +
              this.parent +
              ".observer_current_index = firstIndex"
          );
          this.stopCheck = false;
        }
      }
    },

    botSentCallback(entry) {
      if (
        eval(
          "this.$store.state.feed." + this.parent + ".observer_current_index"
        ) ===
        this.DBSize - this.listSize
      ) {
        return;
      }
      const currentY = entry.boundingClientRect.top;
      const currentRatio = entry.intersectionRatio;
      const isIntersecting = entry.isIntersecting;

      // conditional check for Scrolling down
      if (currentRatio >= this.bottomSentinelPreviousRatio && isIntersecting) {
        let firstIndex = this.getSlidingWindow(true);
        // console.log("---------------------------------");
        // console.log(
        //   "Bottom current first indices -",
        //   eval(
        //     "this.$store.state.feed." + this.parent + ".observer_current_index"
        //   ) +
        //     "-" +
        //     (eval(
        //       "this.$store.state.feed." +
        //         this.parent +
        //         ".observer_current_index"
        //     ) +
        //       this.listSize)
        // );
        // console.log("Bottom new first index - ", firstIndex);

        if (
          eval(
            "this.$store.state.feed." + this.parent + ".observer_current_index"
          ) +
            this.listThreshold >
          this.DBSize - this.listSize
        ) {
          this.adjustPaddings(firstIndex, true, true);
          this.recycleDOM(firstIndex);
          eval(
            "this.$store.state.feed." +
              this.parent +
              ".observer_current_index = firstIndex"
          );
          this.stopCheck = true;
        } else {
          this.adjustPaddings(firstIndex, true);
          this.recycleDOM(firstIndex);
          eval(
            "this.$store.state.feed." +
              this.parent +
              ".observer_current_index = firstIndex"
          );
          this.stopCheck = false;
        }
      }
    },

    initIntersectionObserver() {
      const options = {
        rootMargin: "0px",
        threshold: [0, 1],
      };

      const callback = (entries) => {
        entries.forEach((entry) => {
          if (this.parent == "home") {
            this.updateSeenList(entry);
          }

          if (entry.target.id === this.containerTile + "-0") {
            this.topSentCallback(entry);
          } else if (
            entry.target.id === `${this.containerTile}-${this.listSize - 4}`
          ) {
            if (!this.stopCheck) {
              this.botSentCallback(entry);
            }
          } else if (
            entry.target.id === `${this.containerTile}-${this.listSize - 1}`
          ) {
            if (!this.stopCheck) {
              this.botSentCallback(entry);
            }
          }
        });
      };

      this.observer = new IntersectionObserver(callback, options);
      if (this.listSize) {
        this.stopCheck = false;

        var firstElem = document.querySelector("#" + this.containerTile + "-0");
        if (firstElem) {
          this.observer.observe(firstElem);
        }

        var thirdLastElem = document.querySelector(
          `#${this.containerTile}-${this.listSize - 4}`
        );
        if (thirdLastElem) {
          this.observer.observe(thirdLastElem);
        }

        var lastElem = document.querySelector(
          `#${this.containerTile}-${this.listSize - 1}`
        );
        if (lastElem) {
          this.observer.observe(lastElem);
        }

        var elem = null;
        if (this.parent == "home") {
          for (let i = 0; i < this.listSize; i += 5) {
            if (![0, this.listSize - 4, this.listSize - 1].includes(i)) {
              elem = document.querySelector(`#${this.containerTile}-${i}`);
              if (elem) {
                this.observer.observe(elem);
              }
            }
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.cover-to-hide-initial-scroll {
  position: fixed;
  background-color: white;
  height: calc(100vh - 105px);
  width: 100vw;
  top: 50px;
  z-index: 1000;
}
.quick-filters-container {
  position: fixed;
  top: 50px;
  left: 50%;
  z-index: 1000;
  height: fit-content;
  width: 100%;
  padding: 8px 16px 8px 16px;
  background-color: #ffffff;
  transform: translate3d(-50%, 0%, 0);
  transition: transform 0.55s ease-out;
}
.quick-filters-container.quick-filters-container--hidden {
  transform: translate3d(-50%, -300%, 0);
}
.only-suggestions {
  position: absolute;
  display: flex;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}
.feed-cards-container {
  width: 100%;
  display: inline-grid;
  white-space: nowrap;
  margin-top: 165px;
  padding-bottom: 3%;
  overflow-y: scroll;
  overflow-x: hidden;
}
.feed-card-tile {
  width: 100vw;
  vertical-align: top;
  text-align: left;
  padding-top: 24px;
  padding-bottom: 4px;
  border-bottom: 10px solid #f8f8f8;
}
.fetching-feed {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
  z-index: 1001;
}
.fetching-incremental-feed {
  position: relative;
  margin-top: 45px;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}
.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
  -ms-transform: scale(1.1);
  transform: scale(1.1);
}
.sk-folding-cube .sk-cube:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 225, 225, 0.75);
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
  animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
  -ms-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
  transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
  transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
  transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

@keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

.quote-font {
  font-size: 23px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #adaaaa;
  font-family: "Poiret One", cursive;
}
.user-suggestions-container {
  position: relative;
  text-align: left;
  white-space: nowrap;
  background-color: #fafafa;
  padding: 16px;
}
.user-suggestions-container p {
  position: relative;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  white-space: normal;
}
.no-feed-message {
  position: fixed;
  top: calc(50% + 16px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  z-index: 1001;
}
::-webkit-scrollbar {
  display: none;
}
.refresh-feed {
  width: fit-content;
  margin-left: 50%;
  transform: translateX(-50%) rotate(25deg);
}
</style>