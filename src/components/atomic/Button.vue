<template>
  <button
    :class="[checkType(buttonType), checkIcon(icon)]"
    @click="$emit('clicked')"
  >
    <p v-if="!icon && buttonType != 'iconOnly'">{{ buttonText }}</p>
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    buttonType: {
      type: String,
      required: true,
      default: "primary"
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      buttonText: ""
    };
  },

  methods: {
    checkType(buttonType) {
      this.buttonText = this.text;
      let buttonClass = "";
      if (buttonType === "primary") {
        buttonClass = "primary";
        this.buttonText = this.text.toUpperCase();
      } else if (buttonType === "textOnly") {
        buttonClass = "textOnly";
      } else if (buttonType === "iconOnly") {
        buttonClass = "iconOnly";
      }
      return buttonClass;
    },
    checkIcon(icon) {
      let iconClass = "";
      switch (icon) {
        case "back":
          iconClass = "back";
          return iconClass;
        default:
          iconClass = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$border-radius: 5px;
$primary-color: #7352ff;
$textOnly-color: #adadad;

button {
  font-family: "Roboto", sans-serif;
  font-weight: medium;
}
.primary {
  border: none;
  border-radius: $border-radius;
  width: 100%;
  height: 48px;
  color: white;
  font-size: 14px;
  min-width: 100px;
  background-color: $primary-color;
  cursor: pointer;
  transition-property: background-color;
  transition-timing-function: ease-out;
  transition-duration: 0.5s;
}
.primary:active {
  background-color: #3c20b8;
}

.textOnly {
  border: none;
  background-color: Transparent;
  font-size: 13px;
  color: $textOnly-color;
  cursor: pointer;
  transition-property: color;
  transition-timing-function: ease-out;
  transition-duration: 0.5s;
}
.textOnly:active {
  color: white;
}

.iconOnly {
  border: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.back {
  background-position: center;
  background-size: 16px;
  background-repeat: no-repeat;
  background-color: transparent;
  background-image: url("../../assets/icons/back.svg");
}

button:focus {
  outline: none;
}
</style>