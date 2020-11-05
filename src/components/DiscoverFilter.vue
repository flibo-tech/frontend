<template>
  <div
    :class="
      is_mobile
        ? 'discover-filters-container'
        : 'desktop-discover-filters-container'
    "
    :style="store.is_webview & is_mobile ? 'padding-bottom: 80px;' : ''"
    v-if="store.rate_filters.filters_meta.genres.length != 0"
  >
    <p
      :style="
        is_mobile
          ? 'font-size: 15px;width: 95%;font-weight: normal;background-color: #fafafa;padding: 5px;margin-top: 5px;margin-bottom: 20px;border-radius: 7px;text-align: center;'
          : 'font-size: 15px;width: 95%;font-weight: normal;background-color: #fafafa;padding: 5px;margin-top: 15px;margin-bottom: 20px;border-radius: 7px;text-align: center;transform: translateX(2.5%);'
      "
    >
      Use combination of filters. Discover new favorites.
    </p>

    <div class="discoverfilter-tab-filter-box" v-if="false">
      <p>Filter</p>
      <label
        v-for="tab in filters_meta.tabs"
        class="discoverfilter-tab-checkbox"
      >
        <input
          type="radio"
          v-bind:value="tab"
          v-model="filters_temp.tab"
          class="discoverfilter-tab-checkbox-input"
        />
        <span class="discoverfilter-tab-checkmark-abled" />
        <span class="discoverfilter-tab-checkmark-text">{{ tab }}</span>
      </label>
    </div>

    <div
      class="discoverfilter-platform-filter-box"
      :style="store.session_id == null ? 'margin-top: 15px;' : ''"
    >
      <p>Available On</p>
      <div class="discoverfilter-platforms-container">
        <label
          v-for="platform in filters_meta.platforms"
          class="discoverfilter-platform-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="platform"
            v-model="filters_temp.platforms"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-platform" />
          <span class="discoverfilter-platform-cropper">
            <img
              v-bind:src="platform.platform_link"
              class="discoverfilter-platform-icon"
            />
          </span>
        </label>
      </div>
    </div>

    <div class="discoverfilter-genre-filter-box" style="margin-top: 30px">
      <p>Genre</p>
      <div class="discoverfilter-genres-container">
        <label
          v-for="genre in filters_meta.genres"
          class="discoverfilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="genre"
            v-model="filters_temp.genres"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-genre" />
          <span class="discoverfilter-genre-cropper">
            <img
              v-bind:src="genre.genre_link"
              class="discoverfilter-genre-icon"
            />
          </span>
          <span class="discoverfilter-checkmark-text-genre">{{
            genre.genre_name
          }}</span>
        </label>
      </div>
    </div>

    <div class="discoverfilter-genre-filter-box" style="margin-top: 30px">
      <p>Language</p>
      <div class="discoverfilter-genres-container">
        <label
          v-for="language in filters_meta.languages"
          class="discoverfilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="language"
            v-model="filters_temp.languages"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-genre" />
          <span class="discoverfilter-genre-cropper">
            <img
              v-bind:src="language.picture"
              class="discoverfilter-genre-icon"
            />
          </span>
          <span class="discoverfilter-checkmark-text-genre">{{
            language.name
          }}</span>
        </label>
      </div>
    </div>

    <div
      class="discoverfilter-genre-filter-box"
      style="margin-top: 30px; text-align: left"
    >
      <p>Awards</p>

      <div class="discoverfilter-genres-container">
        <label
          v-for="award in filters_meta.awards"
          class="discoverfilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="award"
            v-model="filters_temp.awards"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-genre" />
          <span class="discoverfilter-genre-cropper">
            <img
              v-bind:src="award.award_link"
              class="discoverfilter-genre-icon"
            />
          </span>
          <span class="discoverfilter-checkmark-text-genre">{{
            award.award_name
          }}</span>
        </label>
      </div>

      <label class="discoverfilter-tab-checkbox">
        <input
          type="checkbox"
          v-bind:value="filters_temp.nominations"
          v-model="filters_temp.nominations"
          class="discoverfilter-tab-checkbox-input"
        />
        <span class="discoverfilter-tab-checkmark-abled" />
        <span class="discoverfilter-tab-checkmark-text"
          >Include Nominations</span
        >
      </label>
    </div>

    <div class="discoverfilter-imdb-filter-box">
      <p>
        <span>
          <img
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/imdb.png"
            class="discoverfilter-imdb-rating-logo"
          />
        </span>
        Rating
        <span>
          {{
            filters_temp.rating / 10 + (filters_temp.rating != 100 ? "+" : "")
          }}
        </span>
      </p>
      <div class="discoverfilter-imdb-container">
        <input
          type="range"
          min="10"
          max="100"
          value="10"
          v-model="filters_temp.rating"
          class="slider"
          :style="is_mobile ? '' : 'pointer-events: auto;cursor: pointer;'"
          id="myRange"
        />
      </div>
      <div class="discoverfilter-imdb-rating-endpoints">
        1
        <span style="float: right"> 10 </span>
      </div>
      <div class="discoverfilter-imdb-scale-grids">
        <div v-for="index in 10" class="discoverfilter-imdb-scale-grid" />
      </div>
    </div>

    <div class="discoverfilter-imdb-filter-box" style="margin-top: 30px">
      <p>
        Max Runtime -
        <span>
          {{ readableRuntime }}
        </span>
      </p>
      <div class="discoverfilter-imdb-container">
        <input
          type="range"
          min="10"
          max="180"
          value="10"
          v-model="filters_temp.runtime"
          class="slider"
          :style="is_mobile ? '' : 'pointer-events: auto;cursor: pointer;'"
          id="myRange"
        />
      </div>
      <div class="discoverfilter-imdb-rating-endpoints">
        10 min
        <span style="float: right"> 3 hrs </span>
      </div>
      <div class="discoverfilter-imdb-scale-grids">
        <div v-for="index in 10" class="discoverfilter-imdb-scale-grid" />
      </div>
    </div>

    <div class="discoverfilter-artist-filter-box" id="artist_filter_box">
      <p>Artists</p>

      <div style="text-align: left">
        <input
          type="text"
          class="discoverfilter-search-box"
          id="search_string"
          v-model="search_string"
          @keyup="searchArtist"
          placeholder="Search your own..."
          autocomplete="off"
          @click="scrollUp"
        />
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <button
            class="discoverfilter-btn-clear-text"
            :style="is_mobile ? '' : 'right: 45px;margin-top: 13px;'"
            v-if="search_string"
            type="button"
            @click="clearSearchString"
          ></button>
        </transition>
      </div>

      <div class="filter-artists" v-if="search_result.length">
        <div
          v-for="artist in search_result"
          @click="addArtist(artist)"
          class="filter-artists-container"
        >
          <div class="filter-artist-cropper">
            <img v-bind:src="artist.image" class="filter-artist-pic" />
          </div>
          <div class="filter-artist-name">
            {{ artist.subject }}
          </div>
        </div>

        <div
          class="see-more-artists-box"
          v-if="search_result_ids.length"
          @click="fetchMoreArtists"
        >
          <div class="see-more-artists">See More</div>
        </div>
      </div>

      <div v-if="is_searching" class="filter-artists" style="height: 168px">
        <div class="sk-folding-cube">
          <div class="sk-cube1 sk-cube"></div>
          <div class="sk-cube2 sk-cube"></div>
          <div class="sk-cube4 sk-cube"></div>
          <div class="sk-cube3 sk-cube"></div>
        </div>
      </div>

      <div
        v-if="no_artist_message"
        class="filter-artists"
        style="height: 168px"
      >
        <br />
        No such artist found !
      </div>

      <div
        class="discoverfilter-artists-container"
        v-if="!search_result.length & !is_searching & !no_artist_message"
      >
        <label
          v-for="artist in filters_meta.artists"
          class="discoverfilter-artist-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="artist"
            v-model="filters_temp.artists"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-artist" />
          <span class="discoverfilter-artist-cropper">
            <img v-bind:src="artist.image" class="discoverfilter-artist-icon" />
          </span>
          <div class="checkmark-text-artist">
            {{ artist.subject }}
          </div>
        </label>
      </div>
    </div>

    <div
      :class="
        is_mobile
          ? 'discoverfilter-apply-container'
          : 'desktop-discoverfilter-apply-container'
      "
    >
      <span class="discoverfilter-reset-button" @click="clearFilters">
        RESET ALL
      </span>
      <span
        class="discoverfilter-apply-button"
        :style="
          !temp_applied_filter_diff
            ? ''
            : `cursor: auto;
                                                            border: solid 2px #333333;
                                                            background-color: #ffffff;
                                                            color: #333333;
                                                            padding: 15px 0px;`
        "
        @click="!temp_applied_filter_diff ? applyFilters() : ''"
      >
        APPLY
      </span>
    </div>

    <div class="discoverfilter-genre-filter-box" style="margin-top: 20px">
      <p>Release Year</p>
      <div class="discoverfilter-genres-container">
        <label
          v-for="decade in filters_meta.decades"
          class="discoverfilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="decade"
            v-model="filters_temp.years"
            class="discoverfilter-checkbox-input"
          />
          <span class="discoverfilter-checkmark-abled-genre" />
          <span class="discoverfilter-genre-cropper">
            <img
              v-bind:src="decade.decade_link"
              class="discoverfilter-genre-icon"
            />
          </span>
          <span class="discoverfilter-checkmark-text-genre">{{
            decade.decade_name
          }}</span>
        </label>
      </div>
    </div>
  </div>

  <div v-else class="fetching-filters-message">
    <div class="sk-folding-cube">
      <div class="sk-cube1 sk-cube"></div>
      <div class="sk-cube2 sk-cube"></div>
      <div class="sk-cube4 sk-cube"></div>
      <div class="sk-cube3 sk-cube"></div>
    </div>
    <br />
    <div class="quote-font">
      {{ store.quotes[Math.floor(Math.random() * 22)] }}
    </div>
  </div>
