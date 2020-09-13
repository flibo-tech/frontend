<template>
  <div class="portrait-image-container">
    <img
      class="portrait-content-image"
      :src="imageUrl.replace('/w1280/', '/w500/')"
      :onerror="
        'this.onerror=null;this.src=url;'.replace(
          'url',
          '\'' + imageUrl.replace('/w1280/', '/original/') + '\''
        )
      "
    />

    <img
      class="portrait-background-image"
      :src="imageUrl.replace('/w1280/', '/w500/')"
      :onerror="
        'this.onerror=null;this.src=url;'.replace(
          'url',
          '\'' + imageUrl.replace('/w1280/', '/original/') + '\''
        )
      "
    />
  </div>
</template>

<script>
export default {
  name: "MovieImage",

  props: {
    imageUrl: {
      type: String,
    },
  },

  mounted() {
    window.scrollBy(0, 1);
  },
};
</script>

<style scoped>
.portrait-image-container {
  position: relative;
  width: 100%;
  height: 45vh;
  background-color: #f8f8f8;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  z-index: -1;
}
.portrait-content-image {
  position: relative;
  height: 45vh;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  z-index: 2;
}
.portrait-background-image {
  position: absolute;
  width: 100%;
  margin-top: -100%;
  margin-left: -50%;
  filter: blur(5px);
  z-index: 1;
}
</style>