<template>
  <div>
    <div
      class="textfield-wrapper"
      :style="
        parent === 'post' ? 'flex-direction: column;' : 'flex-direction: row;'
      "
    >
      <textarea
        @paste.prevent
        @focus="showCounter = true"
        @blur="showCounter = false"
        @keyup="removeSearch"
        :style="parent === 'post' ? {} : { 'margin-right': '8px' }"
        :maxlength="textboxLimit"
        :rows="parent === 'post' ? 5 : 1"
        v-model="content"
        ref="inputField"
        id="inputField"
        :placeholder="
          parent === 'post' ? 'Express yourself...' : 'Add a comment...'
        "
      ></textarea>

      <div class="textfield-counter">
        <transition name="counter-animation">
          <CharacterCounter
            v-if="showCounter"
            :limit="characterLimit"
            :count="length"
            :radius="10"
            :width="3"
          />
        </transition>
      </div>
    </div>

    <TagSuggestions
      ref="editorSuggestionBox"
      class="editor-suggestion-box"
      :style="
        is_mobile
          ? 'top: 0; height: calc(' + caretLocationY + 'px - 18px);'
          : 'width: 65vw;max-height: 350px;'
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
import TagSuggestions from "./TagSuggestions";

export default {
  name: "TextEditor",
  components: { CharacterCounter, TagSuggestions },
  props: {
    parent: {
      type: String,
      required: true,
    },
    isSubmitClicked: {
      type: Boolean,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      content: "",
      selectedWord: "",
      textboxLimit: null,
      showCounter: false,
      highlightWords: {},
      caretLocationY: null,
      caretIndex: 0,
      oldInput: "",
    };
  },
  computed: {
    characterLimit() {
      return parent === "post" ? 500 : 500;
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
            `[${this.highlightWords[key].subject}](${this.highlightWords[key].subject_type},${this.highlightWords[key].subject_id})`
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
      return plainText.length;
    },
  },
  watch: {
    isSubmitClicked: function () {
      if (this.isSubmitClicked) {
        console.log(this.processedContent);
      }
    },
    content: function (val) {
      this.getCaretIndex();
      if (this.content) {
        this.addEmoji(val);
      }
      this.autoGrow(this.$refs.inputField);
      if (this.length >= this.characterLimit) {
        this.textboxLimit = this.content.length;
      }
      for (let content in this.highlightWords) {
        this.store.create.ids.forEach((varId) => {
          if (varId != this.highlightWords[content].subject_id) {
            this.store.create.ids.push(this.highlightWords[content].subject_id);
          }
        });
      }
    },
  },
  methods: {
    getCaretIndex() {
      setTimeout(() => {
        var elem = this.$refs.inputField;
        this.caretIndex = elem ? elem.selectionEnd : 0;
      }, 0);
    },
    caretLocation() {
      let input = this.$refs.inputField;
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
    autoGrow(element) {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";
    },
    removeSearch() {
      var elem = this.$refs.inputField;
      var newInput = elem.value;
      if (newInput.length < this.oldInput.length) {
        this.caretIndex = elem.selectionEnd;
        var lastChar = this.oldInput.slice(
          this.caretIndex,
          this.caretIndex + 1
        );

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

        if (lastWord) {
          if (
            (this.content.match(new RegExp(lastWord, "g")) || []).length == 1
          ) {
            delete this.highlightWords[lastWord.slice(1) + lastChar];
          }

          contentSlice = contentSlice.replace(new RegExp(lastWord + "$"), "");
          this.content = contentSlice + this.content.slice(this.caretIndex);

          var self = this;
          setTimeout(function () {
            elem.selectionStart = contentSlice.length;
            elem.selectionEnd = contentSlice.length;
            self.oldInput = elem.value;
          }, 0);
        } else {
          this.oldInput = elem.value;
        }
      } else {
        this.oldInput = elem.value;
      }
    },
    emojiUnicode(emoji) {
      var comp;
      if (emoji.length === 1) {
        comp = emoji.charCodeAt(0);
      }
      comp =
        (emoji.charCodeAt(0) - 0xd800) * 0x400 +
        (emoji.charCodeAt(1) - 0xdc00) +
        0x10000;
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

      this.content = contentSlice + this.content.slice(this.caretIndex);

      var elem = this.$refs.inputField;
      elem.focus();
      setTimeout(function () {
        elem.selectionStart = contentSlice.length;
        elem.selectionEnd = contentSlice.length;
      }, 0);
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
  width: 100%;
}

.textfield-wrapper textarea {
  width: 100%;
  font-size: 16px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
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

.textfield-counter {
  display: flex;
  justify-content: flex-end;
  position: relative;
  height: 26px;
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
  max-height: 450px;
  z-index: 2;
  left: 24px;
}
::-webkit-scrollbar {
  display: none;
}
</style>