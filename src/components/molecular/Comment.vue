<template>
  <div class="comment-comp-container">
    <div :id="'comment-' + currentComment.reaction_id">
      <div class="comment-comp-current">
        <div style="display: flex; justify-content: flex-start">
          <img
            @click="showPreview = true"
            class="comment-comp-profile"
            :src="currentComment.creator_picture"
          />

          <div class="comment-comp-content">
            <!-- comment content -->
            <div style="position: relative; margin: 0">
              <strong @click="showPreview = true">{{
                currentComment.creator_name
              }}</strong>
              <TextView
                class="comment-comp-textview"
                ref="commentContent"
                :style="
                  isSpoiler &&
                  showSpoilerAlert &&
                  currentComment.creator_id != store.user.id
                    ? 'filter: blur(5px); background-color: rgba(0, 0, 0, 0.4);'
                    : ''
                "
                v-if="currentComment.comment"
                :text="currentComment.comment"
                :parent="parent + '__comment' + (isChild ? '__child' : '')"
                v-on="$listeners"
              />

              <div
                class="comment-spoiler-layer"
                v-if="
                  isSpoiler &&
                  showSpoilerAlert &&
                  currentComment.creator_id != store.user.id
                "
                @click="alterSpoilerAlert"
              />
            </div>

            <!-- reaction section -->
            <div class="comment-comp-reaction">
              <TimeSince :timestamp="currentComment.created_at" :short="true" />
              <Vote
                class="comment-comp-vote"
                :actionId="currentComment.action_id"
                :parentReactionId="currentComment.reaction_id"
                :totalVote="currentComment.upvotes"
                :creatorId="currentComment.creator_id"
                :userVote="currentComment.user_vote"
                :fontSize="12"
                v-on="$listeners"
              />
              <p class="comment-comp-reply" @click="reply">Reply</p>
            </div>

            <!-- show replies section -->
            <div
              v-if="
                (currentComment.total_comments >
                  currentComment.comments.length &&
                  showRepliesHeader) ||
                (!showComments && currentComment.total_comments > 0)
              "
              @click="fetchComments"
              class="comment-comp-more"
            >
              <div
                v-if="!fetchingData"
                class="comment-comp-horizontal-divider"
              ></div>
              <p v-if="!fetchingData && !showComments">
                View {{ currentComment.total_comments }}
                {{ currentComment.total_comments > 1 ? "replies" : "reply" }}
              </p>
              <p v-if="!fetchingData && showComments">
                View previous
                {{
                  currentComment.total_comments - currentComment.comments.length
                }}
                {{
                  currentComment.total_comments -
                    currentComment.comments.length >
                  1
                    ? "replies"
                    : "reply"
                }}
              </p>
              <p v-if="fetchingData" class="comment-comp-loading">Loading...</p>
            </div>
          </div>
        </div>

        <Button
          v-if="currentComment.creator_id == store.user.id"
          style="margin-left: 8px; margin-top: 6px"
          icon="more"
          buttonType="iconOnly"
          :size="20"
          @clicked="showOptions = true"
        />
      </div>
    </div>

    <!-- sub comments section -->
    <transition name="comment">
      <div v-if="showComments" class="comment-comp-sub-comment">
        <div
          @click="[(showComments = false), (showRepliesHeader = true)]"
          class="comment-comp-divider-container"
        >
          <div class="comment-comp-vertical-divider"></div>
        </div>
        <div>
          <transition-group name="solo-comments">
            <Comment
              :currentComment="comment"
              :isChild="true"
              :parent="parent"
              v-for="comment in currentComment.comments.slice()"
              :key="comment.reaction_id"
              v-on="$listeners"
            />
          </transition-group>
        </div>
      </div>
    </transition>

    <UserPreview
      v-if="showPreview"
      :id="currentComment.creator_id"
      :name="currentComment.creator_name"
      :parent="parent + '__comment' + (isChild ? '__child' : '')"
      @close-preview="showPreview = false"
      v-on="$listeners"
    />

    <MoreOptions
      v-if="showOptions"
      :actionId="currentComment.action_id"
      :parentReactionId="currentComment.parent_reaction_id"
      :reactionId="currentComment.reaction_id"
      parent="comment"
      @close-more-options="showOptions = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import UserPreview from "./UserPreview";
import TextView from "./TextView";
import MoreOptions from "./MoreOptions";
import Vote from "./../atomic/Vote";
import TimeSince from "./../atomic/TimeSince";
import Button from "./../atomic/Button";

