<template>
  <img :src="LogoSrc()" :alt="logoColor" :height="height + 'px'" />
</template>

<script>
export default {
  name: "Logo",
  props: {
    logoColor: {
      type: String,
      default: "dark"
    },
    height: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      darkLogoPath: require("../../assets/logo/logo-black.svg"),
      lightLogoPath: require("../../assets/logo/logo-white.svg")
    };
  },
  methods: {
    LogoSrc() {
      if (this.logoColor === "dark") {
        return this.darkLogoPath;
      } else if (this.logoColor === "light") {
        return this.lightLogoPath;
      }
    }
  }
};
</script>

<style scoped>
</style> 