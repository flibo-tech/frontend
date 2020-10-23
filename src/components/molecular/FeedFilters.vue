<template>
  <div
    class="feed-filters-container"
    :style="
      parent == 'search_results'
        ? 'display: flex; justify-content: center;'
        : ''
    "
  >
    <div style="overflow-x: scroll">
      <div class="feed-filters-top-row">
        <ContentFilter
          :class="parent != 'search_results' ? 'content-filter' : ''"
          :parent="parent"
          v-on="$listeners"
        />

        <SuggestionFilter
          v-if="
            !['search_results', 'watchlist', 'ratings', 'suggestions'].includes(
              parent
            )
          "
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

        <RatingFilter
          v-if="['ratings'].includes(parent)"
          class="rating-filter"
          :parent="parent"
          v-on="$listeners"
        />

        <PlatformFilter
          v-if="parent != 'search_results'"
          class="platform-filter"
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
      v-if="['watchlist', 'ratings', 'suggestions'].includes(parent)"
      class="genre-filter"
      :parent="parent"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import ContentFilter from "./../atomic/ContentFilter";
import SuggestionFilter from "./../atomic/SuggestionFilter";
import PlatformFilter from "./../atomic/PlatformFilter";
import GenreFilter from "./../atomic/GenreFilter";
import RatingFilter from "./../atomic/RatingFilter";

export default {
  name: "app",
  components: {
    ContentFilter,
    SuggestionFilter,
    PlatformFilter,
    GenreFilter,
    RatingFilter,
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
  display: flex;
  justify-items: center;
  width: fit-content;
  align-items: center;
}
.content-filter {
  border-right: 1px solid #dfe1e5;
  padding-right: 3px;
}
.rating-filter {
  border-right: 1px solid #dfe1e5;
  padding-right: 3px;
  margin-left: 8px;
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