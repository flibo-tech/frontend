<template>
  <div class="feed-filters-container">
    <div style="overflow-x: scroll;">
      <div class="feed-filters-top-row">
        <ContentFilter
          class="content-filter"
          :parent="parent"
          v-on="$listeners"
        />

        <SuggestionFilter
          v-if="parent != 'watchlist'"
          class="suggestion-filter"
          :style="
            parent == 'home'
              ? store.notifications.suggestions
                ? 'border-right: 1px solid #dfe1e5; padding-right: 15px;'
                : 'border-right: 1px solid #dfe1e5; padding-right: 8px;'
              : ''
          "
          :parent="parent"
          v-on="$listeners"
        />

        <PlatformFilter
          v-if="parent != 'search_results'"
          class="platform-filter"
          :style="parent == 'watchlist' ? 'grid-column-start: 3;' : ''"
          :parent="parent"
          v-on="$listeners"
        />

        <div class="more-filters" v-if="parent == 'home'">
          <div
            class="more-filters-icon"
            :style="is_mobile ? '' : 'height: 40px;width: 40px;'"
            @click="moreFilters"
          />
        </div>
      </div>
    </div>

    <GenreFilter
      v-if="parent == 'watchlist'"
      class="genre-filter"
      parent="watchlist"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import ContentFilter from "./../atomic/ContentFilter";
import SuggestionFilter from "./../atomic/SuggestionFilter";
import PlatformFilter from "./../atomic/PlatformFilter";
import GenreFilter from "./../atomic/GenreFilter";

export default {
  name: "app",
  components: {
    ContentFilter,
    SuggestionFilter,
    PlatformFilter,
    GenreFilter,
  },
  props: {
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
    };
  },
  methods: {
    moreFilters() {
      this.$emit("leave-feed");
      this.$router.push("/search");
    },
  },
};
</script>

<style scoped>
.feed-filters-container {
  position: relative;
}
.feed-filters-top-row {
  display: grid;
  grid-template-columns: auto 8px auto 8px auto 8px auto;
  grid-template-rows: auto;
  justify-items: center;
  width: fit-content;
  align-items: center;
}
.content-filter {
  grid-row-start: 1;
  grid-column-start: 1;
  border-right: 1px solid #dfe1e5;
  padding-right: 3px;
}
.suggestion-filter {
  grid-row-start: 1;
  grid-column-start: 3;
}
.platform-filter {
  grid-row-start: 1;
  grid-column-start: 5;
}
.more-filters {
  grid-row-start: 1;
  grid-column-start: 7;
}
.more-filters-icon {
  height: 34px;
  width: 34px;
  border-radius: 5px;
  background-image: url("./../../images/filter.svg");
  background-color: #ffffff;
  background-size: 80% 80%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  outline: 0;
  z-index: 10000;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.genre-filter {
  margin-top: 8px;
}
::-webkit-scrollbar {
  display: none;
}
</style>