</template>

<script>
import { mixin as onClickOutside } from "vue-on-click-outside";
import axios from "axios";

export default {
  name: "App",
  mixins: [onClickOutside],
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      filter_name: "Platform",
      store: this.$store.state,
      search_string: "",
      is_searching: false,
      search_result: [],
      search_result_ids: [],
      no_artist_message: false,
      no_tag_message: false,
      filters_meta: this.$store.state.discover_filters.filters_meta,
      filters_applied: this.$store.state.discover_filters.filters_applied,
      filters_temp: this.$store.state.discover_filters.filters_temp,
    };
  },
  created() {
    this.filters_temp.artists = this.filters_applied.artists.slice();
    this.filters_temp.genres = this.filters_applied.genres.slice();
    this.filters_temp.languages = this.filters_applied.languages.slice();
    this.filters_temp.years = this.filters_applied.years.slice();
    this.filters_temp.tags = this.filters_applied.tags.slice();
    this.filters_temp.platforms = this.filters_applied.platforms.slice();
    this.filters_temp.awards = this.filters_applied.awards.slice();
    this.filters_temp.nominations = this.filters_applied.nominations;
    this.filters_temp.rating = this.filters_applied.rating;
    this.filters_temp.runtime = this.filters_applied.runtime;
    this.filters_temp.tab = this.filters_applied.tab;

    var artist_ids = [];
    var artist;
    for (artist in this.filters_temp.artists) {
      artist_ids.push(this.filters_temp.artists[artist].subject_id);
    }
    var temp_list = this.filters_temp.artists.slice();
    for (artist in this.filters_meta.artists) {
      var index = artist_ids.indexOf(
        this.filters_meta.artists[artist].subject_id
      );
      if (index == -1) {
        temp_list.push(this.filters_meta.artists[artist]);
      }
    }
    this.filters_meta.artists = temp_list.slice();
  },
  computed: {
    awards_list: function () {
      var all_awards = Array.from(
        new Set(
          this.filters_meta.awards.movie.concat(this.filters_meta.awards.tv)
        )
      ).sort();
      for (var i = 0; i < all_awards.length; ++i) {
        if (all_awards[i] == "Other") {
          all_awards.splice(i, 1);
        }
      }
      all_awards.push("Other");
      return all_awards;
    },
    temp_applied_filter_diff: function () {
      if (
        (this.filters_temp.artists.length == 0) &
        (this.filters_temp.genres.length == 0) &
        (this.filters_temp.years.length == 0) &
        (this.filters_temp.tags.length == 0) &
        (this.filters_temp.platforms.length == 0) &
        (this.filters_temp.awards.length == 0) &
        (this.filters_temp.rating == "10") &
        (this.filters_temp.runtime == "180") &
        (this.filters_temp.languages.length == 0) &
        ["All", "Suggestions"].includes(this.filters_temp.tab)
      ) {
        return true;
      } else {
        return false;
      }
    },
    readableRuntime: function () {
      var hours = Math.floor(this.filters_temp.runtime / 60);
      var minutes = this.filters_temp.runtime % 60;
      if (hours == 3) {
        return "All";
      } else if (hours >= 1) {
        if (minutes > 0) {
          return (
            hours +
            (hours > 1 ? " hrs " : " hr ") +
            minutes +
            (minutes > 1 ? " mins" : " min")
          );
        } else {
          return hours + (hours > 1 ? " hrs" : " hr");
        }
      } else {
        return minutes + (minutes > 1 ? " mins" : " min");
      }
    },
  },
  methods: {
    close() {
      this.$emit("close-filter");
    },
    scrollUp() {
      document
        .getElementById("artist_filter_box")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    },
    clearSearchString() {
      this.search_string = "";
      this.search_result = [];
      this.search_result_ids = [];
    },
    searchArtist() {
      var self = this;
      clearTimeout(self.timeout);
      self.timeout = setTimeout(function () {
        self.search_string = document.getElementById("search_string").value;
        if (self.search_string) {
          self.is_searching = true;
          self.search_result = [];
          self.search_result_ids = [];
          axios
            .post(self.$store.state.api_host + "live_search", {
              session_id: self.$store.state.session_id,
              string: self.search_string,
              search_type: "artist",
              guest_id: self.$store.state.guest_id,
            })
            .then(function (response) {
              if (response.status == 200) {
                var artist_ids = [];
                var artist;
                for (artist in response.data.result.artists) {
                  artist_ids.push(
                    response.data.result.artists[artist].subject_id
                  );
                }
                for (artist in self.filters_temp.artists) {
                  var index = artist_ids.indexOf(
                    self.filters_temp.artists[artist].subject_id
                  );
                  if (index > -1) {
                    response.data.result.artists.splice(index, 1);
                  }
                }
                self.search_result = response.data.result.artists;
                self.search_result_ids = response.data.result.artist_search_ids;

                if (self.search_result.length == 0) {
                  self.no_artist_message = true;
                  setTimeout(function () {
                    self.no_artist_message = false;
                  }, 1300);
                }
              } else if (response.status == 204) {
                self.no_artist_message = true;
                setTimeout(function () {
                  self.no_artist_message = false;
                }, 1300);
              } else {
                // console.log(response.status);
              }
              self.is_searching = false;
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
              self.is_searching = false;
            });
        } else {
          self.search_result = [];
          self.search_result_ids = [];
        }
      }, 500);
    },
    addArtist(artist) {
      this.filters_temp.artists.push(artist);
      this.filters_meta.artists.unshift(artist);
      this.search_result = [];
      this.search_result_ids = [];
      this.search_string = "";
    },
    removeSelectedArtist(index) {
      this.filters_temp.artists.splice(index, 1);
    },
    searchTag() {
      var self = this;
      clearTimeout(self.timeout);
      self.timeout = setTimeout(function () {
        self.search_string = document.getElementById("search_string").value;
        if (self.search_string) {
          self.search_result = [];
          axios
            .post(self.$store.state.api_host + "live_search", {
              session_id: self.$store.state.session_id,
              string: self.search_string,
              search_type: "tag",
              guest_id: self.$store.state.guest_id,
            })
            .then(function (response) {
              if (response.status == 200) {
                var tag_ids = [];
                var tag;
                for (tag in response.data.result.tags) {
                  tag_ids.push(response.data.result.tags[tag].live_search_id);
                }
                for (tag in self.filters_temp.tags) {
                  var index = tag_ids.indexOf(
                    self.filters_temp.tags[tag].live_search_id
                  );
                  if (index > -1) {
                    response.data.result.tags.splice(index, 1);
                  }
                }
                self.search_result = response.data.result.tags;

                if (self.search_result.length == 0) {
                  self.no_tag_message = true;
                  setTimeout(function () {
                    self.no_tag_message = false;
                  }, 1300);
                }
              } else if (response.status == 204) {
                self.no_tag_message = true;
                setTimeout(function () {
                  self.no_tag_message = false;
                }, 1300);
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
        } else {
          self.search_result = [];
        }
      }, 500);
    },
    addTag(tag) {
      this.filters_temp.tags.push(tag);
      this.search_result = [];
      this.search_string = "";
    },
    removeSelectedTag(index) {
      this.filters_temp.tags.splice(index, 1);
    },
    removeSelectedGenre(index) {
      this.filters_temp.genres.splice(index, 1);
    },
    removeSelectedPlatform(index) {
      this.filters_temp.platforms.splice(index, 1);
    },
    removeSelectedYear(index) {
      this.filters_temp.years.splice(index, 1);
    },
    fetchMoreArtists() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "get_searched_contents", {
          session_id: self.$store.state.session_id,
          content_search_ids: self.search_result_ids.slice(0, 10),
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.search_result.push(...response.data.contents);
            self.search_result_ids.splice(0, 10);
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
    applyFilters() {
      this.$emit("apply-filter");
      this.close();
    },
    clearFilters() {
      this.filters_temp.artists = [];
      this.filters_temp.genres = [];
      this.filters_temp.years = [];
      this.filters_temp.tags = [];
      this.filters_temp.platforms = [];
      this.filters_temp.awards = [];
      this.filters_temp.nominations = false;
      this.filters_temp.rating = "10";
      this.filters_temp.runtime = "180";
      this.filters_temp.languages = [];
      this.filters_temp.tab = "All";
    },
  },
};
</script>

<style lang="scss" scoped>
.discoverfilter-filter-active {
  position: absolute;
  margin-top: -0.5%;
  margin-left: 1.5%;
  height: 6px;
  width: 6px;
  background-image: url("./../images/red_dot.png");
  background-color: transparent;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.discover-filters-container {
  position: fixed;
  z-index: 10000;
  top: 81px;
  width: 100%;
  height: calc(100vh - 160px);
  padding-left: 5%;
  overflow-y: scroll;
  background-color: #ffffff;
  padding-bottom: 120px;
}
.discover-filters-container p {
  font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.discover-filters-container p span {
  font-size: 17px;
  font-weight: bold;
}
.desktop-discover-filters-container {
  position: fixed;
  z-index: 10000;
  top: 81px;
  width: 900px;
  left: calc(50vw - 450px);
  height: calc(100vh - 160px);
  overflow-y: scroll;
  background-color: #ffffff;
  padding-bottom: 80px;
}
.desktop-discover-filters-container p {
  font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.desktop-discover-filters-container p span {
  font-size: 17px;
  font-weight: bold;
}
.discover-filters-header {
  position: absolute;
  background-color: #ffffff;
  width: 100%;
  bottom: calc(60vh + 40px);
  height: 40px;
  border-bottom: 1px solid #dad8d8;
}
.discover-filters-header h3 {
  font-size: 21px;
  margin-left: -65%;
  margin-top: 7px;
}
.discover-filters-header h5 {
  font-size: 14px;
  margin-left: 76%;
  margin-top: -20px;
  color: rgb(68, 126, 235);
}
.close-filters {
  position: absolute;
  margin-top: 10px;
  left: 2%;
  height: 20px;
  width: 20px;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.filters-box {
  position: absolute;
  width: 100%;
  bottom: 0%;
  background-color: rgba(0, 0, 0, 0.5);
  height: 60vh;
  z-index: 10000;
}
.filters {
  width: 25%;
  height: 100%;
  margin-left: 0%;
  overflow: hidden;
  background-color: #ffffff;
}
.filters a {
  position: relative;
  display: block;
  padding: 6%;
  transition: background-color 0.2s;
  background-color: #ffffff;
  font-weight: bold;
  font-size: calc(14px + 0.02vw);
  width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  border-right: 1px solid #dad8d8;
}
.filters a.is-active {
  background-color: rgb(174, 219, 245);
  border-bottom: 2px solid rgb(68, 126, 235);
  cursor: default;
}
.filter-content {
  // padding: 1%;
}
.filter-artists {
  overflow-y: scroll;
  height: 250px;
  white-space: nowrap;
  padding: 1%;
  background-color: #ffffff;
}
.filter-artist-cropper {
  position: relative;
  overflow: hidden;
  width: 50px;
  height: 62.5px;
  border-radius: 4px;
}
.filter-artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.filter-artist-name {
  margin-left: 60px;
  margin-top: -40px;
  position: absolute;
  font-size: 13px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
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
.filter-artists-container {
  position: relative;
  text-align: left;
  margin-bottom: 5px;
  background-color: #ffffff;
  z-index: 10000;
}
.filter-search-box {
  border: 0;
  width: 90%;
  margin-top: 2%;
  padding: 10px 70px 10px 32px;
  font-size: 13px;
  border-radius: 34px;
  background-color: #f1f1f1;
}
.filter-btn-clear-text {
  position: absolute;
  right: 10%;
  top: 14px;
  height: 18px;
  width: 18px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/close.png");
  background-size: 100% 100%;
}
.selected-artists-container {
  width: 90%;
  margin-left: 7%;
  margin-top: 4%;
  overflow: scroll;
  text-align: left;
  height: 65%;
}
.selected-artist-container {
  display: inline-block;
  position: relative;
  margin-bottom: 10%;
  margin-right: 6%;
  vertical-align: top;
}
.selected-artist-cropper {
  display: inline-block;
  width: 12vw;
  height: 15vw;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #f3f3f3;
}
.selected-artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.selected-artist-name {
  margin: 0 auto;
  position: absolute;
  margin-left: -100%;
  margin-top: 127%;
  font-size: calc(10px + 0.03vw);
  width: 100%;
  white-space: normal;
  color: #3366bb;
  text-align: center;
}
.remove-selected-artist {
  position: absolute;
  left: 84%;
  top: 0%;
  height: 12px;
  width: 12px;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.apply-filters {
  position: fixed;
  display: block;
  width: 50%;
  height: 30px;
  margin-left: 37.5%;
  bottom: 1.5%;
  background-color: #6191eb;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  border-radius: 25px;
  outline: 0;
  color: #fff;
  font-weight: bold;
}
.selected-genres-container {
  position: relative;
  left: 5%;
  top: 1%;
  width: 95%;
}
.selected-genre-box {
  position: relative;
  display: inline-block;
  margin-top: 1%;
  margin-left: 3%;
  margin-bottom: 2.5%;
  vertical-align: top;
}
.selected-genre-text {
  position: relative;
  background-color: #6191eb;
  background-size: 100% 100%;
  color: #ffffff;
  border-radius: 10px;
  padding-bottom: 3px;
  padding-top: 2px;
  font-size: calc(14px + 0.3vw);
}
.remove-selected-genre {
  display: block;
  position: absolute;
  right: -8px;
  top: -27%;
  height: 9px;
  width: 9px;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.genres-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 63%;
  top: 3%;
  left: 21%;
}
.discoverfilter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.checkmark-abled {
  position: absolute;
  top: 18%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #ffffff;
}
.checkmark-disabled {
  position: absolute;
  top: 10%;
  left: 21.5%;
  height: 17px;
  width: 17px;
  background-color: #f1f1f1;
}
.checkmark-text {
  position: absolute;
  left: 20%;
  top: 20.5%;
  font-size: calc(14px + 0.3vw);
}
.years-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 95%;
  height: 80%;
  bottom: 17.5%;
  overflow: hidden;
  background-color: #ffffff;
  text-align: left;
  padding: 1%;
}
.selected-years-container {
  position: relative;
  left: 5%;
  top: 1%;
  width: 95%;
}
.selected-year-box {
  position: relative;
  display: inline-block;
  margin-top: 1%;
  margin-left: 3%;
  margin-bottom: 2.5%;
  vertical-align: top;
}
.selected-year-text {
  position: relative;
  background-color: #6191eb;
  background-size: 100% 100%;
  color: #ffffff;
  border-radius: 10px;
  padding-bottom: 3px;
  padding-top: 2px;
  font-size: calc(14px + 0.3vw);
}
.remove-selected-year {
  display: block;
  position: absolute;
  right: -8px;
  top: -27%;
  height: 9px;
  width: 9px;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.years-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 63%;
  top: 3%;
  left: 21%;
}
.year-checkbox {
  display: block;
  position: relative;
  width: 100%;
  font-size: calc(14px + 0.3vw);
  padding: 8%;
  border-bottom: 1px solid #dad8d8;
}
.year-checkbox input:checked ~ .checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.filter-tags {
  overflow-y: scroll;
  height: 70%;
  white-space: nowrap;
  margin-left: 10%;
  padding: 1%;
}
.filter-tag-name {
  margin-left: 18%;
  margin-top: 2%;
  position: absolute;
  font-size: 13px;
  width: 50px;
  color: #3366bb;
}
.filter-tags-container {
  position: relative;
  overflow: scroll;
  width: 90%;
  height: 13%;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid #dad8d8;
  background-color: #ffffff;
  z-index: 10000;
}
.selected-tags-container {
  position: relative;
  left: 5%;
  top: 5%;
  width: 95%;
  text-align: left;
}
.selected-tag-box {
  position: relative;
  display: inline-block;
  margin-top: 1%;
  margin-left: 3%;
  margin-bottom: 2.5%;
  vertical-align: top;
}
.selected-tag-text {
  position: relative;
  background-color: #6191eb;
  background-size: 100% 100%;
  color: #ffffff;
  border-radius: 10px;
  padding-bottom: 3px;
  padding-top: 2px;
  font-size: calc(15px + 0.1vw);
}
.remove-selected-tag {
  display: block;
  position: absolute;
  right: -8px;
  top: -27%;
  height: 9px;
  width: 9px;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.tags-guide-text {
  position: relative;
  width: 90%;
  text-align: left;
  font-size: 14px;
  top: 7%;
  left: 7%;
  color: rgb(94, 94, 90);
}
.discoverfilter-platforms-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  height: 50px;
  margin-top: 7px;
}
.selected-platforms-container {
  position: relative;
  left: -8%;
  top: 1%;
  width: 95%;
}
.selected-platform-box {
  position: relative;
  display: inline-block;
  margin-top: 1%;
  margin-left: 16%;
  margin-bottom: 14%;
  vertical-align: top;
}
.remove-selected-platform {
  display: block;
  position: absolute;
  right: -9.5vw;
  top: -1vw;
  height: 2vw;
  width: 2vw;
  background-image: url("./../images/close.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.platforms-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 85%;
  top: 3%;
  left: 10%;
}
.discoverfilter-platform-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 65px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-platform-checkbox
  input:checked
  ~ .discoverfilter-checkmark-abled-platform {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.discoverfilter-platform-cropper {
  position: absolute;
  overflow: hidden;
  width: 50px;
  height: 50px;
  border-radius: 4px;
}
.discoverfilter-platform-icon {
  width: 100%;
}
.discoverfilter-checkmark-abled-platform {
  position: absolute;
  height: 50px;
  width: 50px;
  z-index: 1;
}
.checkmark-text-platform {
  position: absolute;
  display: none;
  margin-left: 25%;
  margin-top: -4%;
  font-size: calc(12px + 0.3vw);
}
.awards-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 95%;
  height: 80%;
  bottom: 17.5%;
  overflow: hidden;
  background-color: #ffffff;
  text-align: left;
  padding: 1%;
}
.awards-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 95%;
  top: 3%;
  left: 5.5%;
}
.award-checkbox {
  display: block;
  position: relative;
  width: 100%;
  font-size: calc(14px + 0.3vw);
  padding: 6%;
  border-bottom: 1px solid #dad8d8;
  white-space: nowrap;
}
.nomination-checkbox {
  display: block;
  position: relative;
  width: 95%;
  font-size: calc(14px + 0.3vw);
  padding: 5%;
  left: 5.5%;
  margin-bottom: 5%;
}
.award-checkmark-abled {
  position: absolute;
  top: 19%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #ffffff;
}
.award-checkmark-text {
  position: absolute;
  margin-left: 10%;
  margin-top: -4%;
}
.award-checkbox input:checked ~ .award-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.nomination-checkbox input:checked ~ .award-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.ratings-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 60%;
  height: 80%;
  bottom: 17.5%;
  left: 17.5%;
  overflow: hidden;
  background-color: #ffffff;
  text-align: left;
  padding: 1%;
}
.ratings-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 100%;
  top: 3%;
  left: 5.5%;
}
.rating-checkbox {
  display: block;
  position: relative;
  width: 100%;
  font-size: calc(14px + 0.3vw);
  padding: 8%;
  border-bottom: 1px solid #dad8d8;
}
.rating-checkmark-abled {
  position: absolute;
  top: 19%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #ffffff;
}
.rating-checkmark-text {
  position: absolute;
  margin-left: 12%;
  margin-top: -5%;
  font-size: calc(14px + 0.3vw);
}
.rating-checkbox input:checked ~ .rating-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.box {
  position: absolute;
  width: 75%;
  height: 100%;
  right: 0%;
  top: 0%;
  overflow: hidden;
  background-color: #ffffff;
}
.language-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 60%;
  height: 80%;
  bottom: 17.5%;
  left: 17.5%;
  overflow: hidden;
  background-color: #ffffff;
  text-align: left;
  padding: 1%;
}
.language-checkbox-container {
  position: relative;
  overflow: scroll;
  width: 100%;
  top: 3%;
  left: 5.5%;
}
.language-checkbox {
  display: block;
  position: relative;
  width: 100%;
  font-size: calc(14px + 0.3vw);
  padding: 8%;
  border-bottom: 1px solid #dad8d8;
}
.language-checkmark-abled {
  position: absolute;
  top: 19%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #ffffff;
}
.language-checkmark-text {
  position: absolute;
  margin-left: 12%;
  margin-top: -5%;
  font-size: calc(14px + 0.3vw);
}
.language-checkbox input:checked ~ .language-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.discoverfilter-tab-filter-box {
  position: relative;
  text-align: left;
}
.discoverfilter-tab-checkbox {
  display: inline-block;
  position: relative;
  margin-right: 24px;
  border-radius: 5px;
  margin-top: 7px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-tab-checkbox-input {
  opacity: 0;
  cursor: pointer;
}
.discoverfilter-tab-checkmark-abled {
  position: absolute;
  transform: translateX(-65%) translateY(-2px);
  height: 26px;
  width: 26px;
  border-radius: 2px;
  border: solid 2px #333333;
  background-color: #ffffff;
}
.discoverfilter-tab-checkmark-text {
  margin-left: 20px;
  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.discoverfilter-tab-checkbox
  input:checked
  ~ .discoverfilter-tab-checkmark-abled {
  background-repeat: no-repeat;
  background-size: 85%;
  background-position: center;
  background-image: url("./../images/checked.svg");
}
.discoverfilter-platform-filter-box {
  margin-top: 35px;
}
.discoverfilter-genre-filter-box {
  margin-top: 35px;
}
.discoverfilter-genre-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 100px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-checkmark-abled-genre {
  position: absolute;
  height: 85px;
  width: 85px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
.discoverfilter-genre-checkbox
  input:checked
  ~ .discoverfilter-checkmark-abled-genre {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 20%;
  background-position: 50% 80%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.discoverfilter-genre-cropper {
  position: absolute;
  overflow: hidden;
  width: 85px;
  height: 85px;
  border-radius: 4px;
}
.discoverfilter-genre-icon {
  width: 100%;
}
.discoverfilter-genres-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  height: 85px;
  margin-top: 7px;
  text-align: left;
}
.discoverfilter-checkmark-text-genre {
  position: absolute;
  width: 85px;
  top: 37px;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 1;
}
.slider {
  -webkit-appearance: none;
  width: 95%;
  margin-top: 17px;
  height: 14px;
  border-radius: 4px;
  background-color: #ebebeb;
  pointer-events: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: auto;
  appearance: none;
  width: 41px;
  height: 47px;
  border-radius: 4px;
  border: solid 2px #333333;
  background-color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-imdb-filter-box {
  margin-top: 12px;
  text-align: left;
}
.discoverfilter-imdb-rating-logo {
  height: 50px;
  transform: translateY(17px);
}
.discoverfilter-imdb-container {
  margin-top: 7px;
}
.discoverfilter-imdb-rating-endpoints {
  width: 95%;
  margin-top: 15px;
  font-size: 12px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.discoverfilter-imdb-scale-grids {
  width: calc(95% - 3px);
  margin-left: 3px;
  margin-top: 5px;
  display: grid;
  grid-column-gap: 10%;
}
.discoverfilter-imdb-scale-grid {
  width: 1px;
  height: 10px;
  background-color: #333333;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 9;
}
.discoverfilter-apply-container {
  position: fixed;
  width: 100%;
  bottom: 55px;
  left: 0px;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  background-color: #ffffff;
  padding: 15px 5%;
  z-index: 10000;
}
.desktop-discoverfilter-apply-container {
  position: fixed;
  width: 900px;
  bottom: 60px;
  left: calc(50vw - 450px);
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  background-color: #ffffff;
  padding: 15px 5%;
  z-index: 10000;
}
.discoverfilter-reset-button {
  position: absolute;
  width: 30%;
  height: 50px;
  border-radius: 4px;
  border: solid 2px #333333;
  background-color: #ffffff;
  color: #333333;
  text-align: center;
  padding: 14px 0px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-apply-button {
  float: right;
  width: 60%;
  height: 50px;
  border-radius: 4px;
  background-color: #294ed2;
  color: #ffffff;
  text-align: center;
  padding: 17px 0px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.discoverfilter-artist-filter-box {
  margin-top: 35px;
}
.discoverfilter-artists-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 158px;
  margin-top: 20px;
}
.discoverfilter-artist-checkbox {
  position: relative;
  display: inline-block;
  padding-right: 105px;
}
.discoverfilter-artist-checkbox
  input:checked
  ~ .discoverfilter-checkmark-abled-artist {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.discoverfilter-artist-cropper {
  position: absolute;
  overflow: hidden;
  width: 90px;
  height: 112.5px;
  border-radius: 4px;
}
.discoverfilter-artist-icon {
  width: 100%;
}
.discoverfilter-checkmark-abled-artist {
  position: absolute;
  height: 112.5px;
  width: 90px;
  z-index: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.checkmark-text-artist {
  position: absolute;
  left: 0px;
  top: 120px;
  width: 90px;
  height: 45px;
  overflow: scroll;
  font-size: 13px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
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
.discoverfilter-search-box {
  width: 95%;
  font-size: 17px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  padding: 10px 0px 2px 0px;
  border-width: 0 0 1px;
  border-color: #8f8e8e;
}
::placeholder {
  color: #333333;
}
.discoverfilter-btn-clear-text {
  position: absolute;
  right: 20px;
  margin-top: 17px;
  height: 18px;
  width: 18px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/close.png");
  background-size: 100% 100%;
}
.see-more-artists-box {
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
.see-more-artists {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
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

.fetching-filters-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
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
</style>
