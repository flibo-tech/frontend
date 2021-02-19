<template>
  <div v-on-click-outside="parent != 'search_page' ? clearSearchString : ''">
    <form
      class="search-box"
      :style="parent != 'search_page' ? 'padding: 12px 37px 12px 12px;' : ''"
    >
      <input
        type="text"
        class="search-text"
        v-bind:id="parent + '_search_string'"
        name="search"
        v-bind:placeholder="
          store.session_id == null
            ? 'Search movies based on your mood'
            : parent == 'search_page'
            ? 'Search movies based on mood, users'
            : 'Search Users'
        "
        @keyup="searchString"
        @focus="
          parent == 'search_page'
            ? (updateDummy(),
              $router.push('/search?showSearchSuggestions=true'))
            : ''
        "
        autocomplete="off"
      />
    </form>

    <SpeechRecognition
      v-if="!search_string.length & (parent == 'search_page')"
      class="search-icon"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px + 35px);'"
    />

    <div
      v-if="search_string.length || parent == 'connections'"
      class="search-icons"
      :style="`${parent != 'search_page' ? 'top: 28px;' : ''} ${
        is_mobile ? '' : 'right: calc(50vw - 500px + 35px);'
      }`"
    >
      <button
        class="search-btn-clear-text"
        :style="is_mobile ? '' : 'right: calc(50vw - 500px + 35px);'"
        @click="clearSearchString"
        type="button"
      ></button>

      <div
        v-if="parent == 'search_page'"
        style="border-radius: 4px; overflow: hidden; margin-left: 12px"
      >
        <Button
          buttonType="iconOnly"
          icon="arrow-inverted"
          :size="32"
          @clicked="
            $router.push('/search?search=' + encodeURIComponent(search_string))
          "
        />
      </div>
    </div>

    <div
      class="search-type-tabs"
      :style="is_mobile ? '' : 'width: 900px;left: calc(50vw - 450px);'"
      v-if="
        (is_fetching || search_string != '') &
        (parent == 'search_page') &
        (store.session_id != null)
      "
    >
      <a
        :class="[search_type_tab == 'contents' ? 'is-active' : '']"
        @click="search_type_tab = 'contents'"
        >Contents</a
      >
      <a
        :class="[search_type_tab == 'users' ? 'is-active' : '']"
        @click="search_type_tab = 'users'"
        >Users</a
      >
    </div>

    <div
      :class="is_mobile ? 'filter-contents' : 'desktop-filter-contents'"
      :style="store.session_id == null ? 'top: 80px;' : ''"
      v-if="
        (is_fetching || search_string != '') &&
        search_type_tab == 'contents' &&
        parent == 'search_page'
      "
    >
      <div class="content-items" v-if="content_search_result.length">
        <div
          v-for="(content, index) in content_search_result"
          :key="index"
          class="filter-contents-container"
          :style="
            parent == 'search_page'
              ? is_mobile
                ? ''
                : 'margin-bottom: 10px;padding: 0px;'
              : ''
          "
        >
          <div
            class="filter-content-cropper"
            @click="clickContent(content)"
            :style="
              parent == 'search_page'
                ? is_mobile
                  ? 'width: 55px;min-width: 55px;height: 82.5px;'
                  : 'width: 80px;min-width: 80px;height: 120px;'
                : ''
            "
          >
            <img v-bind:src="content.image" class="filter-content-pic" />
          </div>

          <div class="title-rating-container">
            <div
              class="filter-content-name"
              :style="
                parent == 'search_page'
                  ? is_mobile
                    ? 'font-size: 15px;'
                    : 'font-size: 16px;'
                  : ''
              "
              @click="clickContent(content)"
            >
              {{ content.subject }}
            </div>

            <div style="display: flex">
              <UserRating
                class="search-user-rating-container"
                v-if="parent == 'search_page'"
                :rating="content.rating"
                :iconSize="25"
                @update-rating="
                  (userRating) => {
                    submitRating(
                      content.subject_id,
                      userRating,
                      content.rating,
                      index
                    );
                  }
                "
              />
              <div
                style="width: 100%; margin-left: 8px; cursor: pointer"
                @click="clickContent(content)"
              />
            </div>
          </div>
          <div
            style="width: 100%; cursor: pointer"
            @click="clickContent(content)"
          />
        </div>
        <div
          class="see-more-contents-box"
          v-if="content_search_ids.length"
          @click="fetchMoreContent"
        >
          <div class="see-more-contents">See More</div>
        </div>
      </div>

      <div
        class="searching-content-box"
        v-if="!content_search_result.length && !no_content_found"
      >
        <div
          class="sk-folding-cube"
          style="transform: translateY(-200%) rotateZ(45deg)"
        >
          <div class="sk-cube1 sk-cube"></div>
          <div class="sk-cube2 sk-cube"></div>
          <div class="sk-cube4 sk-cube"></div>
          <div class="sk-cube3 sk-cube"></div>
        </div>
      </div>

      <div v-if="no_content_found" class="no-content-box">
        <div class="no-content-found">No such content found !</div>
        <Button
          buttonType="primary"
          :text="`Search '${
            search_string.length > 10
              ? search_string.slice(0, 10) + '...'
              : search_string
          }'`"
          :capitalize="false"
          padding="8px 16px"
          @clicked="
            $router.push('/search?search=' + encodeURIComponent(search_string))
          "
        />
      </div>
    </div>

    <div
      :class="is_mobile ? 'filter-contents' : 'desktop-filter-contents'"
      :style="parent == 'connections' ? 'top: 76px;' : ''"
      v-if="
        ((is_fetching || search_string != '') && search_type_tab == 'users') ||
        parent == 'connections'
      "
    >
      <div
        class="user-items"
        v-if="user_search_result.length && parent != 'profile'"
      >
        <ImageCard
          v-for="(user, index) in user_search_result"
          :key="index"
          class="filter-users-container"
          :style="
            is_mobile
              ? 'justify-content: flex-start;min-width: 100%;cursor: pointer;'
              : 'justify-content: flex-start;min-width: 100%;margin-top: 0px;padding: 7px;cursor: pointer;'
          "
          @clicked="clickUser(user)"
          :name="user.name"
          :image="user.picture"
          :width="55"
          :height="70"
          position="right"
          :fontSize="15"
          fontWeight="normal"
          :scale="true"
        />
        <div
          class="see-more-users-box"
          v-if="user_ids.length"
          @click="fetchMoreUsers"
        >
          <div class="see-more-users">See More</div>
        </div>
      </div>

      <div
        class="searching-content-box"
        v-if="
          !user_search_result.length && !no_user_found && search_string != ''
        "
      >
        <div
          class="sk-folding-cube"
          style="transform: translateY(-200%) rotateZ(45deg)"
        >
          <div class="sk-cube1 sk-cube"></div>
          <div class="sk-cube2 sk-cube"></div>
          <div class="sk-cube4 sk-cube"></div>
          <div class="sk-cube3 sk-cube"></div>
        </div>
      </div>

      <div v-if="no_user_found" class="no-content-box">
        <div class="no-content-found">No such user found !</div>
      </div>
    </div>

    <DiscoverFilter
      v-if="
        parent == 'search_page' &&
        search_string == '' &&
        !store.discover_filters.filtered_content.length &&
        !$route.query.showSearchSuggestions
      "
      @apply-filter="filterDiscover"
    />

    <div
      v-if="$route.query.showSearchSuggestions && !search_string.length"
      class="search-suggestions"
    >
      <div
        v-for="(item, index) in randomSearchSuggestions"
        :key="index"
        class="search-suggestion"
        @click="$router.push('/search?search=' + encodeURIComponent(item))"
      >
        <div class="search-suggestions-icon" />

        <div class="search-suggestions-text">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
