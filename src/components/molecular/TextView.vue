<template>
  <div>
    <div class="text-view" :style="noWrap ? 'white-space: nowrap;' : ''">
      <span
        v-for="(item, index) in textArray.slice(0, previewLimitIndex)"
        :key="index"
        :style="isTag(item) ? 'font-weight: bold; cursor: pointer;' : ''"
        @click="!preventClick && isTag(item) ? openPreview(item) : ''"
      >
        <span v-if="isTag(item)">{{
          item
            .split(/\]\s*\(/)[0]
            .slice(1)
            .trim()
        }}</span>
        <span
          v-else
          :style="noWrap ? '' : 'white-space: break-spaces'"
          v-html="item"
        ></span>
      </span>

      <span
        class="text-view-see-more"
        v-if="showSeeMore"
        @click="!preventClick ? seeMore() : ''"
      >
        ... more
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
    actionId: {
      type: Number,
      required: false,
      default: null,
    },
    parent: {
      type: String,
      required: true,
    },
    preventClick: {
      type: Boolean,
      required: false,
      default: false,
    },
    noWrap: {
      type: Boolean,
      required: false,
      default: false,
    },
    previewLimit: {
      type: Number,
      required: false,
      default: 200,
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
      previewLimitIndex: 0,
      showSeeMore: false,
      lockSeeMore: false,
    };
  },
  computed: {
    textArray() {
      var splitArr = this.text
        ? this.text.split(/(\[.+?\]\((?:content|artist|user),\s*\d+\)|\n)/)
        : [];

      var itemText = "";
      var len = 0;
      var output = [];
      var lineBreaks = 0;

      if (!this.lockSeeMore) {
        for (const [index, item] of splitArr.entries()) {
          if (this.isTag(item)) {
            itemText = item
              .split(/\]\s*\(/)[0]
              .slice(1)
              .trim();
            if (len + itemText.length <= this.previewLimit) {
              len = len + itemText.length;
              output.push(item);
              this.previewLimitIndex = index + 1;
            } else {
              output.push(...splitArr.slice(index));
              this.previewLimitIndex = index;
              this.showSeeMore = true;
              break;
            }
          } else if (item == "\n") {
            lineBreaks++;
            if (lineBreaks < 5) {
              output.push(item);
              this.previewLimitIndex = index + 1;
            } else {
              output.push(...splitArr.slice(index));
              this.previewLimitIndex = index;
              this.showSeeMore = true;
              break;
            }
          } else {
            if (len + item.length <= this.previewLimit) {
              len = len + item.length;
              output.push(item);
              this.previewLimitIndex = index + 1;
            } else {
              var splitIndex = [...item.matchAll(new RegExp(" ", "gi"))]
                .map((item) => item.index)
                .filter((item) => item <= this.previewLimit - len)
                .slice(-1)[0];
              output.push(
                ...[item.slice(0, splitIndex), item.slice(splitIndex)]
              );
              output.push(...splitArr.slice(index + 1));
              this.previewLimitIndex = index + 1;
              this.showSeeMore = true;
              break;
            }
          }
        }
      } else {
        output = splitArr;
      }

      if (
        (this.$store.state.feed[this.parent] &&
          this.$store.state.feed[this.parent].see_more_elements &&
          this.$store.state.feed[this.parent].see_more_elements.includes(
            this.actionId
          )) ||
        this.lockSeeMore
      ) {
        this.previewLimitIndex = output.length;
      }

      if (this.previewLimitIndex == output.length) {
        this.showSeeMore = false;
      }

      return output;
    },
  },
  watch: {
    actionId: function (val) {
      this.previewLimitIndex = 0;
      this.showSeeMore = false;
      this.lockSeeMore = false;
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
    seeMore() {
      this.previewLimitIndex = this.textArray.length;
      this.lockSeeMore = true;
      this.showSeeMore = false;
      this.$nextTick(() => {
        this.$emit("see-more");
      });
    },
  },
};
</script>

<style scoped>
.text-view {
  font-size: 14px;
  display: inline;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #565656;
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
.text-view-see-more {
  color: #8e8e8e;
  margin-left: -1.5px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>