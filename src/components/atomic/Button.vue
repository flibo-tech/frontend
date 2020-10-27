<template>
  <div
    :class="customClass"
    ref="buttonContainer"
    @click="
      $emit('clicked');
      buttonClicked();
    "
    :style="
      iconCircle
        ? {
            'background-color': disabled ? '#E4E4E4' : '#7352ff',
            width: size * 2 + 'px',
            height: size * 2 + 'px',
            'border-radius': '50%',
          }
        : buttonType == 'primary' && big
        ? 'padding: 16px 32px;'
        : {}
    "
  >
    <p
      v-if="buttonType != 'iconOnly' && !buttonClickedBool"
      :style="textCustomStyle"
    >
      {{ text }}
    </p>
    <img
      v-if="buttonType === 'iconOnly' && !buttonClickedBool"
      :src="imageURL"
      :style="
        iconCircle
          ? {
              width: size + 'px',
              height: size + 'px',
              display: 'initial',
              margin: margin,
            }
          : { width: size + 'px', height: size + 'px' }
      "
    />
    <div
      v-if="buttonClickedBool && loading"
      class="loader"
      :style="iconCircle ? { width: '30px', height: '30px' } : {}"
    ></div>
  </div>
</template>

<script>
export default {
  name: "Button",
  props: {
    text: {
      type: String,
      required: false,
      default: null,
    },
    icon: {
      type: String,
      required: false,
      default: null,
    },
    buttonType: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    state: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      // applicable when iconCircle is true OR iconOnly
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
    capitalize: {
      // applicable when buttonType is primary
      type: Boolean,
      required: false,
      default: true,
    },
    big: {
      // applicable when buttonType is primary
      type: Boolean,
      required: false,
      default: false,
    },
    fontSize: {
      type: Number,
      required: false,
      default: null,
    },
    fontColor: {
      type: String,
      required: false,
      default: null,
    },
    padding: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      buttonClickedBool: false,
    };
  },
  mounted() {
    if (
      this.loading &&
      ["primary", "secondary", "textOnly"].includes(this.buttonType)
    ) {
      var elem = this.$refs.buttonContainer.getBoundingClientRect();
      this.$refs.buttonContainer.style.width = elem.width + "px";
      this.$refs.buttonContainer.style.height = elem.height + "px";
    }
  },
  computed: {
    customClass() {
      let buttonClass = "";
      if (this.buttonType === "primary") {
        buttonClass = this.disabled ? "primary disabled" : "primary";
      } else if (this.buttonType === "secondary") {
        buttonClass = this.disabled ? "secondary disabled" : "secondary";
      } else if (this.buttonType === "textOnly") {
        buttonClass = this.disabled ? "textOnly disabled" : "textOnly";
      } else if (this.buttonType === "iconOnly") {
        buttonClass = this.disabled ? "iconOnly disabled" : "iconOnly";
      }
      return buttonClass;
    },
    textCustomStyle() {
      return {
        textTransform:
          this.buttonType == "primary" && this.capitalize
            ? "uppercase"
            : "inherit",
        fontSize: this.fontSize ? this.fontSize + "px" : "inherit",
        color: this.fontColor ? this.fontColor : "inherit",
        padding: this.padding ? this.padding : "initial",
      };
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
.primary {
  font-family: "Roboto", sans-serif;
  font-weight: normal;
  border: none;
  border-radius: $border-radius;
  color: white;
  display: flex;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px 8px;
  width: fit-content;
  height: fit-content;
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
.secondary {
  font-family: "Roboto", sans-serif;
  font-weight: normal;
  border: 1px solid #777777;
  border-radius: $border-radius;
  font-size: 14px;
  display: flex;
  line-height: 1.5;
  white-space: nowrap;
  width: fit-content;
  height: fit-content;
  padding: 4px 8px;
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
.disabled {
  cursor: auto;
  border-color: transparent;
  background-color: rgb(220, 220, 220);
  color: rgb(170, 170, 170);
}
.textOnly {
  font-family: "Roboto", sans-serif;
  font-weight: normal;
  border: none;
  border-radius: $border-radius;
  display: flex;
  background-color: Transparent;
  font-size: 13px;
  align-self: center;
  white-space: nowrap;
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
  cursor: auto;
  color: rgb(54, 54, 54);
}
.iconOnly {
  display: flex;
  justify-content: center;
  align-items: center;
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