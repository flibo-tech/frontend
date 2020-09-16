<template>
  <div
    class="landscape-image-container"
    :style="is_mobile ? '' : 'min-width: 100%;'"
  >
    <img
      ref="movieImage"
      class="landscape-content-image"
      :style="is_mobile ? '' : 'min-width: auto;height: 60vh;'"
      :src="is_mobile ? imageUrl.replace('/w1280/', '/w780/') : imageUrl"
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
      required: true,
    },
  },

  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
    };
  },

  mounted() {
    window.scrollBy(0, 1);
  },
};
</script>

<style scoped>
.landscape-image-container {
  position: relative;
  overflow: hidden;
  z-index: -1;
  min-width: 100vw;
  background-color: #f8f8f8;
}
.landscape-content-image {
  display: block;
  height: 45vh;
  margin-left: 50%;
  transform: translateX(-50%);
  min-width: 100vw;
  background-color: #f8f8f8;
}
</style>