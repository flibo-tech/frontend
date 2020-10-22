<template>
  <div
    class="feed-card-container"
    :style="is_mobile ? '' : 'grid-template-columns: 16px 200px 48px 1fr 16px;'"
  >
    <div class="feed-card-text">
      <FeedText
        :user_id="content.creator_id"
        :user_name="content.creator_name"
        :user_picture="content.creator_picture"
        :item_type="content.action_type"
        :other_user_rating="content.creator_rating"
        :type="content.type"
        :feed_type="content.feed_type"
        :content_id="content.content_id"
        :content_title="content.content_title"
        :parent="parent"
        :created_at="content.created_at"
        v-on="$listeners"
      />
    </div>

    <div class="feed-description">
      <div
        class="feed-description-textbox"
        ref="feedDescription"
        :style="
          isSpoiler && showSpoilerAlert && content.creator_id != store.user.id
            ? 'filter: blur(5px); background-color: rgba(0, 0, 0, 0.4);'
            : ''
        "
      >
        <p
          v-if="
            ['request', 'suggest', 'review'].includes(content.action_type)
              ? content.action_title
              : content.action_type == null
              ? true
              : false
          "
        >
          <span style="margin-right: 8px">
            {{
              content.action_type != null
                ? content.action_title
                : content.content_title
            }}
          </span>

          <span
            v-if="
              ['request', 'suggest', 'review'].includes(content.action_type)
            "
            class="feed-text-type"
          >
            {{
              ["request", "review"].includes(content.action_type)
                ? content.action_type
                : "Suggestion"
            }}
          </span>
        </p>

        <TextView
          v-if="content.description"
          :text="content.description"
          :actionId="content.action_id"
          :parent="parent"
          v-on="$listeners"
        />
      </div>

      <div
        class="spoiler-layer"
        v-if="
          isSpoiler && showSpoilerAlert && content.creator_id != store.user.id
        "
        @click="alterSpoilerAlert"
      >
        <h2>SPOILER</h2>
        <p>It may have spoilers. Tap to see.</p>
      </div>
    </div>

    <div
      v-if="content.image_info && content.image_info.image"
      class="feed-card-image"
      :style="is_mobile ? '' : 'align-self: flex-start; padding: 0px 16px;'"
    >
      <img
        :src="content.image_info.image"
        alt="feed-image"
        @click="
          showPreview(
            content.image_info.content_id,
            content.image_info.content_title
          )
        "
      />

      <PlatformBar
        v-if="whereToWatchOptions"
        class="feed-card-platform-bar"
        :contentId="content.image_info.content_id"
        :userPlatforms="
          store.user.id ? store.user.profile.platforms || [''] : ['']
        "
        :contentPlatforms="whereToWatchOptions"
        :containerWidth="is_mobile ? 150 : 200"
        :parent="parent"
        posterLocation="feedcard_image"
        v-on="$listeners"
      />
    </div>

    <div
      v-if="
        (content.image_info == null ||
          (content.image_info && content.image_info.image == null)) &&
        whereToWatchOptions
      "
      class="feed-card-platforms-container"
    >
      <div
        class="feed-card-platform-container"
        v-for="(item, index) in whereToWatchOptions"
        :key="index"
      >
        <div
          @click="goToPlatform(item, content.content_id, 'feedcard')"
          class="feed-card-platform-cropper"
          :style="
            is_mobile ? '' : 'width: 50px;height: 50px;border-radius: 10px;'
          "
        >
          <img
            v-bind:src="
              'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
              index +
              '.jpg'
            "
            class="feed-card-platform-icon"
          />
        </div>
      </div>
    </div>

    <div
      class="feed-card-actions-container"
      :style="
        content.image_info == null ||
        (content.image_info && content.image_info.image == null) ||
        !whereToWatchOptions
          ? 'margin-top: 16px;'
          : ''
      "
    >
      <Vote
        style="min-width: 85px"
        :actionId="content.action_id"
        :totalVote="content.upvotes"
        :creatorId="content.creator_id"
        :userVote="content.user_vote"
        v-on="$listeners"
      />

      <div
        style="
          display: flex;
          align-items: center;
          margin-left: 24px;
          cursor: pointer;
        "
        @click="
          RegExp(/^.*_details$/).test(parent)
            ? scrollToComments()
            : goToDetails()
        "
      >
        <Button
          icon="comment"
          style="margin-top: -4px"
          buttonType="iconOnly"
          :size="18"
        />

        <p style="margin-left: 8px; font-size: 14px; user-select: none">
          {{ content.total_comments || 0 }}
        </p>
      </div>

      <Button
        style="transform: rotate(22deg); margin-left: 24px; margin-top: -6px"
        icon="send_outline"
        buttonType="iconOnly"
        :size="21"
        @clicked="share_prompt = true"
      />
    </div>

    <div
      v-if="onCardComments().length"
      class="feed-card-top-comment"
      @click="goToDetails"
    >
      <div
        v-for="(item, index) in onCardComments()"
        :key="index"
        style="margin-top: 4px"
      >
        <span
          style="
            font-weight: bold;
            margin-right: 4px;
            text-transform: capitalize;
          "
        >
          {{ item.split("^")[0] }}
        </span>

        <TextView
          style="display: inline"
          :text="item.split('^')[1]"
          parent="top_comment"
          :preventClick="true"
          :previewLimit="80"
        />
      </div>
    </div>

    <div
      v-if="
        ['watchlist', 'ratings', 'search_results', 'home', 'posts'].includes(
          parent
        ) &&
        content.total_comments &&
        content.total_comments > onCardComments().length
      "
      class="feed-card-view-all-comments"
      @click="goToDetails"
    >
      View {{ content.total_comments > 1 ? "all" : "" }}
      {{ content.total_comments }}
      {{ content.total_comments > 1 ? "comments" : "comment" }}
    </div>

    <div
      class="create-comment-container"
      :id="'create-comment-container-' + content.action_id"
      :style="
        RegExp(/^.*_details$/).test(parent)
          ? { position: 'fixed', bottom: 0, padding: '8px 16px 4px 16px' }
          : {
              position: 'relative',
              marginTop: '16px',
              padding: '0px 16px',
              alignSelf: 'self-start',
            }
      "
    >
      <div class="create-comment-profile-cropper">
        <img
          class="create-comment-profile-pp"
          :src="store.user.picture || 'invalid'"
          onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
          alt="profile-image"
        />
      </div>

      <TextEditor
        style="margin-top: 4px; flex: 1"
        parent="comment"
        :grandParent="parent"
        :actionId="content.action_id"
        :replyInfo="replyInfo"
        v-on="$listeners"
      />
    </div>

    <ContentPreview
      v-if="previewDetails.show"
      :id="previewDetails.id"
      :name="previewDetails.title"
      :parent="parent"
      @close-preview="previewDetails.show = false"
      v-on="$listeners"
    />

    <SharePrompt
      v-if="share_prompt"
      :parent="parent"
      :url="content.url"
      :image="content.image_info ? content.image_info.image : null"
      :actionId="content.action_id"
      @close-share-prompt="share_prompt = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import FeedText from "./FeedText";
