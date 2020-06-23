<template>
  <div class="rate-filters-container">
    <div class="ratefilter-tab-filter-box">
      <p>
        Filter
      </p>
      <label v-for="tab in filters_meta.tabs" class="ratefilter-tab-checkbox">
        <input
          type="radio"
          v-bind:value="tab"
          v-model="filters_temp.tab"
          class="ratefilter-tab-checkbox-input"
        />
        <span class="ratefilter-tab-checkmark-abled" />
        <span class="ratefilter-tab-checkmark-text">{{ tab }}</span>
      </label>
    </div>

    <div class="ratefilter-platform-filter-box">
      <p>
        Available On
      </p>
      <div class="ratefilter-platforms-container">
        <label
          v-for="platform in filters_meta.platforms"
          class="ratefilter-platform-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="platform"
            v-model="filters_temp.platforms"
            class="ratefilter-checkbox-input"
          />
          <span class="ratefilter-checkmark-abled-platform" />
          <span class="ratefilter-platform-cropper">
            <img
              v-bind:src="platform.platform_link"
              class="ratefilter-platform-icon"
            />
          </span>
        </label>
      </div>
    </div>

    <div class="ratefilter-genre-filter-box">
      <p>
        Genre
      </p>
      <div class="ratefilter-genres-container">
        <label
          v-for="genre in filters_meta.genres"
          class="ratefilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="genre"
            v-model="filters_temp.genres"
            class="ratefilter-checkbox-input"
          />
          <span class="ratefilter-checkmark-abled-genre" />
          <span class="ratefilter-genre-cropper">
            <img v-bind:src="genre.genre_link" class="ratefilter-genre-icon" />
          </span>
          <span class="ratefilter-checkmark-text-genre">{{
            genre.genre_name
          }}</span>
        </label>
      </div>
    </div>

    <div class="ratefilter-imdb-filter-box">
      <p>
        <span>
          <img
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/imdb.png"
            class="ratefilter-imdb-rating-logo"
          />
        </span>
        Rating
        <span>
          {{
            filters_temp.rating / 10 + (filters_temp.rating != 100 ? "+" : "")
          }}
        </span>
      </p>
      <div class="ratefilter-imdb-container">
        <input
          type="range"
          min="10"
          max="100"
          value="10"
          v-model="filters_temp.rating"
          class="slider"
          id="myRange"
        />
      </div>
      <div class="ratefilter-imdb-rating-endpoints">
        1
        <span style="float:right;">
          10
        </span>
      </div>
      <div class="ratefilter-imdb-scale-grids">
        <div v-for="index in 10" class="ratefilter-imdb-scale-grid" />
      </div>
    </div>

    <div class="ratefilter-artist-filter-box" id="artist_filter_box">
      <p>
        Artists
      </p>

      <div style="text-align: left;">
        <input
          type="text"
          class="ratefilter-search-box"
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
            class="ratefilter-btn-clear-text"
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
          <div class="see-more-artists">
            See More
          </div>
        </div>
      </div>

      <div v-if="is_searching" class="filter-artists" style="height: 168px;">
        <br />
        Searching...
      </div>

      <div
        v-if="no_artist_message"
        class="filter-artists"
        style="height: 168px;"
      >
        <br />
        No such artist found !
      </div>

      <div
        class="ratefilter-artists-container"
        v-if="!search_result.length & !is_searching & !no_artist_message"
      >
        <label
          v-for="artist in filters_meta.artists"
          class="ratefilter-artist-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="artist"
            v-model="filters_temp.artists"
            class="ratefilter-checkbox-input"
          />
          <span class="ratefilter-checkmark-abled-artist" />
          <span class="ratefilter-artist-cropper">
            <img v-bind:src="artist.image" class="ratefilter-artist-icon" />
          </span>
          <div class="checkmark-text-artist">
            {{ artist.subject }}
          </div>
        </label>
      </div>
    </div>

    <div class="ratefilter-apply-container">
      <span class="ratefilter-reset-button" @click="clearFilters">
        RESET ALL
      </span>
      <span
        class="ratefilter-apply-button"
        :style="
          !temp_applied_filter_diff
            ? ''
            : `cursor: none;
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

    <div class="ratefilter-genre-filter-box" style="margin-top: 30px;">
      <p>
        Release Year
      </p>
      <div class="ratefilter-genres-container">
        <label
          v-for="decade in filters_meta.decades"
          class="ratefilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="decade"
            v-model="filters_temp.years"
            class="ratefilter-checkbox-input"
          />
          <span class="ratefilter-checkmark-abled-genre" />
          <span class="ratefilter-genre-cropper">
            <img
              v-bind:src="decade.decade_link"
              class="ratefilter-genre-icon"
            />
          </span>
          <span class="ratefilter-checkmark-text-genre">{{
            decade.decade_name
          }}</span>
        </label>
      </div>
    </div>

    <div class="ratefilter-genre-filter-box">
      <p>
        Language
      </p>
      <div class="ratefilter-genres-container">
        <label
          v-for="language in filters_meta.languages"
          class="ratefilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="language"
            v-model="filters_temp.languages"
            class="ratefilter-checkbox-input"
          />
          <span class="ratefilter-checkmark-abled-genre" />
          <span class="ratefilter-genre-cropper">
            <img v-bind:src="language.picture" class="ratefilter-genre-icon" />
          </span>
          <span class="ratefilter-checkmark-text-genre">{{
            language.name
          }}</span>
        </label>
      </div>
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
      filter_name: "Platform",
      store: this.$store.state,
      search_string: "",
      is_searching: false,
      search_result: [],
      search_result_ids: [],
      no_artist_message: false,
      no_tag_message: false,
      filters_meta: this.$store.state.rate_filters.filters_meta,
      filters_applied: this.$store.state.rate_filters.filters_applied,
      filters_temp: this.$store.state.rate_filters.filters_temp
    };
  },
  created() {
    this.filters_temp.artists = this.filters_applied.artists.slice();
    this.filters_temp.genres = this.filters_applied.genres.slice();
    this.filters_temp.years = this.filters_applied.years.slice();
    this.filters_temp.tags = this.filters_applied.tags.slice();
    this.filters_temp.platforms = this.filters_applied.platforms.slice();
    this.filters_temp.awards = this.filters_applied.awards.slice();
    this.filters_temp.nominations = this.filters_applied.nominations;
    this.filters_temp.rating = this.filters_applied.rating;
    this.filters_temp.runtime = this.filters_applied.runtime;
    this.filters_temp.languages = this.filters_applied.languages.slice();
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
    awards_list: function() {
      if (this.filters_temp.tab == "Movies") {
        return this.filters_meta.awards.movie;
      } else if (this.filters_temp.tab == "TV Series") {
        return this.filters_meta.awards.tv;
      } else {
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
      }
    },
    temp_applied_filter_diff: function() {
      return (
        JSON.stringify(this.$store.state.rate_filters.filters_applied) ==
        JSON.stringify(this.$store.state.rate_filters.filters_temp)
      );
    }
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
      self.timeout = setTimeout(function() {
        self.search_string = document.getElementById("search_string").value;
        if (self.search_string) {
          self.is_searching = true;
          self.search_result = [];
          self.search_result_ids = [];
          axios
            .post(self.$store.state.api_host + "live_search", {
              session_id: self.$store.state.session_id,
              string: self.search_string,
              search_type: "artist"
            })
            .then(function(response) {
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
                  setTimeout(function() {
                    self.no_artist_message = false;
                  }, 1300);
                }
              } else if (response.status == 204) {
                self.no_artist_message = true;
                setTimeout(function() {
                  self.no_artist_message = false;
                }, 1300);
              } else {
                // console.log(response.status);
              }
              self.is_searching = false;
            })
            .catch(function(error) {
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
      self.timeout = setTimeout(function() {
        self.search_string = document.getElementById("search_string").value;
        if (self.search_string) {
          self.search_result = [];
          axios
            .post(self.$store.state.api_host + "live_search", {
              session_id: self.$store.state.session_id,
              string: self.search_string,
              search_type: "tag"
            })
            .then(function(response) {
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
                  setTimeout(function() {
                    self.no_tag_message = false;
                  }, 1300);
                }
              } else if (response.status == 204) {
                self.no_tag_message = true;
                setTimeout(function() {
                  self.no_tag_message = false;
                }, 1300);
              } else {
                // console.log(response.status);
              }
            })
            .catch(function(error) {
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
          content_search_ids: self.search_result_ids.slice(0, 10)
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.search_result.push(...response.data.contents);
            self.search_result_ids.splice(0, 10);
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
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
      this.$store.state.rate_filters.visible_cards = [];
      this.$store.state.rate_filters.content_ids = [];
      this.store.rate_filters.fetching_cards = true;
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
        self.filters_applied.artists.length ||
        self.filters_applied.genres.length ||
        self.filters_applied.years.length ||
        self.filters_applied.platforms.length ||
        self.filters_applied.rating != "10" ||
        self.filters_applied.runtime != "180" ||
        self.filters_applied.languages.length
      ) {
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

        var years = [];
        var year;
        for (year in this.filters_applied.years) {
          years.push(this.filters_applied.years[year].decade_name);
        }

        axios
          .post(self.$store.state.api_host + "filter_content_to_rate", {
            session_id: self.$store.state.session_id,
            master_ids: master_ids,
            genres: genres,
            time_periods: years,
            platforms: platforms,
            awards: self.filters_applied.awards,
            nominations: self.filters_applied.nominations,
            rating: parseFloat(self.filters_applied.rating) / 10,
            runtime: parseInt(self.filters_applied.runtime),
            languages: languages,
            content_type: self.filters_applied.tab
          })
          .then(function(response) {
            if ([200].includes(response.status)) {
              self.$store.state.rate_filters.visible_cards =
                response.data.contents;
              self.$store.state.rate_filters.content_ids =
                response.data.content_ids;
            } else if ([204].includes(response.status)) {
              self.$store.state.rate_filters.visible_cards = [];
              self.$store.state.rate_filters.content_ids = [];
            } else {
              // console.log(response.status);
            }
            self.store.rate_filters.fetching_cards = false;
          })
          .catch(function(error) {
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
            self.store.rate_filters.fetching_cards = false;
          });
      } else {
        if (this.filters_applied.tab == "All") {
          this.$store.state.rate.content_type_tab = ["movie", "tv"];
        } else if (this.filters_applied.tab == "Movies") {
          this.$store.state.rate.content_type_tab = ["movie"];
        } else if (this.filters_applied.tab == "TV Series") {
          this.$store.state.rate.content_type_tab = ["tv"];
        }
      }
      this.$store.state.last_card = null;
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
    }
  }
};
</script>

<style lang="scss" scoped>
.ratefilter-filter-active {
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
.rate-filters-container {
  position: fixed;
  z-index: 100000;
  top: 90px;
  width: 100%;
  height: calc(100vh - 160px);
  padding-left: 5%;
  overflow-y: scroll;
  background-color: #ffffff;
  padding-bottom: 80px;
  padding-top: 10px;
}
.rate-filters-container p {
  font-size: 23px;
  font-weight: 900;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.rate-filters-container p span {
  font-size: 17px;
  font-weight: bold;
}
.rate-filters-header {
  position: absolute;
  background-color: #ffffff;
  width: 100%;
  bottom: calc(60vh + 40px);
  height: 40px;
  border-bottom: 1px solid #dad8d8;
}
.rate-filters-header h3 {
  font-size: 21px;
  margin-left: -65%;
  margin-top: 7px;
}
.rate-filters-header h5 {
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
.ratefilter-checkbox-input {
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
.ratefilter-platforms-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  height: 60px;
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
.ratefilter-platform-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 70px;
}
.ratefilter-platform-checkbox
  input:checked
  ~ .ratefilter-checkmark-abled-platform {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.ratefilter-platform-cropper {
  position: absolute;
  overflow: hidden;
  width: 60px;
  height: 60px;
  border-radius: 4px;
}
.ratefilter-platform-icon {
  width: 100%;
}
.ratefilter-checkmark-abled-platform {
  position: absolute;
  height: 60px;
  width: 60px;
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
.ratefilter-tab-filter-box {
  position: relative;
  text-align: left;
}
.ratefilter-tab-checkbox {
  display: inline-block;
  position: relative;
  margin-right: 24px;
  border-radius: 5px;
  margin-top: 7px;
}
.ratefilter-tab-checkbox-input {
  opacity: 0;
  cursor: pointer;
}
.ratefilter-tab-checkmark-abled {
  position: absolute;
  transform: translateX(-65%) translateY(-2px);
  height: 26px;
  width: 26px;
  border-radius: 2px;
  border: solid 2px #333333;
  background-color: #ffffff;
}
.ratefilter-tab-checkmark-text {
  margin-left: 20px;
  font-size: 17px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.ratefilter-tab-checkbox input:checked ~ .ratefilter-tab-checkmark-abled {
  background-repeat: no-repeat;
  background-size: 85%;
  background-position: center;
  background-image: url("./../images/checked.svg");
}
.ratefilter-platform-filter-box {
  margin-top: 50px;
}
.ratefilter-genre-filter-box {
  margin-top: 50px;
}
.ratefilter-genre-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 110px;
}
.ratefilter-checkmark-abled-genre {
  position: absolute;
  height: 100px;
  width: 100px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
.ratefilter-genre-checkbox input:checked ~ .ratefilter-checkmark-abled-genre {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 20%;
  background-position: 50% 80%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.ratefilter-genre-cropper {
  position: absolute;
  overflow: hidden;
  width: 100px;
  height: 100px;
  border-radius: 4px;
}
.ratefilter-genre-icon {
  width: 100%;
}
.ratefilter-genres-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  height: 100px;
  margin-top: 7px;
  text-align: left;
}
.ratefilter-checkmark-text-genre {
  position: absolute;
  width: 100px;
  top: 43px;
  font-size: 15px;
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
.ratefilter-imdb-filter-box {
  margin-top: 25px;
  text-align: left;
}
.ratefilter-imdb-rating-logo {
  height: 50px;
  transform: translateY(17px);
}
.ratefilter-imdb-container {
  margin-top: 7px;
}
.ratefilter-imdb-rating-endpoints {
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
.ratefilter-imdb-scale-grids {
  width: calc(95% - 3px);
  margin-left: 3px;
  margin-top: 5px;
  display: grid;
  grid-column-gap: 10%;
}
.ratefilter-imdb-scale-grid {
  width: 1px;
  height: 10px;
  background-color: #333333;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 9;
}
.ratefilter-apply-container {
  position: fixed;
  width: 100%;
  bottom: 0px;
  left: 0px;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  background-color: #ffffff;
  padding: 10px 5%;
  z-index: 10000;
}
.ratefilter-reset-button {
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
.ratefilter-apply-button {
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
.ratefilter-artist-filter-box {
  margin-top: 50px;
}
.ratefilter-artists-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 168px;
  margin-top: 20px;
}
.ratefilter-artist-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 110px;
}
.ratefilter-artist-checkbox input:checked ~ .ratefilter-checkmark-abled-artist {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.ratefilter-artist-cropper {
  position: absolute;
  overflow: hidden;
  width: 100px;
  height: 125px;
  border-radius: 4px;
}
.ratefilter-artist-icon {
  width: 100%;
}
.ratefilter-checkmark-abled-artist {
  position: absolute;
  height: 125px;
  width: 100px;
  z-index: 1;
}
.checkmark-text-artist {
  position: absolute;
  left: 0px;
  top: 130px;
  width: 100px;
  height: 45px;
  overflow: scroll;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.ratefilter-search-box {
  width: 95%;
  font-size: 17px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  padding: 15px 0px 2px 0px;
  border-width: 0 0 1px;
  border-color: #8f8e8e;
}
::placeholder {
  color: #333333;
}
.ratefilter-btn-clear-text {
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
</style>