import DiscoverFilter from "./DiscoverFilter";
import UserRating from "./molecular/UserRating";
import ImageCard from "./atomic/ImageCard";
import SpeechRecognition from "./molecular/SpeechRecognition";
import Button from "./atomic/Button";
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  components: {
    DiscoverFilter,
    UserRating,
    ImageCard,
    SpeechRecognition,
    Button,
  },
  mixins: [onClickOutside],
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      search_string: "",
      content_search_result: [],
      content_search_ids: [],
      user_search_result: [],
      user_ids: [],
      is_fetching: false,
      no_content_found: false,
      no_user_found: false,
      filters_meta: this.$store.state.discover_filters.filters_meta,
      filters_temp: this.$store.state.discover_filters.filters_temp,
      filters_applied: this.$store.state.discover_filters.filters_applied,
      store: this.$store.state,
      window_width: window.innerWidth,
      toggle_width: Math.min(window.innerWidth * 0.23, 80),
      search_type_tab: "contents",
      searchSuggestions: [
        "heartwarming movies on netflix",
        "movies with sad endings",
        "movies to watch after breakup",
        "shows involving drugs on my platforms",
        "coming of age shows on my apps",
        "most thrilling movies ever",
        "best french movies",
        "shows like dark",
        "movies full of emotions",
        "motivation movies for gym",
        "best basketball movies",
        "emotional movies on netflix",
        "movies for couples on my subscriptions",
        "movies about failing relationships",
        "movies about families",
        "greatest animated films of all time",
        "beautiful teenage romance movies",
        "movies like Interstellar",
        "visually stunning movies of all time",
        "best shows ever",
        "shows with female leads",
        "superhero tv shows",
        "best german tv shows",
        "historical tv shows",
        "historical tv shows",
        "best sci-fi shows on my apps",
        "shows like westworld",
        "shows like sense 8",
        "best european movies ever",
        "movies with non linear narrative",
        "best old movies",
        "movies with great actions",
        "movies about racing",
        "movies about middle ages",
        "movies about youth",
        "best outer space movies",
      ],
      dummy: 1,
    };
  },
  props: {
    parent: {
      type: String,
      required: false,
      default: "search_page",
    },
    parent_content_type: {
      type: String,
      required: false,
    },
    search_query: {
      type: String,
      required: false,
    },
  },
  created() {
    this.manageSearchPageState();
  },
  mounted() {
    if (!this.is_mobile && this.parent != "search_page") {
      document.getElementById(this.parent + "_search_string").focus();
    }
  },
  watch: {
    search_query: {
      handler: function (query) {
        this.manageSearchPageState();
      },
    },
    showSearchSuggestions: {
      handler: function (val) {
        if (!val) {
          document.getElementById(this.parent + "_search_string").blur();
        }
      },
    },
    search_string: {
      handler: function (val) {
        if (val == "") {
          this.is_fetching = false;
        }
      },
    },
  },
  computed: {
    randomSearchSuggestions() {
      this.dummy;
      return this.searchSuggestions.sort(() => Math.random() - 0.5);
    },
    showSearchSuggestions() {
      return this.$route.query.showSearchSuggestions;
    },
  },
  methods: {
    updateDummy() {
      this.dummy = Math.random();
    },
    clearSearchString() {
      if (this.search_string == "" && this.parent == "connections") {
        this.$router.push("/connections");
      } else {
        this.search_string = "";
        this.content_search_result = [];
        this.user_search_result = [];
        this.is_fetching = false;
        document.getElementById(this.parent + "_search_string").value = "";
        document.getElementById(this.parent + "_search_string").focus();
      }
    },
    searchString() {
      var self = this;
      clearTimeout(self.timeout);
      self.search_string = document.getElementById(
        self.parent + "_search_string"
      ).value;
      self.timeout = setTimeout(function () {
        if (self.search_string) {
          self.content_search_result = [];
          self.user_search_result = [];
          self.is_fetching = true;

          self.no_content_found = false;
          axios
            .post(self.$store.state.api_host + "live_search", {
              session_id: self.$store.state.session_id,
              string: self.search_string,
              search_type:
                self.parent == "profile" ? self.parent_content_type : "content",
              guest_id: self.$store.state.guest_id,
            })
            .then(function (response) {
              if (response.status == 200) {
                self.content_search_result = response.data.result.contents;
                self.content_search_ids =
                  response.data.result.content_search_ids;
                self.no_content_found = false;

                if (self.content_search_result.length == 0) {
                  self.no_content_found = true;
                }
              } else if (response.status == 204) {
                self.no_content_found = true;
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
          if (
            self.parent != "profile" &&
            self.$store.state.session_id != null
          ) {
            self.no_user_found = false;
            axios
              .post(self.$store.state.api_host + "search_friend", {
                session_id: self.$store.state.session_id,
                name_string: self.search_string,
              })
              .then(function (response) {
                if (response.status == 200) {
                  self.user_search_result = response.data.users;
                  self.user_ids = response.data.user_ids;
                  self.no_user_found = false;

                  if (self.user_search_result.length == 0) {
                    self.no_user_found = true;
                  }
                } else if (response.status == 204) {
                  self.no_user_found = true;
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

            self.is_fetching = false;
          }
        } else {
          self.content_search_result = [];
          self.user_search_result = [];
        }
      }, 500);
    },
    clickContent(content) {
      if (this.parent == "search_page") {
        this.clearSearchString();
        this.$store.state.content_page.origin = "search";
        this.$router.push(
          "/content/" +
            content.subject_id +
            "/" +
            content.subject.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
        );
      } else if (this.parent == "profile") {
        this.$emit("add-content", content);
      }
    },
    clickUser(user) {
      this.clearSearchString();
      this.$router.push(
        "/profile/" +
          user.id +
          "/" +
          user.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    fetchMoreContent() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "get_searched_contents", {
          session_id: self.$store.state.session_id,
          content_search_ids: self.content_search_ids.slice(0, 10),
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.content_search_result.push(...response.data.contents);
            self.content_search_ids.splice(0, 10);
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
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
    fetchMoreUsers() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "get_searched_friends", {
          session_id: self.$store.state.session_id,
          user_ids: self.user_ids.slice(0, 10),
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.user_search_result.push(...response.data.users);
            self.user_ids.splice(0, 10);
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
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
    submitRating(content_id, user_rating, prev_rating, index) {
      if (this.$store.state.session_id != null) {
        this.content_search_result[index].rating = user_rating;
        var self = this;
        axios
          .post(this.$store.state.api_host + "submit_rating", {
            session_id: this.$store.state.session_id,
            content_ids: [content_id],
            rating: user_rating,
            privacy: this.$store.state.user.profile.profile_status || "public",
          })
          .then(function (response) {
            var index = self.$store.state.suggestions.rate_counter.indexOf(
              content_id
            );
            if (index == -1) {
              self.$store.state.suggestions.rate_counter.push(content_id);
              if (
                self.$store.state.suggestions.rate_counter.length ==
                self.$store.state.suggestions.calc_after
              ) {
                self.$store.state.suggestions.rate_counter = [];
                axios
                  .post(
                    self.$store.state.ai_host +
                      "calculate_contents_to_recommend",
                    {
                      session_id: self.$store.state.session_id,
                    }
                  )
                  .then(function (response) {
                    if (response.data.notify) {
                      self.$store.state.notifications.notifications = 1;
                    }
                  });
              }
            }
          })
          .catch(function (error) {
            self.content_search_result[index].rating = prev_rating;

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
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    filterDiscover() {
      this.$store.state.discover_filters.filtered_content = [];
      this.filters_applied.artists = this.filters_temp.artists.slice();
      this.filters_applied.genres = this.filters_temp.genres.slice();
      this.filters_applied.years = this.filters_temp.years.slice();
      this.filters_applied.tags = this.filters_temp.tags.slice();
      this.filters_applied.platforms = this.filters_temp.platforms.slice();
      this.filters_applied.awards = this.filters_temp.awards.slice();
      this.filters_applied.nominations = this.filters_temp.nominations;
      this.filters_applied.rating = this.filters_temp.rating;
      this.filters_applied.runtime = this.filters_temp.runtime;
      this.filters_applied.languages = this.filters_temp.languages.slice();
      this.filters_applied.tab = this.filters_temp.tab;

      var self = this;

      if (
        self.filters_applied.tab == "Connections" ||
        self.filters_applied.artists.length ||
        self.filters_applied.genres.length ||
        self.filters_applied.years.length ||
        self.filters_applied.awards.length ||
        self.filters_applied.platforms.length ||
        self.filters_applied.rating != "10" ||
        self.filters_applied.runtime != "180" ||
        self.filters_applied.languages.length
      ) {
        var reset_info = {
          parent: "search_results",
          filters: true,
          skip_suggestions_filter: false,
          scroll: true,
          paddings: true,
          observer_current_index: true,
          element_heights: true,
        };
        this.$emit("reset-feed-page", reset_info);

        this.$store.state.discover_filters.content_type_tab = ["movie", "tv"];
        this.$store.state.scroll_positions.discover.filter = 0;
        this.$router.push("/search-results");
        this.$store.state.discover_filters.fetching_filtered = true;
        var master_ids = [];

        var artist;
        for (artist in this.filters_applied.artists) {
          master_ids.push(this.filters_applied.artists[artist].live_search_id);
        }

        var tag;
        for (tag in this.filters_applied.tags) {
          master_ids.push(this.filters_applied.tags[tag].live_search_id);
        }

        var platforms = [];
        var platform;
        for (platform in this.filters_applied.platforms) {
          platforms.push(
            this.filters_applied.platforms[platform].platform_name
          );
        }

        var genres = [];
        var genre;
        for (genre in this.filters_applied.genres) {
          genres.push(this.filters_applied.genres[genre].genre_name);
        }

        var languages = [];
        var language;
        for (language in this.filters_applied.languages) {
          languages.push(this.filters_applied.languages[language].name);
        }

        var awards = [];
        var award;
        for (award in this.filters_applied.awards) {
          awards.push(this.filters_applied.awards[award].award_name);
        }

        var years = [];
        var year;
        for (year in this.filters_applied.years) {
          years.push(this.filters_applied.years[year].decade_name);
        }

        var feed_type;
        if (self.filters_applied.tab == "All") {
          feed_type = "all";
        } else if (self.filters_applied.tab == "Connections") {
          feed_type = "friends";
        } else if (self.filters_applied.tab == "Suggestions") {
          feed_type = "flibo";
        }

        axios
          .post(self.$store.state.api_host + "filter_content_to_discover", {
            session_id: self.$store.state.session_id,
            master_ids: master_ids,
            genres: genres,
            time_periods: years,
            platforms: platforms,
            awards: awards,
            nominations: self.filters_applied.nominations,
            rating: parseFloat(self.filters_applied.rating) / 10,
            runtime: parseInt(self.filters_applied.runtime),
            languages: languages,
            feed_type: feed_type,
            country:
              self.$store.state.user.profile.country ||
              self.$store.state.guest_country,
            guest_id: self.$store.state.guest_id,
          })
          .then(function (response) {
            if (self.$store.state.discover_filters.query == null) {
              if ([200].includes(response.status)) {
                if (self.$route.path == "/search-results") {
                  self.$store.state.discover_filters.filtered_content =
                    response.data.contents;
                  self.$store.state.feed.search_results.feed_list = self.$store.state.discover_filters.filtered_content.slice(
                    0,
                    self.$store.state.feed.defaultListSize
                  );
                  if (self.$route.path == "/search-results") {
                    self.$store.state.feed.update_dom = true;
                  }
                  self.$store.state.discover_filters.more_filtered_content =
                    response.data.more_contents;
                  self.$store.state.scroll_positions.discover.filter = 0;
                  self.$store.state.discover_filters.last_fetch_time = Date.now();
                  if (
                    self.$store.state.discover_filters.more_filtered_content
                      .length
                  ) {
                    self.fetchRemainingResults();
                  }
                }
              } else if ([204].includes(response.status)) {
                if (self.$route.path == "/search-results") {
                  self.$store.state.discover_filters.filtered_content = [];
                  self.$store.state.discover_filters.more_filtered_content = [];
                  self.$store.state.scroll_positions.discover.filter = 0;
                }
              } else {
                // console.log(response.status);
              }
              self.$store.state.discover_filters.fetching_filtered = false;
            }
          })
          .catch(function (error) {
            if (self.$store.state.discover_filters.query == null) {
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
              self.$store.state.discover_filters.fetching_filtered = false;
            }
          });
      } else {
        // do nothing
      }
    },
    fetchRemainingResults() {
      this.store.discover_filters.fetching_filter_incremental = true;
      var self = this;
      axios
        .post(self.$store.state.api_host + "get_filtered_contents", {
          session_id: self.$store.state.session_id,
          content_ids: self.$store.state.discover_filters.more_filtered_content,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
        })
        .then(function (response) {
          if (
            self.search_query
              ? self.search_query == self.$store.state.discover_filters.query
              : self.$store.state.discover_filters.query == null
          ) {
            if ([200].includes(response.status)) {
              if (self.$route.path != "/search") {
                self.$store.state.discover_filters.filtered_content.push(
                  ...response.data.contents
                );
                self.$store.state.discover_filters.more_filtered_content = [];

                if (self.$route.path == "/search-results") {
                  self.$store.state.feed_filters.apply_filters_wo_reset = true;
                } else if (
                  self.$store.state.feed.search_results.feed_list.length <
                  self.$store.state.feed.defaultListSize
                ) {
                  self.store.feed.search_results.apply_filters_on_create = true;
                }
              }
            } else {
              // console.log(response.status);
            }
            self.store.discover_filters.fetching_filter_incremental = false;
          }
        })
        .catch(function (error) {
          if (
            self.search_query
              ? self.search_query == self.$store.state.discover_filters.query
              : self.$store.state.discover_filters.query == null
          ) {
            self.store.discover_filters.fetching_filter_incremental = false;
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
          }
        });
    },
    manageSearchPageState() {
      var self = this;
      if (
        this.$store.state.current_path == "/search-results" &&
        !this.search_query
      ) {
        this.$store.state.current_path = this.$route.path;
        this.store.discover_filters.filtered_content = [];
        this.store.discover_filters.more_filtered_content = [];
        this.$store.state.feed.search_results.feed_list = [];

        var reset_info = {
          parent: "search_results",
          filters: true,
          skip_suggestions_filter: false,
          scroll: true,
          paddings: true,
          observer_current_index: true,
          element_heights: true,
        };
        this.$emit("reset-feed-page", reset_info);
      } else if (this.parent == "connections") {
        self.timeout = setTimeout(function () {
          document.getElementById(self.parent + "_search_string").value = "";
          document.getElementById(self.parent + "_search_string").focus();
        }, 0);
      } else if (
        this.$store.state.discover_filters.filtered_content.length != 0 &&
        Date.now() - self.$store.state.discover_filters.last_fetch_time <
          30 * 60 * 1000 &&
        !this.search_query
      ) {
        this.$router.push("/search-results");
      } else if (this.parent == "search_page") {
        if (!this.search_query) {
          this.$store.state.current_path = this.$route.path;
          this.filters_applied.artists = [];
          this.filters_applied.genres = [];
          this.filters_applied.years = [];
          this.filters_applied.tags = [];
          this.filters_applied.platforms = [];
          this.filters_applied.awards = [];
          this.filters_applied.nominations = false;
          this.filters_applied.rating = "10";
          this.filters_applied.runtime = "180";
          this.filters_applied.languages = [];
          this.filters_applied.tab = "All";
          this.store.discover_filters.filtered_content = [];
          this.store.discover_filters.more_filtered_content = [];
          this.$store.state.feed.search_results.feed_list = [];

          var reset_info = {
            parent: "search_results",
            filters: true,
            skip_suggestions_filter: false,
            scroll: true,
            paddings: true,
            observer_current_index: true,
            element_heights: true,
          };
          this.$emit("reset-feed-page", reset_info);
        } else {
          var voiceSearch = this.$route.query.voiceSearch;
          this.$router.push("/search");
          this.store.discover_filters.is_string_query = true;
          this.$router.push("/search-results");
          this.$store.state.discover_filters.fetching_filtered = true;

          var reset_info = {
            parent: "search_results",
            filters: true,
            skip_suggestions_filter: false,
            scroll: true,
            paddings: true,
            observer_current_index: true,
            element_heights: true,
          };
          this.$emit("reset-feed-page", reset_info);
          this.store.discover_filters.query = this.search_query;

          var self = this;
          axios
            .post(self.$store.state.api_host + "search_query", {
              session_id: self.$store.state.session_id,
              query_string: self.search_query,
              voice_search: voiceSearch ? true : false,
              country:
                self.$store.state.user.profile.country ||
                self.$store.state.guest_country,
              guest_id: self.$store.state.guest_id,
            })
            .then(function (response) {
              if (
                self.search_query == self.$store.state.discover_filters.query
              ) {
                if ([200].includes(response.status)) {
                  if (self.$route.path == "/search-results") {
                    self.$store.state.feed.search_results.scroll_position = 0;

                    self.$store.state.discover_filters.filtered_content =
                      response.data.contents;
                    self.$store.state.feed.search_results.feed_list = self.$store.state.discover_filters.filtered_content.slice(
                      0,
                      self.$store.state.feed.defaultListSize
                    );
                    if (self.$route.path == "/search-results") {
                      self.$store.state.feed.update_dom = true;
                    }

                    self.$store.state.discover_filters.more_filtered_content =
                      response.data.more_contents;
                    self.$store.state.scroll_positions.discover.filter = 0;
                    self.$store.state.discover_filters.last_fetch_time = Date.now();
                    if (response.data.more_contents.length) {
                      self.fetchRemainingResults();
                    }
                  }
                } else if ([204].includes(response.status)) {
                  if (self.$route.path == "/search-results") {
                    self.$store.state.discover_filters.filtered_content = [];
                    self.$store.state.discover_filters.more_filtered_content = [];
                    self.$store.state.scroll_positions.discover.filter = 0;
                  }
                } else {
                  // console.log(response.status);
                }
                self.$store.state.discover_filters.fetching_filtered = false;
              }
            })
            .catch(function (error) {
              if (
                self.search_query == self.$store.state.discover_filters.query
              ) {
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
                self.$store.state.discover_filters.fetching_filtered = false;
              }
            });
        }
      }
    },
  },
};
</script>

<style lang="scss">
.search-box {
  position: relative;
  width: 95%;
  left: 2.5%;
  top: 15px;
  z-index: 1000000;
  text-align: left;
  border: 2px solid #333333;
  border-radius: 4px;
  padding: 12px 80px 12px 12px;
}
.search-text {
  border: none;
  width: 100%;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.search-icons {
  position: absolute;
  display: flex;
  align-items: center;
  right: 5%;
  top: 24px;
  z-index: 1000000;
}
.search-btn-clear-text {
  display: block;
  height: 23px;
  width: 23px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/close.png");
  background-size: 100% 100%;
}
.search-icon {
  position: fixed;
  right: 8px;
  top: 14px;
  z-index: 1000000;
}
.filter-contents {
  width: 90%;
  white-space: nowrap;
  left: 5%;
  top: 121px;
  bottom: 70px;
  background-color: white;
  z-index: 10000;
  position: fixed;
  overflow-y: scroll;
}
.desktop-filter-contents {
  width: 900px;
  white-space: nowrap;
  left: calc(50vw - 450px);
  top: 121px;
  bottom: 70px;
  background-color: white;
  z-index: 10000;
  position: fixed;
  overflow-y: scroll;
}
.filter-content-cropper {
  width: 40px;
  height: 60px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}
.filter-content-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.title-rating-container {
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  justify-content: space-evenly;
}
.filter-content-name {
  font-size: calc(11px + 0.5vw);
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.filter-contents-container {
  display: flex;
  width: 100%;
  overflow: scroll;
  background-color: #ffffff;
  z-index: 10000;
  padding: 8px 5px;
}
.no-content-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: calc(50vh - 150.5px);
  background: #ffffff;
}
.no-content-found {
  transform: translateY(-100%);
  font-size: 18px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  color: #333333;
}
.contents {
  margin-top: 5px;
  text-align: left;
  font-size: calc(14px + 0.5vw);
  padding: 0.5%;
  color: #868484;
  background-color: #f2f2f2;
  margin-bottom: 1px;
  position: fixed;
  z-index: 100000;
  width: 90%;
}
.see-more-contents-box {
  text-align: center;
  font-size: 14px;
  width: 40%;
  margin-left: 30%;
  height: 30px;
  color: #f3eded;
  background-color: #3366bb;
  margin-bottom: 1%;
  border-radius: 5px;
  margin-top: 1%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.see-more-contents {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.content-items {
}
.searching-content-box {
  margin-top: calc(50vh - 60.5px);
  background: #ffffff;
}
.searching-content {
  transform: translateY(-100%);
  font-size: 18px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  color: #333333;
}
.filter-users-container {
  position: relative;
  vertical-align: top;
  text-align: center;
  background-color: #ffffff;
  z-index: 10000;
  padding: 8px 5px;
}
.no-user {
  width: 77%;
  white-space: nowrap;
  margin-top: 5%;
  background-color: white;
  z-index: 10000;
  position: fixed;
  padding-bottom: 1%;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
.see-more-users-box {
  text-align: center;
  font-size: 14px;
  width: 25%;
  margin-left: 38%;
  height: 30px;
  color: #f3eded;
  background-color: #3366bb;
  margin-bottom: 1%;
  border-radius: 5px;
  margin-top: 1%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.see-more-users {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.user-items {
}
.search-user-rating-container {
  width: 115px;
  min-width: 115px;
  text-align: left;
  background-color: #ffffff;
}
.search-type-tabs {
  margin-top: 20px;
  width: 100%;
  background-color: #ffffff;
  position: fixed;
  overflow: hidden;
  padding: 5px;
  z-index: 100001;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
}
.search-type-tabs a {
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
.search-type-tabs a.is-active {
  font-weight: bold;
}
.search-type-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
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
::-webkit-scrollbar {
  display: none;
}
.search-suggestions {
  display: flex;
  flex-direction: column;
  width: 95%;
  margin-left: 2.5%;
  padding: 8px;
  margin-top: 24px;
  height: calc(100vh - 128px);
  overflow-y: scroll;
}
.search-suggestion {
  display: flex;
  padding: 16px 0;
}
.search-suggestions-icon {
  height: 20px;
  width: 20px;
  margin-right: 16px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/search-icon.svg");
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center;
}
.search-suggestions-text {
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>
