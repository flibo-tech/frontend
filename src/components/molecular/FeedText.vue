<template>
  <div
    class="feed-text-container"
    :style="is_mobile ? '' : 'max-width: 1000px;'"
  >
    <div style="display: flex">
      <div
        class="info-profile-cropper"
        :style="
          user_id != null
            ? 'cursor: pointer;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;'
            : ''
        "
        v-if="feed_type"
        @click="openPreview(user_name, 'user', user_id)"
      >
        <img
          class="info-profile-pp"
          :src="user_picture"
          onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
        />
      </div>

      <div class="info-text-container">
        <p class="info-text" :style="is_mobile ? '' : 'font-size: 15px;'">
          <span
            class="info-text-clickable"
            style="text-transform: capitalize"
            @click="openPreview(user_name, 'user', user_id)"
          >
            {{ user_id == store.user.id ? "You" : user_name }}
          </span>

          <span v-if="feed_type == 'flibo'"> recommends you </span>

          <span v-if="item_type == 'rating'">
            {{
              other_user_rating == 2
                ? "liked"
                : other_user_rating == 3
                ? "loved"
                : "disliked"
            }}
          </span>

          <span v-if="item_type == 'watchlist'"> added </span>

          <span v-if="item_type == 'suggest'"> suggested </span>

          <span v-if="item_type == 'review'"> reviewed </span>

          <span v-if="item_type == 'request'">
            {{
              user_id == store.user.id
                ? Date.now() / 1000 - created_at < 6 * 24 * 60 * 60
                  ? "are"
                  : "were"
                : Date.now() / 1000 - created_at < 6 * 24 * 60 * 60
                ? "is"
                : "was"
            }}
            looking for suggestions
          </span>

          <span v-if="item_type != 'request'">
            {{ type == "movie" ? "movie" : "show" }}
          </span>

          <span
            v-if="item_type != 'request'"
            class="info-text-clickable"
            @click="openPreview(content_title, 'content', content_id)"
          >
            {{ content_title }}
          </span>

          <span v-if="item_type == 'watchlist'"> to watchlist </span>

          <span v-if="item_type == 'suggest'"> to everyone </span>
        </p>

        <TimeSince :timestamp="created_at" />
      </div>
    </div>

    <div
      v-if="['request', 'suggest', 'review'].includes(item_type)"
      class="feed-text-type"
    >
      {{ ["request", "review"].includes(item_type) ? item_type : "Suggestion" }}
    </div>

    <ContentPreview
      v-if="showPreview && clickedTag.type == 'content'"
      :id="clickedTag.id"
      :name="clickedTag.name"
      :parent="parent"
      @close-preview="showPreview = false"
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
import axios from "axios";
import ContentPreview from "./ContentPreview";
import UserPreview from "./UserPreview";
import TimeSince from "./../atomic/TimeSince";

export default {
  name: "FeedText",
  components: { UserPreview, ContentPreview, TimeSince },
  props: {
    user_id: {
      type: Number,
      required: false,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_picture: {
      type: String,
      required: true,
    },
    item_type: {
      type: String,
      required: true,
    },
    other_user_rating: {
      type: Number,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: null,
    },
    content_id: {
      type: Number,
      required: false,
      default: null,
    },
    content_title: {
      type: String,
      required: false,
      default: null,
    },
    feed_type: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
    created_at: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      show_others: false,
      other_users: [],
      store: this.$store.state,
      clickedTag: {
        name: null,
        type: null,
        id: null,
      },
      showPreview: false,
    };
  },
  methods: {
    openPreview(name, type, id) {
      this.clickedTag.name = name;
      this.clickedTag.type = type;
      this.clickedTag.id = id;
      this.showPreview = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.info-profile-cropper {
  height: 30px;
  width: 30px;
  min-width: 30px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.info-profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.info-text {
  white-space: initial;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.black-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.others-list-container {
  position: fixed;
  width: 64%;
  left: 18%;
  top: 25vh;
  max-height: 50vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  z-index: 100001;
}
.desktop-others-list-container {
  position: fixed;
  min-width: 300px;
  left: 50%;
  transform: translateX(-50%);
  top: 30vh;
  max-height: 50vh;
  overflow: scroll;
  z-index: 100001;
  background-color: #fff;
  border-radius: 7px;
  padding: 10px;
}
.other-user-container {
  position: relative;
  vertical-align: top;
  text-align: left;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  margin-top: 1%;
}
.desktop-other-user-container {
  position: relative;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 7px;
}
.other-user-pp-cropper {
  width: 35px;
  height: 35px;
  margin-left: 10px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
  background-color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.other-user-name-box {
  position: absolute;
  margin-top: -25px;
  left: 55px;
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-name-box h5 {
  font-size: 15px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
::-webkit-scrollbar {
  display: none;
}
.info-text-clickable {
  font-weight: bold;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.info-text-container {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}
.feed-text-container {
  display: flex;
  width: 100vw;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px 16px;
}
.feed-text-type {
  font-family: "Roboto", sans-serif;
  border: none;
  border-radius: 16px;
  margin-left: 16px;
  color: white;
  display: flex;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.5;
  padding: 5px 16px;
  width: fit-content;
  text-transform: capitalize;
  height: fit-content;
  background-color: #88bfff;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>