<template>
  <div class="tag-suggestions">
    <div
      v-for="(item, index) in searchData"
      v-bind:key="index"
      class="tag-suggestion"
    >
      <ImageCard
        style="justify-content: flex-start; min-width: 100%"
        :name="item.subject"
        :subText="
          ['content', undefined].includes(item.subject_type)
            ? RegExp(/^1{1}.*$/).test(item.subject_id)
              ? 'movie'
              : 'show'
            : item.subject_type
        "
        :image="item.image.replace('/w500/', '/w45/')"
        :width="40"
        :height="50"
        position="right"
        :fontSize="15"
        fontWeight="normal"
        :scale="item.subject_type == 'friend' ? true : false"
        @clicked="$emit('clicked', item)"
      />
    </div>

    <div
      class="see-more-contents-box"
      v-if="contentSearchIds.length"
      @click="fetchMoreContent"
    >
      <div class="see-more-contents" v-if="!fetchingIncremental">See More</div>
      <div v-else class="loader"></div>
    </div>

    <div class="fetching" v-if="fetching">
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
    </div>

    <div v-if="!fetching && showNoResultMessage" class="no-tag-result">
      {{
        searchType == "all"
          ? "No result found!"
          : "No such movie or show found!"
      }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ImageCard from "./../atomic/ImageCard";

export default {
  name: "TagSuggestions",
  components: {
    ImageCard,
  },
  props: {
    searchString: {
      type: String,
      required: true,
    },
    searchType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      searchData: [],
      contentSearchIds: [],
      fetching: false,
      fetchingIncremental: false,
      showNoResultMessage: false,
    };
  },
  created() {
    this.fetchTagSuggestions();
  },
  watch: {
    searchString() {
      this.fetchTagSuggestions();
    },
  },
  methods: {
    fetchTagSuggestions() {
      var self = this;
      self.showNoResultMessage = false;
      clearTimeout(self.timeout);
      self.timeout = setTimeout(function () {
        self.searchData = [];
        self.contentSearchIds = [];
        self.fetching = true;
        axios
          .post(self.$store.state.api_host + "live_search", {
            session_id: self.$store.state.session_id,
            string: self.searchString,
            search_type: self.searchType,
          })
          .then(function (response) {
            if (response.status == 200) {
              if (self.searchType == "all") {
                self.searchData = response.data.result;
              } else if (self.searchType == "content") {
                self.searchData = response.data.result.contents;
                self.contentSearchIds = response.data.result.content_search_ids;
              }
            } else if (response.status == 204) {
              self.showNoResultMessage = true;
            }
            self.fetching = false;
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          });
      }, 350);
    },
    fetchMoreContent() {
      var self = this;
      self.fetchingIncremental = true;
      axios
        .post(self.$store.state.api_host + "get_searched_contents", {
          session_id: self.$store.state.session_id,
          content_search_ids: self.contentSearchIds.slice(0, 10),
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.searchData.push(...response.data.contents);
            self.contentSearchIds.splice(0, 10);
          }
          self.fetchingIncremental = false;
        })
        .catch(function (error) {
          console.log(error);
          self.fetchingIncremental = false;
        });
    },
  },
};
</script>

<style scoped>
.tag-suggestions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #ffffff;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 8px;
  border: 1px solid rgba(155, 155, 155, 0.25);
  cursor: pointer;
}
.tag-suggestion {
  margin-bottom: 8px;
  width: 100%;
  overflow: auto;
  min-height: 50px;
}
.see-more-contents-box {
  text-align: center;
  font-size: 12px;
  width: 40%;
  margin-left: 30%;
  height: 30px;
  color: #f3eded;
  background-color: #3366bb;
  margin-bottom: 1%;
  border-radius: 5px;
  margin-top: 1%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.see-more-contents {
  position: relative;
  padding: 6px;
  top: 50%;
  transform: translateY(-50%);
}
.fetching {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
  z-index: 1001;
}
.sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}
.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
  -ms-transform: scale(1.1);
  transform: scale(1.1);
}
.sk-folding-cube .sk-cube:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 225, 225, 0.75);
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
  animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
  -ms-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
  transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
  transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
  transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}
@keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}
.loader {
  margin: auto;
  border: 2px solid #ffffff;
  border-top: 2px solid #000000;
  border-radius: 50%;
  width: 22px;
  height: 22px;
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
.no-tag-result {
  width: 90%;
  margin-left: 50%;
  transform: translateX(-50%);
  margin-top: 25%;
}
::-webkit-scrollbar {
  display: none;
}
</style>