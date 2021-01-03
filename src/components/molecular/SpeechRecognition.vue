<template>
  <div>
    <div class="google-microphone" @click="listen">
      <div :class="{ 'shadow listening': listening }">
        <Button
          class="mic"
          :style="{ backgroundColor: listening ? '#fff' : 'transparent' }"
          buttonType="iconOnly"
          icon="mic"
          :size="28"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Button from "./../atomic/Button";

export default {
  name: "SpeechRecognition",
  components: {
    Button,
  },
  data() {
    return {
      store: this.$store.state,
      listening: false,
    };
  },
  computed: {
    startListening() {
      return this.store.listen;
    },
  },
  watch: {
    startListening: {
      handler: function (check) {
        if (check) {
          this.listen();
        }
      },
    },
  },
  methods: {
    listen() {
      this.store.listen = false;

      if (
        (this.store.is_webview && (this.store.releaseNo || 0) < 4) ||
        this.store.never_tapped_mic
      ) {
        this.store.showSpeechInfo = true;
      } else if (!this.listening) {
        this.listening = true;
        if (this.store.is_webview) {
          Android.requestMicrophone();
        }

        var recognition = new window.webkitSpeechRecognition();

        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 5;
        recognition.start();

        setTimeout(() => {
          if (this.listening) {
            recognition.stop();
          }
        }, 10000);

        recognition.onresult = (event) => {
          this.listening = false;
          const query = event.results[0][0].transcript;
          this.$router.push("/search?search=" + encodeURIComponent(query));
          return;
        };

        recognition.onend = (event) => {
          if (this.listening) {
            this.listening = false;
            return;
          }
        };
      }
    },
  },
};
</script>

<style scoped>
.google-microphone {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.shadow {
  position: absolute;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  background: #405dedb9;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes move_eye {
  from {
    width: 4em;
    height: 4em;
  }
  to {
    width: 16em;
    height: 16em;
  }
}

.listening {
  animation: move_eye 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0s infinite
    alternate;
}

.mic {
  position: relative;
  border-radius: 50%;
  padding: 6px;
}
</style>