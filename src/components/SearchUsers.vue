<template>
  <SearchBar parent="connections" />
</template>

<script>
import SearchBar from "./SearchBar";

export default {
  name: "App",
  components: {
    SearchBar
  },
  data() {
    return {
      store: this.$store.state
    };
  },
  created() {}
};
</script>

<style lang="scss"></style>
