<template>
  <button
    :class="checkType"
    @click="
      $emit('clicked');
      buttonClicked();
    "
    :disabled="disabled"
    :style="
      iconCircle
        ? {
            'background-color': disabled ? '#E4E4E4' : '#7352ff',
            width: size * 2 + 'px',
            height: size * 2 + 'px',
            'border-radius': '50%',
          }
        : {}
    "
  >
    <p v-if="buttonType != 'iconOnly' && !buttonClickedBool">{{ text }}</p>
    <img
      v-if="buttonType === 'iconOnly' && !buttonClickedBool"
      :src="imageURL"
      :style="
        iconCircle
          ? { width: size + 'px', display: 'initial', margin: margin }
          : { width: size + 'px' }
      "
    />
    <div
      v-if="buttonClickedBool && loading"
      class="loader"
      :style="iconCircle ? { width: '30px', height: '30px' } : {}"
    ></div>
  </button>
</template>

<script>
export default {
  name: "Button",
  props: {
    text: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    buttonType: {
      type: String,
      required: true,
      default: "primary",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    state: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      required: false,
      default: 18,
    },
    iconCircle: {
      type: Boolean,
      required: false,
      default: false,
    },
    margin: {
      type: String,
      required: false,
      default: "0",
    },
  },
  data() {
    return {
      buttonClickedBool: false,
    };
  },
  computed: {
    checkType() {
      let buttonClass = "";
      if (this.buttonType === "primary") {
        buttonClass = "primary";
      } else if (this.buttonType === "secondary") {
        buttonClass = "secondary";
      } else if (this.buttonType === "textOnly") {
        buttonClass = "textOnly";
      } else if (this.buttonType === "iconOnly") {
        buttonClass = "iconOnly";
      }
      return buttonClass;
    },
    imageURL() {
      if (this.state) {
        return require("./../../assets/icons/" + this.icon + "_true" + ".svg");
      }
      return require("./../../assets/icons/" + this.icon + ".svg");
    },
  },
  methods: {
    buttonClicked() {
      if (this.loading) {
        this.buttonClickedBool = true;
      }
    },
  },
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
  transition-property: background-color;
  transition-timing-function: ease-out;
  transition-duration: 0.12s;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.primary:active {
  background-color: #3c20b8;
}
.primary:disabled {
  cursor: inherit;
  background-color: rgb(220, 220, 220);
  color: rgb(178, 178, 178);
}
.primary p {
  text-transform: uppercase;
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.secondary:disabled {
  cursor: auto;
  color: white;
  border-color: rgb(36, 36, 36);
  background-color: grey;
}
.textOnly {
  border: none;
  border-radius: $border-radius;
  background-color: Transparent;
  font-size: 13px;
  color: $textOnly-color;
  cursor: pointer;
  transition-property: color;
  transition-timing-function: ease-out;
  transition-duration: 0.5s;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.textOnly:disabled {
  cursor: inherit;
  color: rgb(54, 54, 54);
}
.iconOnly {
  background-color: transparent;
  border: none;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.iconOnly:disabled {
  cursor: auto;
}
.iconOnly img {
  display: block;
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