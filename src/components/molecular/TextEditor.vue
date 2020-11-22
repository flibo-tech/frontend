<template>
  <div>
    <div class="textfield-wrapper">
      <p
        v-if="showLengthWarning"
        :style="
          'text-align: left; color: red; font-size: ' +
          (parent === 'post' ? '16px' : '14px')
        "
      >
        Text cannot be longer than {{ characterLimit }} characters
      </p>

      <textarea
        @paste.prevent
        @focus="focusTextArea"
        @blur="unfocusTextArea"
        :style="parent === 'post' ? {} : { 'font-size': '14px' }"
        :rows="parent === 'post' ? 7 : 1"
        :value="content"
        @input="updateContent"
        :ref="'inputField-' + actionId"
        :id="'inputField-' + actionId"
        :placeholder="
          parent === 'post'
            ? 'Express yourself. Tag friends, movies, artists using @...'
            : cardType && cardType == 'request'
            ? 'Suggest something...'
            : 'Add a comment...'
        "
      ></textarea>

      <div
        class="textfield-spoiler-n-counter"
        @click="stopUnfocus"
        :style="
          parent === 'comment'
            ? RegExp(/^.*_details$/).test(grandParent)
              ? { marginTop: '8px' }
              : { minHeight: '24px', marginTop: '4px' }
            : {}
        "
      >
        <transition name="counter-animation">
          <div v-if="showSpoilerTag" class="textfield-spoiler-container">
            <div
              class="textfield-spoiler"
              v-bind:class="{ active: store.create.spoiler }"
              @click="alterSpoilerTag"
            >
              {{ store.create.spoiler ? "Spoiler" : "Not spoiler" }}
            </div>
            <ToolTip
              v-if="
                parent === 'post' &&
                store.create.never_tapped_spoiler &&
                !store.create.spoiler
              "
              class="textfield-spoiler-tooltip"
              text="Tap this if your post has spoiler"
              :reverse="true"
            />
          </div>
        </transition>
        <div style="display: flex">
          <transition name="counter-animation">
            <CharacterCounter
              v-if="showCounter"
              :limit="characterLimit"
              :count="length"
              :radius="9"
              :width="3"
            />
          </transition>

          <transition name="counter-animation">
            <Button
              v-if="parent === 'comment' && showCounter"
              style="margin-left: 16px"
              buttonType="textOnly"
              text="Post"
              :fontColor="content && !showLengthWarning ? '#7352ff' : null"
              @clicked="showLengthWarning ? '' : postComment()"
            />
          </transition>
        </div>
      </div>
    </div>

    <TagSuggestions
      ref="editorSuggestionBox"
      class="editor-suggestion-box"
      :style="
        parent != 'comment'
          ? is_mobile
            ? 'top: 0; height: calc(' + caretLocationY + 'px - 18px - 4px);'
            : 'top: calc(' +
              caretLocationY +
              'px + 8px); left: calc(50vw - 500px + 24px); width: 65vw;max-height: 350px;'
          : customStyle
      "
      v-if="searchString"
      :searchString="searchString"
      searchType="all"
      v-on:clicked="addHighlight"
    />
  </div>
</template>

<script>
import Emoji from "./../../assets/emoji";
import CharacterCounter from "./../atomic/CharacterCounter";
import ToolTip from "./../atomic/ToolTip";
import Button from "./../atomic/Button";
import TagSuggestions from "./TagSuggestions";
import axios from "axios";