import TextView from "./TextView";
import PlatformBar from "./../atomic/PlatformBar";
import ContentPreview from "./ContentPreview";
import Vote from "./../atomic/Vote";
import SharePrompt from "./../atomic/SharePrompt";
import Button from "./../atomic/Button";
import TextEditor from "./TextEditor";

export default {
  name: "App",
  components: {
    FeedText,
    TextView,
    PlatformBar,
    ContentPreview,
    Vote,
    SharePrompt,
    Button,
    TextEditor,
  },
  props: {
    content: {
      type: Object,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
    replyInfo: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      screenWidth: window.innerWidth,
      store: this.$store.state,
      showSpoilerAlert: true,
      showContentPreview: false,
      share_prompt: false,
      previewDetails: {
        show: false,
        title: null,
        id: null,
      },
    };
  },
  computed: {
    isSpoiler() {
      return this.content.spoiler;
    },
    whereToWatchOptions() {
      var whereToWatch =
        this.content.image_info && this.content.image_info.where_to_watch
          ? this.content.image_info.where_to_watch
          : this.content.where_to_watch
          ? this.content.where_to_watch
          : null;
      if (whereToWatch) {
        return whereToWatch.stream;
      } else {
        return null;
      }
    },
  },
  methods: {
    alterSpoilerAlert() {
      this.$refs.feedDescription.style.filter = "none";
      this.$refs.feedDescription.style.backgroundColor = "transparent";
      this.showSpoilerAlert = false;
    },
    showPreview(id, title) {
      this.previewDetails.id = id;
      this.previewDetails.title = title;
      this.previewDetails.show = true;
    },
    scrollToComments() {
      var element = document.getElementById("comments-container");
      if (element) {
        var topbarHeight = 50;
        var elementPosition = element.getBoundingClientRect().top;
        var offsetPosition =
          window.scrollY + elementPosition - topbarHeight - 10;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    goToDetails() {
      this.$emit("leave-feed");
      this.$router.push(
        this.content.url.replace("https://flibo.ai", "") + "?focusComments=true"
      );
    },
    goToPlatform(link, content_id, traffic_origin) {
      this.$emit("leave-feed");

      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: this.parent + "__" + traffic_origin,
      };
      this.$emit("update-api-counter", activity);
    },
    onCardComments() {
      var output = [];
      if (this.content.top_comment) {
        output.push(this.content.top_comment);
      }
      if (this.content.newComments && this.content.newComments.length) {
        output.push(...this.content.newComments);
      }

      return output;
    },
  },
};
</script>

<style lang="scss" scoped>
.feed-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.feed-card-text {
  align-self: flex-start;
}
::-webkit-scrollbar {
  display: none;
}
.feed-description {
  position: relative;
  width: 100%;
  margin-top: 16px;
  text-align: left;
}
.feed-description-textbox {
  padding: 0px 16px;
}
.feed-description p {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: normal;
  line-height: 1.5;
}
.spoiler-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-family: "Roboto", sans-serif;
  border: none;
  color: white;
  display: flex;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.spoiler-layer h2 {
  font-size: 22px;
}
.feed-card-image {
  position: relative;
  display: flex;
  align-self: center;
  margin-top: 16px;
}
.feed-card-image img {
  max-width: 100%;
  max-height: 250px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-card-platform-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
}
.feed-card-actions-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0px 16px;
  margin-top: 30px;
}
.feed-card-platform-cropper {
  width: 45px;
  height: 45px;
  overflow: hidden;
  border-radius: 50%;
}
.feed-card-platform-icon {
  width: 100%;
}
.feed-card-platform-container {
  margin-right: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-card-platforms-container {
  display: flex;
  margin-top: 16px;
  overflow: scroll;
  width: 100%;
  text-align: left;
  padding: 0px 16px;
}
.create-comment-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  align-items: flex-start;
  justify-content: flex-start;
  z-index: 1;
  background-color: #fff;
}
.create-comment-profile-cropper {
  height: 30px;
  width: 30px;
  min-width: 30px;
  margin-right: 8px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.create-comment-profile-pp {
  width: 101%;
}
.feed-text-type {
  font-family: "Roboto", sans-serif;
  border: none;
  border-radius: 16px;
  font-weight: normal;
  color: white;
  display: inline;
  vertical-align: text-top;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.5;
  padding: 5px 10px;
  text-transform: capitalize;
  background-color: #88bfff;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-card-top-comment {
  width: 100%;
  padding: 0 16px;
  margin-top: 12px;
  color: #333333;
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  font-family: "Roboto", sans-serif;
  text-align: left;
  cursor: pointer;
}
.feed-card-view-all-comments {
  width: 100%;
  padding: 0 16px;
  margin-top: 4px;
  font-size: 14px;
  display: inline;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #8e8e8e;
  font-family: "Roboto", sans-serif;
  text-align: left;
  cursor: pointer;
}
</style>
