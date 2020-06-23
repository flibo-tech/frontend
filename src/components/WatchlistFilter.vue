<template>
  <div class="watchlist-filters-container">
    <div class="watchlistfilter-tab-filter-box">
      <p>
        Filter
      </p>
      <label
        v-for="tab in filters_meta.tabs"
        class="watchlistfilter-tab-checkbox"
      >
        <input
          type="radio"
          v-bind:value="tab"
          v-model="filters_temp.tab"
          class="watchlistfilter-tab-checkbox-input"
        />
        <span class="watchlistfilter-tab-checkmark-abled" />
        <span class="watchlistfilter-tab-checkmark-text">{{ tab }}</span>
      </label>
    </div>

    <div class="watchlistfilter-platform-filter-box">
      <p>
        Available On
      </p>
      <div class="watchlistfilter-platforms-container">
        <label
          v-for="platform in filters_meta.platforms"
          class="watchlistfilter-platform-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="platform"
            v-model="filters_temp.platforms"
            class="watchlistfilter-checkbox-input"
          />
          <span class="watchlistfilter-checkmark-abled-platform" />
          <span class="watchlistfilter-platform-cropper">
            <img
              v-bind:src="platform.platform_link"
              class="watchlistfilter-platform-icon"
            />
          </span>
        </label>
      </div>
    </div>

    <div class="watchlistfilter-genre-filter-box">
      <p>
        Genre
      </p>
      <div class="watchlistfilter-genres-container">
        <label
          v-for="genre in filters_meta.genres"
          class="watchlistfilter-genre-checkbox"
        >
          <input
            type="checkbox"
            v-bind:value="genre"
            v-model="filters_temp.genres"
            class="watchlistfilter-checkbox-input"
          />
          <span class="watchlistfilter-checkmark-abled-genre" />
          <span class="watchlistfilter-genre-cropper">
            <img
              v-bind:src="genre.genre_link"
              class="watchlistfilter-genre-icon"
            />
          </span>
          <span class="watchlistfilter-checkmark-text-genre">{{
            genre.genre_name
          }}</span>
        </label>
      </div>
    </div>

    <div class="watchlistfilter-apply-container">
      <span class="watchlistfilter-reset-button" @click="clearFilters">
        RESET ALL
      </span>
      <span
        class="watchlistfilter-apply-button"
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
      filters_meta: this.$store.state.watchlist_filters.filters_meta,
      filters_applied: this.$store.state.watchlist_filters.filters_applied,
      filters_temp: this.$store.state.watchlist_filters.filters_temp
    };
  },
  created() {
    this.filters_temp.genres = this.filters_applied.genres.slice();
    this.filters_temp.platforms = this.filters_applied.platforms.slice();
    this.filters_temp.tab = this.filters_applied.tab;
  },
  computed: {
    temp_applied_filter_diff: function() {
      return (
        JSON.stringify(this.$store.state.watchlist_filters.filters_applied) ==
        JSON.stringify(this.$store.state.watchlist_filters.filters_temp)
      );
    }
  },
  methods: {
    close() {
      this.$emit("close-filter");
    },
    removeSelectedGenre(index) {
      this.filters_temp.genres.splice(index, 1);
    },
    removeSelectedPlatform(index) {
      this.filters_temp.platforms.splice(index, 1);
    },
    applyFilters() {
      this.filters_applied.genres = this.filters_temp.genres.slice();
      this.filters_applied.platforms = this.filters_temp.platforms.slice();
      this.filters_applied.tab = this.filters_temp.tab;
      this.close();
      this.$emit("apply-filter");
    },
    clearFilters() {
      this.filters_temp.genres = [];
      this.filters_temp.platforms = [];
      this.filters_temp.tab = "All";
    }
  }
};
</script>

