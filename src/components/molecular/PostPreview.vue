<template>
  <div
    class="post-container"
    @click="$router.push(post.url.replace('https://flibo.ai', ''))"
  >
    <div
      v-if="post.image_info && post.image_info.image"
      class="content-post-image"
    >
      <img :src="post.image_info.image" alt="post-image" />
    </div>

    <div
      class="content-post-title"
      :style="
        !post.image_info || (post.image_info && !post.image_info.image)
          ? 'white-space: normal;'
          : ''
      "
    >
      {{ post.action_title }}
    </div>

    <div class="content-post-meta-box">
      <Vote
        style="min-width: 85px"
        :actionId="post.action_id"
        :totalVote="post.upvotes"
        :creatorId="store.user.id"
        :userVote="0"
      />

      <div
        style="
          display: flex;
          align-items: center;
          margin-left: 24px;
          cursor: pointer;
        "
      >
        <Button
          icon="comment"
          style="margin-top: -4px"
          buttonType="iconOnly"
          :size="16"
        />

        <p style="margin-left: 8px; font-size: 14px">
          {{ post.total_comments || 0 }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Vote from "./../atomic/Vote";
import Button from "./../atomic/Button";

export default {
  name: "app",
  components: {
    Vote,
    Button,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
    };
  },
};
</script>

<style scoped>
.post-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 200px;
  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.07);
  cursor: pointer;
}
.content-post-image {
  position: relative;
  display: flex;
  align-self: center;
  justify-content: center;
  height: 125px;
  width: 200px;
  overflow: hidden;
}
.content-post-image img {
  max-height: 100%;
}
.content-post-title {
  width: calc(100% - 8px);
  margin-left: 4px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: left;
  margin-top: 8px;
  color: #222222;
}
.content-post-meta-box {
  display: flex;
  margin-left: 4px;
}
</style>