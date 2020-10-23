<template>
  <div class="quick-filter-genres-container">
    <div
      class="quick-filter-genres-secondary-container"
      :style="
        is_mobile
          ? quick_filters_applied.genres.length
            ? 'background-color: rgb(232, 240, 254);'
            : ''
          : quick_filters_applied.genres.length
          ? 'background-color: rgb(232, 240, 254);height: 100px;'
          : 'height: 100px;'
      "
    >
      <label
        v-for="(genre, index) in quick_genres"
        :key="index"
        class="quick-filter-genre-checkbox"
        :style="is_mobile ? '' : 'margin-right: 95px;'"
      >
        <input
          type="checkbox"
          v-bind:value="genre"
          v-model="quick_filters_applied.genres"
          class="quick-filter-checkbox-input"
          @click="filterParent"
        />
        <span
          class="quick-filter-checkmark-abled-genre"
          :style="is_mobile ? '' : 'height: 80px;width: 80px;'"
        />
        <span
          class="quick-filter-genre-cropper"
          :style="is_mobile ? '' : 'height: 80px;width: 80px;'"
        >
          <img v-bind:src="genre.genre_link" class="quick-filter-genre-icon" />
        </span>
        <span
          class="quick-filter-checkmark-text-genre"
          :style="is_mobile ? '' : 'width: 80px;top: 32.5px;'"
          >{{ genre.genre_name }}</span
        >
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  props: {
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      filtered_genres: [],
      quick_filters_meta: this.$store.state.feed_filters.filters_meta,
      quick_filters_mapping: {
        watchlist: "this.$store.state.feed.watchlist",
        ratings: "this.$store.state.feed.ratings",
        suggestions: "this.$store.state.feed.suggestions",
      },
      contents: {
        watchlist: "this.$store.state.feed.watchlist.contents",
        ratings: "this.$store.state.feed.ratings.contents",
        suggestions: "this.$store.state.feed.suggestions.contents",
      },
      store: this.$store.state,
      just_created: true,
    };
  },
  computed: {
    quick_filters_applied() {
      return eval(this.quick_filters_mapping[this.parent]);
    },
    quick_genres() {
      var contents_genres = [];
      eval(this.contents[this.parent]).forEach(function (item, index) {
        contents_genres.push(...item.genres);
      });

      var applied_genre = [];
      var new_applied_genres = [];
      this.quick_filters_applied.genres.forEach(function (item, index) {
        if (contents_genres.indexOf(item.genre_name) != -1) {
          new_applied_genres.push(item);
          applied_genre.push(item.genre_name);
        }
      });
      this.quick_filters_applied.genres = new_applied_genres.slice();

      var output = [];
      var self = this;
      var filters_meta = this.quick_filters_meta.genres.slice();
      filters_meta.forEach(function (item, index) {
        if (contents_genres.indexOf(item.genre_name) != -1) {
          if (self.just_created) {
            if (applied_genre.indexOf(item.genre_name) != -1) {
              item.score = 1;
            } else {
              item.score = 0;
            }
          }
          output.push(item);
        } else if (self.just_created) {
          item.score = 0;
        }
      });

      if (this.just_created) {
        this.just_created = false;

        output = output.sort(this.compare);
        filters_meta = filters_meta.sort(this.compare);

        output.forEach(function (item, index) {
          delete output[index].score;
        });
        filters_meta.forEach(function (item, index) {
          delete filters_meta[index].score;
        });
        this.quick_filters_meta.genres = filters_meta.slice();
      }

      return output;
    },
    reset_filter() {
      return this.$store.state.feed_filters.reset_genre_filter;
    },
  },
  watch: {
    reset_filter: {
      handler(reset) {
        if (reset) {
          eval(this.quick_filters_mapping[this.parent] + ".genres = []");
          this.$store.state.feed_filters.reset_genre_filter = false;
        }
      },
    },
  },
  methods: {
    filterParent() {
      var self = this;
      setTimeout(function () {
        self.$emit("filter-parent");
      }, 0);
    },
    compare(a, b) {
      if (a.score > b.score) {
        return -1;
      }
      if (a.score == b.score) {
        return 0;
      }
      return 1;
    },
  },
};
</script>

<style scoped>
.quick-filter-genres-container {
  position: relative;
  width: calc(100% + 10px);
  margin-left: -10px;
  overflow-x: scroll;
}
.quick-filter-genres-secondary-container {
  display: flex;
  width: fit-content;
  height: 85px;
  padding: 10px 0px 10px 15px;
  border-radius: 5px;
}
.quick-filter-genre-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 80px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.quick-filter-genre-checkbox
  input:checked
  ~ .quick-filter-checkmark-abled-genre {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 20%;
  background-position: 50% 80%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../../images/checked_white.svg");
}
.quick-filter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.quick-filter-checkmark-abled-genre {
  position: absolute;
  height: 65px;
  width: 65px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
.quick-filter-genre-cropper {
  position: absolute;
  overflow: hidden;
  width: 65px;
  height: 65px;
  border-radius: 4px;
}
.quick-filter-genre-icon {
  width: 100%;
}
.quick-filter-checkmark-text-genre {
  position: absolute;
  width: 65px;
  top: 28px;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 1;
}
::-webkit-scrollbar {
  display: none;
}
</style>