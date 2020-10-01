<template>
  <div>
    <div class="artist-preview" :style="is_mobile ? '' : 'width: 1000px;'">
      <div class="artist-preview-header">
        <h2 v-if="!artistData">
          Fetching movies & shows by
          <span>{{ name.split(" ")[0] }}...</span>
        </h2>

        <h2
          style="width: 94%; overflow: hidden"
          v-if="artistData && artistData.length > 0"
        >
          Movies & shows by
          <span>{{ name.split(" ")[0] }}...</span>
        </h2>

        <h2 v-if="artistData && artistData.length == 0">
          Oops...could not find any more content.
        </h2>

        <Button
          buttonType="iconOnly"
          icon="cross"
          v-on:clicked="$emit('close-preview')"
          :size="24"
        />
      </div>

      <div
        class="artist-preview-poster-container"
        v-if="artistData && artistData.length > 0"
      >
        <Poster
          v-for="(content, index) in artistData"
          :key="index"
          class="poster"
          :containerWidth="125"
          :contentId="content.content_id"
          :image="content.poster"
          :title="content.title"
          :showTrailer="false"
          :whereToWatch="content.where_to_watch"
          :userPlatforms="
            store.user.id ? store.user.profile.platforms || [''] : ['']
          "
          :showName="true"
          :parent="parent"
          posterLocation="more_by_artist"
          v-on="$listeners"
        />
      </div>
    </div>

    <div class="modal-bg" @click="$emit('close-preview')"></div>
  </div>
</template>

<script>
import axios from "axios";
import Poster from "./Poster";
import Button from "./../atomic/Button";

export default {
  name: "ArtistPreview",
  components: { Poster, Button },
  props: {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      artistData: null,
    };
  },
  created() {
    var self = this;

    axios
      .post(this.$store.state.api_host + "more_by_artist", {
        session_id: this.$store.state.session_id,
        artist_id: this.id,
        country:
          this.$store.state.user.profile.country ||
          this.$store.state.guest_country,
        guest_id: this.$store.state.guest_id,
      })
      .then((response) => (this.artistData = response.data.contents))
      .catch(function (error) {
        console.log(error);
      });
  },
};
</script>

<style scoped>
.modal-bg {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
  animation: 0.2s ease-out 0s 1 load;
}
@keyframes load {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.artist-preview {
  position: fixed;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  color: black;
  width: 90vw;
  z-index: 100001;
  animation: 0.2s ease-out 0s 1 load;
}
.artist-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.artist-preview-poster-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: scroll;
  margin-top: 10px;
}
.artist-preview-poster-container::-webkit-scrollbar {
  display: none;
}
.artist-preview .poster {
  margin-right: 16px;
}

.artist-preview-header h2 {
  font-weight: 300;
  font-size: 16px;
  text-align: left;
}
.artist-preview-header span {
  font-weight: 900;
  font-size: 16px;
}
</style>