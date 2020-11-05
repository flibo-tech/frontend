<template>
  <div class="quick-filters-content-type">
    <div v-for="(item, index) in ['All', 'Movie', 'TV']" :key="index">
      <input
        type="radio"
        :id="'quick-filters-content-type-' + index"
        v-bind:value="item"
        v-model="content_type_tab"
        class="content-type-filter-checkbox-input"
      />
      <label
        class="content-type-filter-checkbox"
        :for="'quick-filters-content-type-' + index"
        :style="
          content_type_tab == item
            ? 'background-color: #e8f0fe;border-color: #d2e3fc;'
            : ''
        "
        @click="content_type_tab != item ? switchContentTab(item) : ''"
      >
        <span class="content-type-checkmark-text">{{ item }}</span>
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
      content_type_tab: "All",
      store_mappings: {
        home: "this.$store.state.suggestions.content_type_tab",
        search_results: "this.$store.state.discover_filters.content_type_tab",
        watchlist: "this.$store.state.feed.watchlist.content_type_tab",
        ratings: "this.$store.state.feed.ratings.content_type_tab",
        suggestions: "this.$store.state.feed.suggestions.content_type_tab",
      },
    };
  },
  computed: {
    content_type_tab_string() {
      return JSON.stringify(eval(this.store_mappings[this.parent])).replace(
        /['"]+/g,
        ""
      );
    },
    reset_filter() {
      return this.$store.state.feed_filters.reset_content_type_filter;
    },
  },
  watch: {
    reset_filter: {
      handler(reset) {
        if (reset) {
          this.content_type_tab = "All";
          eval(this.store_mappings[this.parent] + ' = ["movie", "tv"]');
          this.$store.state.feed_filters.reset_content_type_filter = false;
        }
      },
    },
  },
  created() {
    if (this.content_type_tab_string == "[movie,tv]") {
      this.content_type_tab = "All";
    } else if (this.content_type_tab_string == "[movie]") {
      this.content_type_tab = "Movie";
    } else if (this.content_type_tab_string == "[tv]") {
      this.content_type_tab = "TV";
    }
  },
  methods: {
    switchContentTab(tab) {
      if (tab == "Movie") {
        eval(this.store_mappings[this.parent] + ' = ["movie"]');
      } else if (tab == "TV") {
        eval(this.store_mappings[this.parent] + ' = ["tv"]');
      } else if (tab == "All") {
        eval(this.store_mappings[this.parent] + ' = ["movie", "tv"]');
      }
      this.$emit("filter-parent");
    },
  },
};
</script>

<style scoped>
.quick-filters-content-type {
  position: relative;
  display: flex;
  width: fit-content;
  height: fit-content;
}
.content-type-filter-checkbox {
  display: inline-block;
  position: relative;
  width: max-content;
  margin-right: 5px;
  border-radius: 50px;
  background-color: #ffffff;
  padding: 5px 15px;
  border: 1px solid #dfe1e5;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-type-filter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.content-type-checkmark-text {
  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
</style>