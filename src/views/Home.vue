<template>
  <div class="feed-container">
    <Feed parent="home" v-on="$listeners" />
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
  },
};
</script>

<style scoped>
.feed-container {
  width: 100vw;
  max-width: 1000px;
}
</style>