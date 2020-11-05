<template>
  <div
    @click="$emit('clicked', type)"
    :class="[active ? 'typecard-container-active' : 'typecard-container']"
  >
    <div :class="[active ? 'icon-container-active' : 'icon-container']">
      <Button
        :icon="
          type === 'request' ? 'idea' : type === 'suggest' ? 'heart' : 'say'
        "
        buttonType="iconOnly"
        :size="type === 'request' ? 32 : type === 'suggest' ? 29 : 29"
      />
    </div>
    <strong>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</strong>
    <p :style="[active ? { color: '#d2c8ff' } : { color: '#7c7c7c' }]">
      {{ text }}
    </p>
  </div>
</template>

<script>
import Button from "./Button";

export default {
  name: "TypeCard",
  components: { Button },
  props: {
    type: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {},
};
</script>

<style scoped>
.typecard-container {
  padding-top: 1em;
  border-radius: 16px;
  background-color: #eeeeee;
  display: flex;
  align-items: center;
  flex-flow: column nowrap;
  font-family: "Roboto";
  fill: white;
  color: #7c7c7c;
  cursor: pointer;
}

.typecard-container-active {
  padding-top: 1em;
  border-radius: 16px;
  background-color: #7352ff;
  display: flex;
  align-items: center;
  flex-flow: column nowrap;
  fill: #7352ff;
  font-family: "Roboto";
  color: #ffffff;
  transition: 0.2s all ease-in-out;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #b4b4b4;
  width: 50px;
  height: 50px;
}

.icon-container-active {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #b4b4b4;
  width: 50px;
  height: 50px;
}

strong {
  font-size: 1em;
  margin: 0.5em 0em 0em 0em;
}

svg {
  width: 50%;
  height: 100%;
}

p {
  text-align: center;
  margin: 1em;
  font-size: 0.8em;
}
</style>