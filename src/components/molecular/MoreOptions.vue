<template>
  <div>
    <div
      class="more-options-container"
      :style="is_mobile ? '' : 'max-width: 800px;'"
    >
      <div v-if="showOptions">
        <p @click="(showOptions = false), (deletePrompt = true)">
          Delete
          {{
            parent == "suggest"
              ? "suggestion"
              : [
                  "watch_later",
                  "rating",
                  "old_watch_later",
                  "old_rating",
                ].includes(parent)
              ? ""
              : parent
          }}
        </p>
      </div>

      <div v-if="deletePrompt">
        <p
          style="
            font-size: 16px;
            white-space: nowrap;
            margin-bottom: 24px;
            text-align: center;
          "
        >
          Are you sure?
        </p>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          "
        >
          <div>
            <Button
              buttonType="textOnly"
              text="Cancel"
              :fontSize="16"
              fontColor="#000"
              padding="0px 48px"
              @clicked="$emit('close-more-options')"
            />
          </div>

          <div style="border-left: solid 1px #919090">
            <Button
              buttonType="textOnly"
              text="Delete"
              :capitalize="false"
              :loading="true"
              loaderColor="#f54029"
              :fontSize="16"
              fontColor="#f54029"
              padding="0px 48px"
              @clicked="deleteItem"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="modal-bg" @click="$emit('close-more-options')"></div>
  </div>
</template>

<script>
import axios from "axios";
import Button from "./../atomic/Button";

export default {
  name: "MoreOptions",
  components: {
    Button,
  },
  props: {
    actionId: {
      type: Number,
      required: true,
    },
    parentReactionId: {
      type: Number,
      required: false,
      default: null,
    },
    reactionId: {
      type: Number,
      required: false,
      default: null,
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
      showOptions: true,
      deletePrompt: false,
    };
  },
  methods: {
    deleteItem() {
      if (!this.reactionId) {
        axios
          .post(this.$store.state.api_host + "delete_action", {
            session_id: this.$store.state.session_id,
            action_id: this.actionId,
          })
          .then((response) => {
            this.$emit("close-more-options");
            this.$emit("delete-item", {
              actionId: this.actionId,
            });
          })
          .catch((error) => {
            this.$emit("close-more-options");
          });
      } else {
        axios
          .post(this.$store.state.api_host + "delete_comment", {
            session_id: this.$store.state.session_id,
            action_id: this.actionId,
            parent_reaction_id: this.parentReactionId,
            reaction_id: this.reactionId,
          })
          .then((response) => {
            this.$emit("close-more-options");
            this.$emit("delete-comment", {
              actionId: this.actionId,
              parentReactionId: this.parentReactionId,
              reactionId: this.reactionId,
            });
          })
          .catch((error) => {
            this.$emit("close-more-options");
          });
      }
    },
  },
};
</script>

<style scoped>
.more-options-container {
  position: fixed;
  min-width: 50vw;
  max-width: 95vw;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  justify-items: center;
  max-height: 70vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 16px;
  z-index: 1000001;
}
.more-options-container p {
  font-size: 16px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: left;
  cursor: pointer;
}
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
</style>