/* eslint-disable linebreak-style */
import Vue from "vue";
import Router from "vue-router";
import App from "@/App";
import Content from "@/views/Content.vue";
import Rate from "@/components/Rate.vue";
import Profile from "@/components/Profile.vue";
import Friends from "@/components/Friends.vue";
import AboutUs from "@/components/AboutUs.vue";
import SignUp from "@/components/SignUp.vue";
import SearchBar from "@/components/SearchBar.vue";
import Settings from "@/components/Settings.vue";
import SearchUsers from "@/components/SearchUsers.vue";
import PrivacyPolicy from "@/components/PrivacyPolicy.vue";
import Alert from "@/components/Alert.vue";
import Onboarding from "@/views/Onboarding.vue";
import Home from "@/views/Home.vue";
import SearchResults from "@/views/SearchResults.vue";
import Watchlist from "@/views/Watchlist.vue";
import Create from "@/views/Create.vue";
import ActionDetails from "@/views/ActionDetails.vue";
import Ratings from "@/views/Ratings.vue";
import Posts from "@/views/Posts.vue";
import Notifications from "@/views/Notifications.vue";
import Suggestions from "@/views/Suggestions.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "App",
      component: App
    },
    {
      path: "/rate",
      name: "Rate",
      component: Rate
    },
    {
      path: "/content/:content_id/:title",
      name: "Content",
      component: Content
    },
    {
      path: "/discover",
      name: "Discover",
      component: Home
    },
    {
      path: "/watchlist/:user_id/:user_name",
      name: "Watchlist",
      component: Watchlist
    },
    {
      path: "/profile/:user_id/:user_name",
      name: "Profile",
      component: Profile
    },
    {
      path: "/connections",
      name: "Friends",
      component: Friends
    },
    {
      path: "/about-us",
      name: "AboutUs",
      component: AboutUs
    },
    {
      path: "/signup/:invitation",
      name: "SingUp",
      component: SignUp
    },
    {
      path: "/search",
      name: "SearchBar",
      props: route => ({ search_query: route.query.search }),
      component: SearchBar
    },
    {
      path: "/search-results",
      name: "SearchResults",
      component: SearchResults
    },
    {
      path: "/settings",
      name: "Settings",
      component: Settings
    },
    {
      path: "/search-users",
      name: "SearchUsers",
      component: SearchUsers
    },
    {
      path: "/privacy-policy",
      name: "PrivacyPolicy",
      component: PrivacyPolicy
    },
    {
      path: "/alert",
      name: "Alert",
      component: Alert
    },
    {
      path: "/onboarding",
      name: "Onboarding",
      component: Onboarding
    },
    {
      path: "/create",
      name: "Create",
      component: Create
    },
    {
      path:
        "/:actionType(review|request|suggest|activity|list)/:actionId(\\d+)/:urlText([a-z0-9\\-]+)(/comment/)?:reactionId(\\d+)?",
      name: "ActionDetails",
      component: ActionDetails
    },
    {
      path: "/ratings/:user_id/:user_name",
      name: "Ratings",
      component: Ratings
    },
    {
      path: "/posts/:type/:id/:name",
      name: "Posts",
      component: Posts
    },
    {
      path: "/notifications",
      name: "Notifications",
      component: Notifications
    },
    {
      path: "/suggestions",
      name: "Suggestions",
      component: Suggestions
    }
  ]
});
