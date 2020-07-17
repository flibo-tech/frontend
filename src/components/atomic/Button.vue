<template>
  <button
    :class="[checkType, checkIcon]"
    :disabled="disabled"
    @click="
      $emit('clicked');
      buttonClicked();
    "
  >
    <p v-if="!icon && buttonType != 'iconOnly' && !buttonClickedBool">
      {{ buttonText }}
    </p>
    <div v-if="buttonClickedBool && loading" class="loader"></div>
  </button>
</template>

<script>
export default {
  name: "Button",
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
      buttonClickedBool: false,
      buttonText: ""
    };
  },

  methods: {
    buttonClicked() {
      if (this.loading) {
        this.buttonClickedBool = true;
      }
    }
  },

  computed: {
    checkType() {
      this.buttonText = this.text;
      let buttonClass = "";
      if (this.buttonType === "primary") {
        buttonClass = "primary";
        this.buttonText = this.text.toUpperCase();
      } else if (this.buttonType === "secondary") {
        buttonClass = "secondary";
      } else if (this.buttonType === "textOnly") {
        buttonClass = "textOnly";
      } else if (this.buttonType === "iconOnly") {
        buttonClass = "iconOnly";
      }
      return buttonClass;
    },

    checkIcon() {
      let iconClass = "";
      switch (this.icon) {
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
$secondary-color: #212121;
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
  transition-duration: 0.12s;
}
.primary:active {
  background-color: #3c20b8;
}
.primary:disabled {
  cursor: auto;
  background-color: grey;
}

.secondary {
  font-family: "Roboto", sans-serif;
  font-weight: medium;
  border: 2px solid $secondary-color;
  border-radius: $border-radius;
  font-size: 14px;
  min-width: 100px;
  width: 100%;
  height: 48px;
  background-color: #fff;
  color: $secondary-color;
  cursor: pointer;
}
.secondary:disabled {
  cursor: auto;
  color: white;
  border-color: rgb(36, 36, 36);
  background-color: grey;
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
.textOnly:disabled {
  cursor: auto;
  color: grey;
}

.iconOnly {
  border: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.iconOnly:disabled {
  cursor: auto;
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

.loader {
  margin: auto;
  border: 2px solid #ffffff;
  border-top: 2px solid #000000;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>