export default {
  name: "Comment",
  components: { TextView, Vote, UserPreview, TimeSince, Button, MoreOptions },
  props: {
    currentComment: {
      type: Object,
      required: true,
    },
    isChild: {
      type: Boolean,
      required: false,
      default: true,
    },
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showPreview: false,
      showComments: false,
      showRepliesHeader: true,
      fetchingData: false,
      showSpoilerAlert: true,
      store: this.$store.state,
      showOptions: false,
    };
  },
  mounted() {
    if (this.currentComment.comments.length) {
      this.showComments = true;
    }
  },
  computed: {
    isSpoiler() {
      return this.currentComment.spoiler;
    },
  },
  watch: {
    currentComment: {
      handler(val) {
        if (val.comments.length) {
          this.showComments = true;
        }
      },
      deep: true,
    },
  },
  methods: {
    alterSpoilerAlert() {
      this.$refs.commentContent.$el.style.filter = "none";
      this.$refs.commentContent.$el.style.backgroundColor = "transparent";
      this.showSpoilerAlert = false;
    },
    fetchComments() {
      if (
        (!this.showComments && this.currentComment.comments.length > 0) ||
        !this.showRepliesHeader
      ) {
        this.showComments = true;
        return;
      }
      this.showComments = true;
      this.fetchingData = true;
      axios
        .post(this.$store.state.api_host + "fetch_comments", {
          session_id: this.$store.state.session_id,
          guest_id: this.$store.state.guest_id,
          action_id: this.currentComment.action_id,
          parent_reaction_id: this.currentComment.reaction_id,
          fetched_comment_ids: this.currentComment.comments.map(
            (item) => item.reaction_id
          ),
        })
        .then((response) => {
          if (response.status == 200) {
            this.$emit("add-fetched-comments", response.data.comments);
            this.fetchingData = false;
          } else if (response.status == 204) {
            this.showRepliesHeader = false;
            this.fetchingData = false;
          }
        })
        .catch((error) => {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              this.$store.state.login_host +
              "logout?session_id=" +
              this.$store.state.session_id;
            this.$store.state.session_id = null;
            this.$emit("logging-out");
            this.fetchingData = false;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    reply() {
      if (!this.isChild) {
        this.$emit("reply", {
          creator_id: this.currentComment.creator_id,
          creator_name: this.currentComment.creator_name,
          reaction_id: this.currentComment.reaction_id,
        });
      } else {
        this.$emit("reply", {
          creator_id: this.currentComment.creator_id,
          creator_name: this.currentComment.creator_name,
          reaction_id: this.currentComment.parent_reaction_id,
        });
      }
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}

.comment-comp-profile {
  cursor: pointer;
  margin-right: 0.7em;
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

.comment-comp-content {
  margin: 0;
  display: flex;
  flex-flow: column nowrap;
}

.comment-comp-vote {
  min-width: 85px;
}

.comment-comp-current {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1em;
}

.comment-comp-reaction {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.comment-comp-reaction * {
  margin-right: 1em;
}

.comment-comp-reaction p {
  cursor: pointer;
  font-size: 12px;
}

.comment-comp-textview {
  display: inline;
}

.comment-comp-more {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 1em;
}

.comment-comp-more p {
  font-size: 12px;
  color: #8e8e8e;
  margin-left: 1em;
}

.comment-comp-horizontal-divider {
  height: 1px;
  background-color: #d1d1d1;
  width: 40px;
}

.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}
.comment-enter,
.comment-leave-to {
  transform: translateX(15px);
  opacity: 0;
}

.comment-comp-vertical-divider {
  width: 1px;
  height: calc(100% - 2em);
  background-color: #d1d1d1;
  opacity: 0.25;
}

.comment-comp-sub-comment {
  display: flex;
  justify-content: stretch;
}

.comment-comp-content strong {
  font-size: 14px;
  cursor: pointer;
  margin-right: 0.6em;
}
.comment-comp-divider-container {
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex: 0 0 30px;
  margin-right: 0.6em;
}

.comment-comp-reply {
  font-size: 12px;
  color: #8e8e8e;
}

.comment-comp-loading {
  color: #8e8e8e;
  font-size: 12px;
  margin-left: 51px;
}

.solo-comments-enter-active,
.solo-comments-leave-active {
  transition: all 0.3s ease;
}
.solo-comments-enter,
.solo-comments-leave-to {
  transform: translateX(15px);
  opacity: 0;
}
.comment-comp-container {
  text-align: left;
}
.comment-spoiler-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
}
</style>