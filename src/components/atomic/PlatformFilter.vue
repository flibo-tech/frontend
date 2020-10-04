<template>
  <div
    class="quick-filters-platforms"
    :style="
      is_mobile
        ? quick_filters_applied.platforms.length
          ? 'background-color: rgb(232, 240, 254);'
          : ''
        : quick_filters_applied.platforms.length
        ? 'background-color: rgb(232, 240, 254);height: 50px;'
        : 'height: 50px;'
    "
  >
    <label
      v-for="(platform, index) in quick_platforms"
      :key="index"
      class="quick-filter-platform-checkbox"
      :style="is_mobile ? '' : 'margin-right: 45px;'"
    >
      <input
        type="checkbox"
        v-bind:value="platform"
        v-model="quick_filters_applied.platforms"
        class="quick-filter-checkbox-input"
        @click="filterParent"
      />
      <span
        class="quick-filter-checkmark-abled-platform"
        :style="is_mobile ? '' : 'height: 40px;width: 40px;'"
      />
      <span
        class="quick-filter-platform-cropper"
        :style="is_mobile ? '' : 'height: 40px;width: 40px;'"
      >
        <img
          v-bind:src="platform.platform_link"
          class="quick-filter-platform-icon"
        />
      </span>
    </label>
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
      filtered_platforms: [],
      quick_filters_meta: this.$store.state.feed_filters.filters_meta,
      quick_filters_mapping: {
        home: "this.$store.state.feed_filters.filters_applied.home",
        watchlist: "this.$store.state.feed_filters.filters_applied.watchlist",
        ratings: "this.$store.state.feed.ratings",
      },
      contents: {
        watchlist: "this.$store.state.watchlist",
        ratings: "this.$store.state.feed.ratings.contents",
      },
      store: this.$store.state,
      just_created: true,
    };
  },
  computed: {
    quick_platforms() {
      if (this.parent == "home") {
        return this.user_platforms;
      } else if (["watchlist", "ratings"].includes(this.parent)) {
        return this.contents_platforms;
      }
    },
    quick_filters_applied() {
      return eval(this.quick_filters_mapping[this.parent]);
    },
    user_platforms() {
      var output_prep = [];
      var self = this;
      var filters_meta = this.quick_filters_meta.platforms.slice();

      if ((this.store.user.profile.platforms || []).length) {
        filters_meta.forEach(function (item, index) {
          if (
            self.store.user.profile.platforms.indexOf(item.platform_name) != -1
          ) {
            output_prep.push(item.platform_name);
          }
        });
      } else {
        filters_meta.forEach(function (item, index) {
          output_prep.push(item.platform_name);
        });
      }

      var output = [];

      var applied_platforms = [];
      var new_applied_platforms = [];
      this.quick_filters_applied.platforms.forEach(function (item, index) {
        if (output_prep.indexOf(item.platform_name) != -1) {
          new_applied_platforms.push(item);
          applied_platforms.push(item.platform_name);
        }
      });
      this.quick_filters_applied.platforms = new_applied_platforms.slice();

      filters_meta.forEach(function (item, index) {
        if (output_prep.indexOf(item.platform_name) != -1) {
          if (self.just_created) {
            if (applied_platforms.indexOf(item.platform_name) != -1) {
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
        this.quick_filters_meta.platforms = filters_meta.slice();
      }

      return output;
    },
    contents_platforms() {
      var contents_platforms = [];
      eval(this.contents[this.parent]).forEach(function (item, index) {
        if (Object.keys(item.where_to_watch || {}).includes("stream")) {
          contents_platforms.push(...Object.keys(item.where_to_watch.stream));
        } else if (Object.keys(item.where_to_watch || {}).includes("rent")) {
          contents_platforms.push(...Object.keys(item.where_to_watch.rent));
        } else if (Object.keys(item.where_to_watch || {}).includes("buy")) {
          contents_platforms.push(...Object.keys(item.where_to_watch.buy));
        }
      });

      var applied_platforms = [];
      var new_applied_platforms = [];
      this.quick_filters_applied.platforms.forEach(function (item, index) {
        if (
          contents_platforms.indexOf(
            item.platform_name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()
          ) != -1
        ) {
          new_applied_platforms.push(item);
          applied_platforms.push(item.platform_name);
        }
      });
      this.quick_filters_applied.platforms = new_applied_platforms.slice();

      var output = [];
      var self = this;
      var filters_meta = this.quick_filters_meta.platforms.slice();
      filters_meta.forEach(function (item, index) {
        if (
          contents_platforms.indexOf(
            item.platform_name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()
          ) != -1
        ) {
          if (self.just_created) {
            if (applied_platforms.indexOf(item.platform_name) != -1) {
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
        this.quick_filters_meta.platforms = filters_meta.slice();
      }

      return output;
    },
    reset_filter() {
      return this.$store.state.feed_filters.reset_platform_filter;
    },
  },
  watch: {
    reset_filter: {
      handler(reset) {
        if (reset) {
          eval(this.quick_filters_mapping[this.parent] + ".platforms = []");
          this.$store.state.feed_filters.reset_platform_filter = false;
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
.quick-filters-platforms {
  display: flex;
  padding: 5px 0px 5px 10px;
  border-radius: 5px;
  width: fit-content;
}
.quick-filter-platform-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 44px;
  height: 34px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.quick-filter-platform-checkbox
  input:checked
  ~ .quick-filter-checkmark-abled-platform {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
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
.quick-filter-checkmark-abled-platform {
  position: absolute;
  height: 34px;
  width: 34px;
  z-index: 1;
}
.quick-filter-platform-cropper {
  position: absolute;
  overflow: hidden;
  width: 34px;
  height: 34px;
  border-radius: 4px;
}
.quick-filter-platform-icon {
  width: 100%;
}
::-webkit-scrollbar {
  display: none;
}
</style>