<template>
  <div
    @click="$emit('clicked', type)"
    :class="[active ? 'typecard-container-active' : 'typecard-container']"
  >
    <div :class="[active ? 'icon-container-active' : 'icon-container']">
      <svg
        v-if="type === 'review'"
        id="Capa_1"
        enable-background="new 0 0 512 512"
        height="512"
        viewBox="0 0 512 512"
        width="512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="m503.22 186.828-25.041-25.041c-11.697-11.698-30.729-11.696-42.427 0l-52.745 52.745v-169.532c0-24.813-20.187-45-45-45h-293c-24.813 0-45 20.187-45 45v422c0 24.813 20.187 45 45 45h293c24.813 0 45-20.187 45-45v-119.033l120.213-118.712c11.697-11.697 11.697-30.73 0-42.427zm-179.399 177.423-45.122 21.058 21.037-45.078 111.975-111.975 24.757 24.756zm29.186 102.749c0 8.271-6.729 15-15 15h-293c-8.271 0-15-6.729-15-15v-422c0-8.271 6.729-15 15-15h293c8.271 0 15 6.729 15 15v199.532c-83.179 83.179-77.747 77.203-79.34 80.616l-39.598 84.854c-2.667 5.717-1.474 12.49 2.986 16.95 4.46 4.461 11.236 5.653 16.95 2.986l84.854-39.599c3.111-1.452 3.623-2.354 14.148-12.748zm104.806-235.067-24.89-24.89 24.043-24.043 25.033 25.049z"
          />
          <path
            d="m80.007 127h224c8.284 0 15-6.716 15-15s-6.716-15-15-15h-224c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m80.007 207h176c8.284 0 15-6.716 15-15s-6.716-15-15-15h-176c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m208.007 257h-128c-8.284 0-15 6.716-15 15s6.716 15 15 15h128c8.284 0 15-6.716 15-15s-6.716-15-15-15z"
          />
        </g>
      </svg>
      <svg
        v-else-if="type === 'suggest'"
        id="Capa_1"
        enable-background="new 0 0 512 512"
        height="512"
        viewBox="0 0 512 512"
        width="512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="m503.22 186.828-25.041-25.041c-11.697-11.698-30.729-11.696-42.427 0l-52.745 52.745v-169.532c0-24.813-20.187-45-45-45h-293c-24.813 0-45 20.187-45 45v422c0 24.813 20.187 45 45 45h293c24.813 0 45-20.187 45-45v-119.033l120.213-118.712c11.697-11.697 11.697-30.73 0-42.427zm-179.399 177.423-45.122 21.058 21.037-45.078 111.975-111.975 24.757 24.756zm29.186 102.749c0 8.271-6.729 15-15 15h-293c-8.271 0-15-6.729-15-15v-422c0-8.271 6.729-15 15-15h293c8.271 0 15 6.729 15 15v199.532c-83.179 83.179-77.747 77.203-79.34 80.616l-39.598 84.854c-2.667 5.717-1.474 12.49 2.986 16.95 4.46 4.461 11.236 5.653 16.95 2.986l84.854-39.599c3.111-1.452 3.623-2.354 14.148-12.748zm104.806-235.067-24.89-24.89 24.043-24.043 25.033 25.049z"
          />
          <path
            d="m80.007 127h224c8.284 0 15-6.716 15-15s-6.716-15-15-15h-224c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m80.007 207h176c8.284 0 15-6.716 15-15s-6.716-15-15-15h-176c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m208.007 257h-128c-8.284 0-15 6.716-15 15s6.716 15 15 15h128c8.284 0 15-6.716 15-15s-6.716-15-15-15z"
          />
        </g>
      </svg>
      <svg
        v-else-if="type === 'request'"
        id="Capa_1"
        enable-background="new 0 0 512 512"
        height="512"
        viewBox="0 0 512 512"
        width="512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="m503.22 186.828-25.041-25.041c-11.697-11.698-30.729-11.696-42.427 0l-52.745 52.745v-169.532c0-24.813-20.187-45-45-45h-293c-24.813 0-45 20.187-45 45v422c0 24.813 20.187 45 45 45h293c24.813 0 45-20.187 45-45v-119.033l120.213-118.712c11.697-11.697 11.697-30.73 0-42.427zm-179.399 177.423-45.122 21.058 21.037-45.078 111.975-111.975 24.757 24.756zm29.186 102.749c0 8.271-6.729 15-15 15h-293c-8.271 0-15-6.729-15-15v-422c0-8.271 6.729-15 15-15h293c8.271 0 15 6.729 15 15v199.532c-83.179 83.179-77.747 77.203-79.34 80.616l-39.598 84.854c-2.667 5.717-1.474 12.49 2.986 16.95 4.46 4.461 11.236 5.653 16.95 2.986l84.854-39.599c3.111-1.452 3.623-2.354 14.148-12.748zm104.806-235.067-24.89-24.89 24.043-24.043 25.033 25.049z"
          />
          <path
            d="m80.007 127h224c8.284 0 15-6.716 15-15s-6.716-15-15-15h-224c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m80.007 207h176c8.284 0 15-6.716 15-15s-6.716-15-15-15h-176c-8.284 0-15 6.716-15 15s6.716 15 15 15z"
          />
          <path
            d="m208.007 257h-128c-8.284 0-15 6.716-15 15s6.716 15 15 15h128c8.284 0 15-6.716 15-15s-6.716-15-15-15z"
          />
        </g>
      </svg>
    </div>
    <strong>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</strong>
    <p :style="[active ? { color: '#d2c8ff' } : { color: '#7c7c7c' }]">
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: "TypeCard",
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
  background-color: #ffffff;
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