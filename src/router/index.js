/* eslint-disable linebreak-style */
import Vue from "vue";
import Router from "vue-router";
import App from "@/App";
import Content from "@/components/Content.vue";
import Rate from "@/components/Rate.vue";
import Discover from "@/components/Discover.vue";
import Watchlist from "@/components/Watchlist.vue";
import Profile from "@/components/Profile.vue";
import Friends from "@/components/Friends.vue";
import AboutUs from "@/components/AboutUs.vue";
import SignUp from "@/components/SignUp.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchResults from "@/components/SearchResults.vue";
import Settings from "@/components/Settings.vue";
import SearchUsers from "@/components/SearchUsers.vue";
import PrivacyPolicy from "@/components/PrivacyPolicy.vue";
import Alert from "@/components/Alert.vue";
import Blog from "@/components/Blog.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "App",
      component: App,
    },
    {
      path: "/rate",
      name: "Rate",
      component: Rate,
    },
    {
      path: "/content/:content_id/:title",
      name: "Content",
      component: Content,
    },
    {
      path: "/discover",
      name: "Discover",
      component: Discover,
    },
    {
      path: "/watchlist",
      name: "Watchlist",
      component: Watchlist,
    },
    {
      path: "/profile/:user_id/:user_name",
      name: "Profile",
      component: Profile,
    },
    {
      path: "/connections",
      name: "Friends",
      component: Friends,
    },
    {
      path: "/about-us",
      name: "AboutUs",
      component: AboutUs,
    },
    {
      path: "/signup/:invitation",
      name: "SingUp",
      component: SignUp,
    },
    {
      path: "/search",
      name: "SearchBar",
      props: (route) => ({ search_query: route.query.search }),
      component: SearchBar,
    },
    {
      path: "/search-results",
      name: "SearchResults",
      component: SearchResults,
    },
    {
      path: "/settings",
      name: "Settings",
      component: Settings,
    },
    {
      path: "/search-users",
      name: "SearchUsers",
      component: SearchUsers,
    },
    {
      path: "/privacy-policy",
      name: "PrivacyPolicy",
      component: PrivacyPolicy,
    },
    {
      path: "/alert",
      name: "Alert",
      component: Alert,
    },
    {
      path: "/blog/:content_name_piece",
      name: "Blog",
      component: Blog,
    },
  ],
});