export default {
  name: "TextEditor",
  components: { CharacterCounter, TagSuggestions, ToolTip, Button },
  props: {
    parent: {
      type: String,
      required: true,
    },
    grandParent: {
      type: String,
      required: false,
      default: null,
    },
    cardType: {
      type: String,
      required: false,
      default: null,
    },
    actionId: {
      type: Number,
      required: false,
      default: null,
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
      store: this.$store.state,
      content: "",
      selectedWord: "",
      textboxLimit: null,
      showSpoilerTag: false,
      showCounter: false,
      highlightWords: {},
      caretLocationY: null,
      caretIndex: 0,
      oldInput: "",
      letUnfocus: true,
      createCommentHeight: 0,
      preventContentWatch: false,
      prevHeight: 0,
      showLengthWarning: false,
    };
  },
  mounted() {
    setTimeout(() => {
      var element = document.getElementById(
        "create-comment-container-" + this.actionId
      );
      if (element) {
        this.createCommentHeight = element.getBoundingClientRect().height;
      }
    }, 0);

    if (this.actionId) {
      this.restoreEditor();
    }
  },
  computed: {
    characterLimit() {
      return parent === "post" ? 350 : 350;
    },
    processedContent() {
      let text = this.content;
      let matchedEmojis = null;

      const count = (str) => {
        const re = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
        return (str || "").match(re) || [];
      };
      matchedEmojis = count(this.content);

      matchedEmojis.forEach((el) => {
        let code = this.emojiUnicode(el);
        text = text.replace(el, `&#x${code}`);
      });
      Object.keys(this.highlightWords).forEach((key) => {
        if (this.content.match(key)) {
          let regex = new RegExp(`@${key}`, "g");
          text = text.replace(
            regex,
            `[${this.highlightWords[key].subject}](${
              this.highlightWords[key].subject_type == "friend"
                ? "user"
                : this.highlightWords[key].subject_type
            },${this.highlightWords[key].subject_id})`
          );
        }
      });
      return text;
    },
    searchString() {
      let str = "";
      let contentSlice = this.content.slice(0, this.caretIndex);
      if (
        contentSlice.match(/@./g) &&
        contentSlice.lastIndexOf("@") > contentSlice.lastIndexOf(" ")
      ) {
        str = contentSlice.substring(
          contentSlice.lastIndexOf("@") + 1,
          contentSlice.indexOf(" ", contentSlice.lastIndexOf("@")) === -1
            ? contentSlice.length
            : contentSlice.indexOf(" ", contentSlice.lastIndexOf("@"))
        );
      }
      if (
        Object.keys(this.highlightWords).includes(str) ||
        Object.keys(this.highlightWords)
          .map((key) => key.slice(0, -1))
          .includes(str)
      ) {
        str = "";
      }
      if (str) {
        this.caretLocationY = this.caretLocation().y;
      }
      return str;
    },
    length() {
      let plainText = this.content;
      Object.keys(this.highlightWords).forEach((key) => {
        plainText = plainText.replace(new RegExp("@" + key, "g"), "");
      });
      plainText = plainText.replace(/\s\s+/g, " ").trim();

      var element = document.getElementById("inputField-" + this.actionId);
      if (plainText.length > this.characterLimit) {
        element.style.border = "solid 1px red";
        this.showLengthWarning = true;
        this.$emit("prevent-post", true);
      } else {
        element.style.border = "none";
        this.showLengthWarning = false;
        this.$emit("prevent-post", false);
      }
      return plainText.length;
    },
    customStyle() {
      var element = document.getElementById(
        "create-comment-container-" + this.actionId
      );

      if (element && element.style.position == "fixed") {
        const tagSuggestionHeight =
          "calc(" +
          window.innerHeight +
          "px - " +
          this.createCommentHeight +
          "px - 50px - 8px)";
        return (
          "position: absolute; top: 0px; transform: translateY(-100%); width: 100vw; left: 0; height: " +
          tagSuggestionHeight +
          ";"
        );
      } else {
        const tagSuggestionHeight =
          "calc(" +
          Math.min(
            window.innerHeight,
            element.getBoundingClientRect().bottom + 10
          ) +
          "px - " +
          this.createCommentHeight +
          "px - 50px - 8px - 8px - " +
          (this.grandParent == "home" ? 50 : 0) +
          "px)";

        return (
          "position: absolute; top: -8px; transform: translateY(-100%); width: 100vw; left: 0; height: " +
          tagSuggestionHeight +
          ";"
        );
      }
    },
  },
  watch: {
    content: function (val) {
      if (!this.preventContentWatch) {
        this.updateCaretIndex();
        if (this.content) {
          this.addEmoji(val);
        }
        this.autoGrow(this.$refs["inputField-" + this.actionId]);
        if (this.length >= this.characterLimit) {
          this.textboxLimit = this.content.length;
        }
        if (this.parent == "post") {
          if (["request"].includes(this.store.create.type)) {
            var newIds = [];
            for (let content in this.highlightWords) {
              if (
                this.highlightWords[content].subject_type == "content" &&
                !this.store.create.ids.includes(
                  this.highlightWords[content].subject_id
                )
              ) {
                newIds.push(this.highlightWords[content].subject_id);
              }
            }
            if (newIds.length) {
              this.store.create.ids.push(...newIds);
            }
          }

          this.store.create.processedContent = this.processedContent;
        } else if (
          ["watchlist", "ratings", "search_results", "home", "posts"].includes(
            this.grandParent
          )
        ) {
          this.$store.state.feed[this.grandParent].element_comments[
            this.actionId
          ] = {
            content: this.content,
            highlightWords: this.highlightWords,
            processedContent: this.processedContent,
          };
        }
      }
    },
    actionId: function (val) {
      this.restoreEditor(true);
    },
    replyInfo: function (val) {
      if (val) {
        this.restoreEditor();
        this.content = "@";
        this.caretIndex = 1;
        this.addHighlight({
          subject_id: val.creator_id,
          subject: val.creator_name,
          subject_type: "user",
        });
      }
    },
  },
  methods: {
    updateContent(e) {
      var text = this.textboxLimit
        ? e.target.value.slice(0, this.textboxLimit)
        : e.target.value;

      if (text.length < this.oldInput.length) {
        this.textboxLimit = null;
        this.content = text;
        this.removeSearch();
      } else {
        this.$refs["inputField-" + this.actionId].value = text;
        this.content = text;
        this.oldInput = text;
      }
    },
    focusTextArea() {
      if (this.$store.state.session_id) {
        if (this.parent == "comment") {
          this.scrollToCreateComment();
        }
        this.showSpoilerTag = true;
        this.showCounter = true;
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    unfocusTextArea() {
      setTimeout(
        () => {
          if (this.letUnfocus) {
            if (this.parent === "comment") {
              var element = document.getElementById(
                "create-comment-container-" + this.actionId
              );
              if (element) {
                this.createCommentHeight = element.getBoundingClientRect().height;
                if (element.style.position == "fixed") {
                  var container_element = document.getElementById(
                    "action-details-container"
                  );
                  container_element.style.paddingBottom =
                    this.createCommentHeight + 8 - 24 + "px";
                }
              }
              this.showSpoilerTag = false;
            }
            this.showCounter = false;
          }
          this.letUnfocus = true;
        },
        this.is_mobile ? 0 : 500
      );
    },
    alterSpoilerTag() {
      this.store.create.spoiler = !this.store.create.spoiler;
      if (this.parent === "post") {
        this.store.create.never_tapped_spoiler = false;
      }
    },
    stopUnfocus() {
      this.letUnfocus = false;
      if (this.showCounter) {
        this.$refs["inputField-" + this.actionId].focus();
      }
    },
    scrollToCreateComment() {
      if (this.is_mobile) {
        var element = document.getElementById(
          "create-comment-container-" + this.actionId
        );
        if (element && element.style.position != "fixed") {
          this.store.letNavAutoHide = false;
          setTimeout(() => {
            element.scrollIntoView(false);
            window.scrollBy(0, 10);
            setTimeout(() => {
              this.store.letNavAutoHide = true;
            }, 250);
          }, 250);
        }
      }
    },
    updateCaretIndex() {
      setTimeout(() => {
        var elem = this.$refs["inputField-" + this.actionId];
        this.caretIndex = elem ? elem.selectionEnd : 0;
      }, 0);
    },
    caretLocation() {
      let input = this.$refs["inputField-" + this.actionId];
      let selectionPoint = this.caretIndex;
      const { offsetLeft: inputX, offsetTop: inputY } = input;
      // create a dummy element that will be a clone of our input
      const div = document.createElement("div");
      // get the computed style of the input and clone it onto the dummy element
      const copyStyle = getComputedStyle(input);
      for (const prop of copyStyle) {
        div.style[prop] = copyStyle[prop];
      }
      // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
      const swap = ".";
      const inputValue =
        input.tagName === "INPUT"
          ? input.value.replace(/ /g, swap)
          : input.value;
      // set the div content to that of the textarea up until selection
      const textContent = inputValue.substr(0, selectionPoint);
      // set the text content of the dummy element div
      div.textContent = textContent;
      if (input.tagName === "TEXTAREA") div.style.height = "auto";
      // if a single line input then the div needs to be single line and not break out like a text area
      if (input.tagName === "INPUT") div.style.width = "auto";
      // create a marker element to obtain caret position
      const span = document.createElement("span");
      // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
      span.textContent = inputValue.substr(selectionPoint) || ".";
      // append the span marker to the div
      div.appendChild(span);
      // append the dummy element to the body
      document.body.appendChild(div);
      // get the marker position, this is the caret position top and left relative to the input
      const { offsetLeft: spanX } = span;
      div.removeChild(span);
      const spanY = div.getBoundingClientRect().height;
      // lastly, remove that dummy element
      // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
      document.body.removeChild(div);
      // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
      return {
        x: inputX + spanX,
        y: inputY + spanY,
      };
    },
    autoGrow(element, scroll = true) {
      const currentHeight =
        Number(
          element.style.height.substring(0, element.style.height.length - 2)
        ) || element.scrollHeight;
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";

      if (!scroll && currentHeight != element.scrollHeight) {
        window.scrollBy(0, currentHeight - element.scrollHeight);
      }

      if (this.parent == "comment") {
        if (
          ["watchlist", "ratings", "search_results", "home", "posts"].includes(
            this.grandParent
          ) &&
          this.prevHeight != element.scrollHeight
        ) {
          this.$emit("update-element-heights");
        }
        this.prevHeight = element.scrollHeight;

        if (scroll) {
          this.scrollToCreateComment();

          var element = document.getElementById(
            "create-comment-container-" + this.actionId
          );
          this.createCommentHeight = element.getBoundingClientRect().height;
          if (element.style.position == "fixed") {
            var container_element = document.getElementById(
              "action-details-container"
            );
            container_element.style.paddingBottom =
              this.createCommentHeight + 8 + "px";
          }
        }
      }
    },
    removeSearch() {
      var elem = this.$refs["inputField-" + this.actionId];
      var newInput = elem.value;

      this.caretIndex = elem.selectionEnd;
      var lastChar = this.oldInput.slice(this.caretIndex, this.caretIndex + 1);

      let lastWord = null;
      let highlight = Object.keys(this.highlightWords);
      const getLastWord = (words) => {
        let n = words.split(" ");
        let end = n[n.length - 1];
        for (let i = 0; i <= highlight.length; i++) {
          if (end.includes("@")) {
            end = "@" + end.split("@").pop();
            if (end + lastChar === "@" + highlight[i]) {
              return end;
            }
          }
        }
        return;
      };
      let contentSlice = this.content.slice(0, this.caretIndex);
      lastWord = getLastWord(contentSlice);

      var removedTag = null;
      if (lastWord) {
        if ((this.content.match(new RegExp(lastWord, "g")) || []).length == 1) {
          removedTag = this.highlightWords[lastWord.slice(1) + lastChar];
          delete this.highlightWords[lastWord.slice(1) + lastChar];
        }

        contentSlice = contentSlice.replace(new RegExp(lastWord + "$"), "");
        this.content = contentSlice + this.content.slice(this.caretIndex);

        var self = this;
        setTimeout(function () {
          elem.selectionStart = contentSlice.length;
          elem.selectionEnd = contentSlice.length;
          self.oldInput = elem.value;

          if (
            self.parent == "post" &&
            removedTag &&
            removedTag.subject_type == "content" &&
            removedTag.subject_id !=
              (self.store.create.content
                ? self.store.create.content.subject_id
                : null)
          ) {
            self.store.create.ids = self.store.create.ids.filter(
              (id) => id != removedTag.subject_id
            );
          }
        }, 0);
      } else {
        this.oldInput = elem.value;
      }
    },
    emojiUnicode(emoji) {
      var comp = null;
      if (emoji.length === 1) {
        comp = emoji.charCodeAt(0);
      }
      if (!comp) {
        comp =
          (emoji.charCodeAt(0) - 0xd800) * 0x400 +
          (emoji.charCodeAt(1) - 0xdc00) +
          0x10000;
      }
      if (comp < 0) {
        comp = emoji.charCodeAt(0);
      }
      return comp.toString("16");
    },
    addEmoji(val) {
      for (let i = 0; i < Emoji.emoji.length; i++) {
        let currentKeyName = Emoji.emoji[i].key;
        let currentKeyNameTrim = currentKeyName.replace("\\", "");
        if (val.match(currentKeyName) != null) {
          this.content = val.replace(currentKeyNameTrim, Emoji.emoji[i].value);
        }
      }
    },
    addHighlight(item) {
      let processedWord = item.subject
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase();
      this.highlightWords[processedWord] = item;

      let contentSlice = this.content.slice(0, this.caretIndex);
      let searchWord = contentSlice.substring(
        contentSlice.lastIndexOf("@") + 1,
        contentSlice.length
      );
      contentSlice = contentSlice.replace(
        new RegExp(searchWord + "$"),
        processedWord + " "
      );

      this.textboxLimit = null;
      this.content = contentSlice + this.content.slice(this.caretIndex);

      this.letUnfocus = false;

      var elem = this.$refs["inputField-" + this.actionId];
      elem.focus();
      setTimeout(() => {
        elem.selectionStart = contentSlice.length;
        elem.selectionEnd = contentSlice.length;
        this.autoGrow(this.$refs["inputField-" + this.actionId]);
      }, 0);
    },
    restoreEditor(actOnNextTick = false) {
      this.preventContentWatch = true;

      if (
        this.$store.state.feed[this.grandParent] &&
        Object.keys(
          this.$store.state.feed[this.grandParent].element_comments
        ).includes(JSON.stringify(this.actionId))
      ) {
        var obj = this.$store.state.feed[this.grandParent].element_comments[
          this.actionId
        ];
        this.content = obj.content;
        this.highlightWords = obj.highlightWords;
      } else {
        this.content = "";
        this.highlightWords = {};
      }
      this.selectedWord = "";
      this.textboxLimit = null;
      this.showSpoilerTag = false;
      this.showCounter = false;
      this.caretLocationY = null;
      this.caretIndex = 0;
      this.oldInput = "";
      this.letUnfocus = true;
      this.createCommentHeight = 0;
      if (actOnNextTick) {
        this.$nextTick(() => {
          this.autoGrow(this.$refs["inputField-" + this.actionId], false);
          this.$refs["inputField-" + this.actionId].blur();
          this.preventContentWatch = false;
        });
      } else {
        setTimeout(() => {
          this.preventContentWatch = false;
        }, 0);
      }
    },
    postComment() {
      if (this.content) {
        const spoiler = this.store.create.spoiler;
        const processedContent = this.processedContent;
        axios
          .post(this.$store.state.api_host + "comment", {
            session_id: this.$store.state.session_id,
            action_id: this.actionId,
            parent_reaction_id: this.replyInfo
              ? this.replyInfo.reaction_id
              : null,
            comment: this.processedContent,
            spoiler: this.store.create.spoiler,
          })
          .then((response) => {
            if (response.status == 200) {
              const newComment = {
                action_id: this.actionId,
                comment: processedContent,
                comments: [],
                created_at: Date.now() / 1000,
                creator_id: this.store.user.id,
                creator_name: this.store.user.name,
                creator_picture: this.store.user.picture,
                parent_reaction_id: this.replyInfo
                  ? this.replyInfo.reaction_id
                  : null,
                reaction_id: response.data.reaction_id,
                spoiler: spoiler,
                spoiler_remarks: null,
                total_comments: null,
                upvotes: null,
                user_spoiler_remark: -1,
                user_vote: 0,
              };
              this.$emit("add-new-comment", newComment);
            }
          });

        if (
          this.$store.state.feed[this.grandParent] &&
          Object.keys(
            this.$store.state.feed[this.grandParent].element_comments
          ).includes(JSON.stringify(this.actionId))
        ) {
          delete this.$store.state.feed[this.grandParent].element_comments[
            this.actionId
          ];
        }

        this.restoreEditor(true);
        this.store.create.type = null;
        this.store.create.content = null;
        this.store.create.ids = [];
        this.store.create.image = null;
        this.store.create.processedContent = "";
        this.store.create.spoiler = false;

        var elem = this.$refs["inputField-" + this.actionId];
        elem.blur();
      }
    },
  },
};
</script>

<style scoped>
* {
  color: black;
}

.textfield-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.textfield-wrapper textarea {
  /* word-break: break-all; */
  width: 100%;
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
  border: none;
  outline: none;
  resize: none;
}
.textfield-wrapper textarea::placeholder {
  color: #9b9b9b;
}

.textfield-spoiler-n-counter {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 8px;
}
.textfield-spoiler-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.textfield-spoiler {
  width: fit-content;
  font-size: 10px;
  margin-right: 8px;
  white-space: nowrap;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #545454;
  line-height: 1.6;
  background-color: #e4e4e4;
  font-family: "Roboto", sans-serif;
  padding: 4px 10px;
  text-align: center;
  border-radius: 16px;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.textfield-spoiler.active {
  color: #ffffff;
  background-color: #ff6060;
}
.textfield-spoiler-tooltip {
  margin-top: 4px;
}

.counter-animation-enter-active,
.counter-animation-leave-active {
  transition: opacity 0.2s ease-out;
}

.counter-animation-enter,
.counter-animation-leave-to {
  opacity: 0;
}
.editor-suggestion-box {
  position: fixed;
  width: calc(100vw - 48px);
  max-width: 600px;
  max-height: 400px;
  z-index: 2;
  left: 24px;
}
::-webkit-scrollbar {
  display: none;
}
</style>