<style lang="scss" scoped>
.watchlistfilter-filter-active {
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
.watchlist-filters-container {
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
.watchlist-filters-container p {
  font-size: 23px;
  font-weight: 900;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.watchlist-filters-container p span {
  font-size: 17px;
  font-weight: bold;
}
.watchlist-filters-header {
  position: absolute;
  background-color: #ffffff;
  width: 100%;
  bottom: calc(60vh + 40px);
  height: 40px;
  border-bottom: 1px solid #dad8d8;
}
.watchlist-filters-header h3 {
  font-size: 21px;
  margin-left: -65%;
  margin-top: 7px;
}
.watchlist-filters-header h5 {
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
.watchlistfilter-checkbox-input {
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
.watchlistfilter-platforms-container {
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
.watchlistfilter-platform-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 70px;
}
.watchlistfilter-platform-checkbox
  input:checked
  ~ .watchlistfilter-checkmark-abled-platform {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.watchlistfilter-platform-cropper {
  position: absolute;
  overflow: hidden;
  width: 60px;
  height: 60px;
  border-radius: 4px;
}
.watchlistfilter-platform-icon {
  width: 100%;
}
.watchlistfilter-checkmark-abled-platform {
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
.watchlistfilter-tab-filter-box {
  position: relative;
  text-align: left;
}
.watchlistfilter-tab-checkbox {
  display: inline-block;
  position: relative;
  margin-right: 24px;
  border-radius: 5px;
  margin-top: 7px;
}
.watchlistfilter-tab-checkbox-input {
  opacity: 0;
  cursor: pointer;
}
.watchlistfilter-tab-checkmark-abled {
  position: absolute;
  transform: translateX(-65%) translateY(-2px);
  height: 26px;
  width: 26px;
  border-radius: 2px;
  border: solid 2px #333333;
  background-color: #ffffff;
}
.watchlistfilter-tab-checkmark-text {
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
.watchlistfilter-tab-checkbox
  input:checked
  ~ .watchlistfilter-tab-checkmark-abled {
  background-repeat: no-repeat;
  background-size: 85%;
  background-position: center;
  background-image: url("./../images/checked.svg");
}
.watchlistfilter-platform-filter-box {
  margin-top: 50px;
}
.watchlistfilter-genre-filter-box {
  margin-top: 50px;
}
.watchlistfilter-genre-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 110px;
}
.watchlistfilter-checkmark-abled-genre {
  position: absolute;
  height: 100px;
  width: 100px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
.watchlistfilter-genre-checkbox
  input:checked
  ~ .watchlistfilter-checkmark-abled-genre {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 20%;
  background-position: 50% 80%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.watchlistfilter-genre-cropper {
  position: absolute;
  overflow: hidden;
  width: 100px;
  height: 100px;
  border-radius: 4px;
}
.watchlistfilter-genre-icon {
  width: 100%;
}
.watchlistfilter-genres-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  height: 100px;
  margin-top: 7px;
  text-align: left;
}
.watchlistfilter-checkmark-text-genre {
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
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
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
.watchlistfilter-imdb-filter-box {
  margin-top: 25px;
  text-align: left;
}
.watchlistfilter-imdb-rating-logo {
  height: 50px;
  transform: translateY(17px);
}
.watchlistfilter-imdb-container {
  margin-top: 7px;
}
.watchlistfilter-imdb-rating-endpoints {
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
.watchlistfilter-imdb-scale-grids {
  width: calc(95% - 3px);
  margin-left: 3px;
  margin-top: 5px;
  display: grid;
  grid-column-gap: 10%;
}
.watchlistfilter-imdb-scale-grid {
  width: 1px;
  height: 10px;
  background-color: #333333;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 9;
}
.watchlistfilter-apply-container {
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
.watchlistfilter-reset-button {
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
.watchlistfilter-apply-button {
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
.watchlistfilter-artist-filter-box {
  margin-top: 50px;
}
.watchlistfilter-artists-container {
  display: inline-flex;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 168px;
  margin-top: 20px;
}
.watchlistfilter-artist-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 110px;
}
.watchlistfilter-artist-checkbox
  input:checked
  ~ .watchlistfilter-checkmark-abled-artist {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.watchlistfilter-artist-cropper {
  position: absolute;
  overflow: hidden;
  width: 100px;
  height: 125px;
  border-radius: 4px;
}
.watchlistfilter-artist-icon {
  width: 100%;
}
.watchlistfilter-checkmark-abled-artist {
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
.watchlistfilter-search-box {
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
.watchlistfilter-btn-clear-text {
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
