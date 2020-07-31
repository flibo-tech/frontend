<template>
  <div class="quick-filters-discover-type">
    <input
      type="checkbox"
      id="quick-filters-discover-type-id"
      value="Only Suggestions"
      v-model="discover_type_tab"
      class="discover-type-checkbox-input"
    />
    <label
      @click="switchDiscoverTab"
      for="quick-filters-discover-type-id"
      class="discover-type-checkbox"
      :style="
        discover_type_tab.includes('Only Suggestions')
          ? 'background-color: #e8f0fe;border-color: #d2e3fc;'
          : ''
      "
    >
      <span class="discover-type-checkmark-text">Only Suggestions</span>
    </label>

    <button
      v-if="parent == 'home' && store.notifications.suggestions"
      class="suggestion-filter-active"
      :style="is_mobile ? '' : 'right: 195px;margin-top: 2px;'"
    />
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
      discover_type_tab: [],
      store: this.$store.state,
      store_mappings: {
        home: "this.$store.state.suggestions.discover_type_tab",
        search_results: "this.$store.state.discover_filters.discover_type_tab",
      },
    };
  },
  computed: {
    discover_type_tab_string() {
      return JSON.stringify(eval(this.store_mappings[this.parent])).replace(
        /['"]+/g,
        ""
      );
    },
    reset_filter() {
      return this.$store.state.feed_filters.reset_discover_type_filter;
    },
  },
  watch: {
    reset_filter: {
      handler(reset) {
        if (reset) {
          this.discover_type_tab = [];
          eval(
            this.store_mappings[this.parent] +
              ' = ["community", "friends", "flibo"]'
          );
          this.$store.state.feed_filters.reset_discover_type_filter = false;
        }
      },
    },
  },
  created() {
    if (this.discover_type_tab_string == "[community,friends,flibo]") {
      this.discover_type_tab = [];
    } else if (this.discover_type_tab_string == "[flibo]") {
      this.discover_type_tab = ["Only Suggestions"];
    }
  },
  methods: {
    switchDiscoverTab() {
      var self = this;
      setTimeout(self._switchDiscoverTab, 0);
    },
    _switchDiscoverTab() {
      if (this.discover_type_tab.includes("Only Suggestions")) {
        eval(this.store_mappings[this.parent] + ' = ["flibo"]');
      } else {
        eval(
          this.store_mappings[this.parent] +
            ' = ["community", "friends", "flibo"]'
        );
      }

      this.$emit("update-api-counter", {
        api:
          this.discover_type_tab_string == "[flibo]"
            ? this.parent + "_suggestions"
            : this.parent + "_feed",
      });

      if (
        this.$store.state.notifications.suggestions &&
        this.parent == "home"
      ) {
        this.$emit("refresh-suggestions");
      } else {
        this.$emit("filter-parent");
      }
    },
  },
};
</script>

<style scoped>
.quick-filters-discover-type {
  position: relative;
  width: fit-content;
  height: fit-content;
}
.discover-type-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.discover-type-checkbox {
  display: inline-block;
  position: relative;
  width: max-content;
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
.discover-type-checkmark-text {
  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.suggestion-filter-active {
  position: absolute;
  margin-left: 2px;
  height: 7px;
  width: 7px;
  background-image: url("./../../images/red_dot.png");
  background-color: #e9f3f8;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
</style>