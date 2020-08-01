<template>
  <div class="feed-container">
    <Feed parent="search_results" v-on="$listeners" />
  </div>
</template>

<script>
import Feed from "./../components/molecular/Feed";

export default {
  name: "app",
  components: {
    Feed,
  },
  created() {
    this.$store.state.current_path = this.$route.path;
    if (
      !this.$store.state.discover_filters.filtered_content.length &&
      !this.$store.state.discover_filters.fetching_filtered
    ) {
      this.$router.push("/search");
    }
  },
};
</script>

<style scoped>
.feed-container {
  width: 100vw;
  max-width: 1000px;
}
</style>