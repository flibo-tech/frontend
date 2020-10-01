<template>
  <div>
    <div class="text-view">
      <span
        v-for="(item, index) in textArray"
        :key="index"
        :style="isTag(item) ? 'font-weight: bold; cursor: pointer;' : ''"
        @click="isTag(item) ? openPreview(item) : ''"
      >
        {{
          isTag(item)
            ? item
                .split(/\]\s*\(/)[0]
                .slice(1)
                .trim()
            : item
        }}
      </span>
    </div>

    <ContentPreview
      v-if="showPreview && clickedTag.type == 'content'"
      :id="clickedTag.id"
      :name="clickedTag.name"
      :parent="parent"
      @close-preview="showPreview = false"
      v-on="$listeners"
    />

    <ArtistPreview
      v-if="showPreview && clickedTag.type == 'artist'"
      :id="clickedTag.id"
      :name="clickedTag.name"
      @close-preview="showPreview = false"
      :parent="parent"
      v-on="$listeners"
    />

    <UserPreview
      v-if="showPreview && clickedTag.type == 'user'"
      :id="clickedTag.id"
      :name="clickedTag.name"
      :parent="parent"
      @close-preview="showPreview = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import ContentPreview from "./ContentPreview";
import ArtistPreview from "./ArtistPreview";
import UserPreview from "./UserPreview";

export default {
  name: "TextView",
  components: { ContentPreview, ArtistPreview, UserPreview },
  props: {
    text: {
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
      clickedTag: {
        name: null,
        type: null,
        id: null,
      },
      showPreview: false,
    };
  },
  computed: {
    textArray() {
      return this.text
        ? this.text.split(/(\[.+?\]\((?:content|artist|user),\s*\d+\))/)
        : [];
    },
  },
  methods: {
    isTag(item) {
      return RegExp(/\[.+?\]\((?:content|artist|user),\s*\d+\)/).test(item);
    },
    openPreview(item) {
      this.clickedTag.name = item.split(/\]\s*\(/)[0].slice(1);
      this.clickedTag.type = item
        .split(/\]\s*\(/)[1]
        .split(",")[0]
        .trim();
      this.clickedTag.id = parseInt(
        item
          .split(/\]\s*\(/)[1]
          .split(",")[1]
          .slice(0, -1)
          .trim()
      );
      this.showPreview = true;
    },
  },
};
</script>

<style scoped>
.text-view {
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: left;
  user-select: none;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>