<template>
  <div
    class="action-options-container"
    :style="is_mobile ? '' : 'width: 900px;'"
  >
    <div class="action-options-header">
      <h1>What do you want to do?</h1>
      <div class="btn-close-circle">
        <Button
          icon="cross"
          buttonType="iconOnly"
          :size="30"
          v-on:clicked="$emit('close')"
        />
      </div>
    </div>
    <div class="card-container">
      <ActionTypeCard
        type="request"
        text="Movies that make you fall in love with a city?"
        v-on:clicked="changeState"
        :active="selectedType === 'request'"
      />
      <ActionTypeCard
        type="suggest"
        text="Spirited Away, best movie experience of my life"
        v-on:clicked="changeState"
        :active="selectedType === 'suggest'"
      />
      <ActionTypeCard
        type="review"
        text="Once Upon A Time In Hollywood...not my cup of tea!"
        v-on:clicked="changeState"
        :active="selectedType === 'review'"
      />
    </div>
    <transition name="input">
      <div v-if="selectedType === 'review' || selectedType === 'suggest'">
        <input
          class="create-prompt-input"
          ref="searchContent"
          placeholder="Search a movie / show"
          @keyup="setSearchString"
        />
        <TagSuggestions
          class="tag-suggestion-box"
          :style="is_mobile ? '' : 'width: 65vw;max-height: 350px;'"
          v-if="searchString && !selectedContent"
          :searchString="searchString"
          searchType="content"
          v-on:clicked="submit"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import ActionTypeCard from "../atomic/ActionTypeCard";
import TagSuggestions from "./TagSuggestions";
import Button from "../atomic/Button";
export default {
  name: "CreatePostPrompt",
  components: {
    ActionTypeCard,
    TagSuggestions,
    Button,
  },
  data() {
    return {
      store: this.$store.state,
      is_mobile: window.screen.height > window.screen.width,
      searchString: "",
      selectedType: "",
      selectedContent: null,
    };
  },
  methods: {
    changeState(type) {
      this.selectedType = type;
      this.selectedContent = null;
      this.searchString = "";

      if (this.selectedType === "request") {
        this.store.create.type = this.selectedType;
        this.store.create.content = null;
        this.$emit("close");
        this.$router.push("/create");
      } else {
        this.$nextTick(function () {
          this.$refs.searchContent.value = "";
          this.$refs.searchContent.focus();
        });
      }
    },
    submit(item) {
      this.$refs.searchContent.value = item.subject;
      this.selectedContent = item;
      this.store.create.content = item;
      this.store.create.type = this.selectedType;
      this.$emit("close");
      this.$router.push("/create");
    },
    setSearchString() {
      this.searchString = this.$refs.searchContent.value;
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: "Roboto";
}
.action-options-container {
  position: fixed;
  left: 50vw;
  top: 50vh;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  border-radius: 16px;
  height: auto;
  width: 90vw;
  padding: 2em;
  max-height: 90vh;
  overflow: scroll;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  animation: 0.2s ease-out 0s 1 load;
  z-index: 1000001;
}
@keyframes load {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.action-options-header {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 16px;
  align-items: center;
}
.card-container {
  display: grid;
  margin-top: 20px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1em;
}

.action-options-header h1 {
  grid-column: 1;
  font-size: 20px;
  margin: 0;
}

.btn-close-circle {
  grid-column: 2;
  top: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.create-prompt-input {
  font-size: 1.5em;
  width: 90%;
  margin: 1em 1em 0em 0em;
  height: 50px;
  border: none;
  border-bottom: 1px solid #9b9b9b8f;
}

.create-prompt-input::placeholder {
  color: #9b9b9b;
}

.create-prompt-input:focus {
  outline: none;
}

.input-enter-active,
.input-leave-active {
  transition: opacity 0.2s;
}
.input-enter,
.input-leave-to {
  opacity: 0;
}
.tag-suggestion-box {
  position: absolute;
  transform: translateY(calc(-100% - 50px));
  width: 75vw;
  height: 60vh;
  max-height: 450px;
  z-index: 2;
}
::-webkit-scrollbar {
  display: none;
}
</style>