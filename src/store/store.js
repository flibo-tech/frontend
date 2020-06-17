/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
/* eslint-disable import/prefer-default-export */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

var my_store = JSON.parse(localStorage.getItem("my_store"));

if (my_store) {
  try {
    if (typeof my_store.unused_key_m == "undefined") {
      var temp_session_id = my_store.session_id;
      var temp_is_webview = my_store.is_webview;
      localStorage.clear();
      if (temp_is_webview == "true") {
        window.location =
          "https://flibo.ai/?id=" + temp_session_id + "&webview=true";
      } else {
        window.location = "https://flibo.ai/?id=" + temp_session_id;
      }
      my_store = JSON.parse(localStorage.getItem("my_store"));
    }
  } catch (err) {
    var temp_session_id = my_store.session_id;
    var temp_is_webview = my_store.is_webview;
    localStorage.clear();
    if (temp_is_webview == "true") {
      window.location =
        "https://flibo.ai/?id=" + temp_session_id + "&webview=true";
    } else {
      window.location = "https://flibo.ai/?id=" + temp_session_id;
    }
    my_store = JSON.parse(localStorage.getItem("my_store"));
  }
}

export const store = new Vuex.Store({
  state: {
    server_down: false,
    unused_key_m: my_store ? my_store.unused_key_m : true,
    updated_at: my_store ? my_store.updated_at : Date.now(),
    user: {
      id: my_store ? my_store.user.id : null,
      name: my_store ? my_store.user.name : null,
      picture: my_store ? my_store.user.picture : null,
      authorized: my_store ? my_store.user.authorized : false,
      profile: {
        posters: my_store ? my_store.user.profile.posters : [],
        covers: my_store ? my_store.user.profile.covers : [],
        total_watched: my_store
          ? my_store.user.profile.total_watched
          : {
              movie: {
                total: "some great",
                time: "some good time :)"
              },
              tv: {
                total: "some great",
                time: "some good time :)"
              }
            },
        contents_rated: my_store ? my_store.user.profile.contents_rated : [],
        genres: my_store
          ? my_store.user.profile.genres
          : {
              movie: {
                genre: [],
                contribution: []
              },
              tv: {
                genre: [],
                contribution: []
              }
            },
        watched_timeline: my_store
          ? my_store.user.profile.watched_timeline
          : {
              movie: {
                years: [],
                liked: [],
                disliked: [],
                loved: [],
                total: []
              },
              tv: {
                years: [],
                liked: [],
                disliked: [],
                loved: [],
                total: []
              }
            },
        profile_status: my_store
          ? my_store.user.profile.profile_status
          : "friends",
        profile_views: my_store ? my_store.user.profile.profile_views : 0,
        country: my_store ? my_store.user.profile.country : null,
        platforms: my_store ? my_store.user.profile.platforms : []
      }
    },
    guest_id: my_store ? my_store.guest_id : null,
    guest_country: my_store ? my_store.guest_country : null,
    prompt_signup: false,
    instructions_seen: true,
    session_id: my_store ? my_store.session_id : null,
    is_webview: my_store ? my_store.is_webview : false,
    login_host: "https://signin.flibo.ai/",
    api_host: "https://app.flibo.ai/",
    ai_host: "https://ai.flibo.ai/",
    content_type: my_store ? my_store.content_type : "movie",
    last_card: my_store ? my_store.last_card : null,
    current_path: my_store ? my_store.current_path : "/rate",
    content_page: {
      content_id: my_store ? my_store.content_page.content_id : null,
      data: null,
      crew: null,
      artist: null,
      more_by_artist: [],
      similar_content: null,
      watchlist_message_check: false,
      watchlist_added_message: "Added to watchlist",
      watchlist_removed_message: "Removed from watchlist",
      origin: my_store ? my_store.content_page.origin : null,
      never_tapped_any_artist: my_store
        ? my_store.content_page.never_tapped_any_artist
        : true,
      rerender: my_store ? my_store.content_page.rerender : false
    },
    click_coordinate_x: null,
    click_coordinate_y: null,
    side_bar: false,
    rate: {
      visible_cards: my_store ? my_store.rate.visible_cards : [],
      content_ids: my_store ? my_store.rate.content_ids : [],
      content_type_tab: my_store
        ? my_store.rate.content_type_tab
        : ["movie", "tv"],
      fetching_cards: false
    },
    rate_filters: {
      filters_meta: {
        genres: my_store ? my_store.rate_filters.filters_meta.genres : [],
        artists: my_store ? my_store.rate_filters.filters_meta.artists : [],
        decades: my_store ? my_store.rate_filters.filters_meta.decades : [],
        awards: my_store ? my_store.rate_filters.filters_meta.awards : [],
        platforms: my_store ? my_store.rate_filters.filters_meta.platforms : [],
        ratings: ["All", "9+", "8+", "7+", "6+", "<6"],
        industries: my_store
          ? my_store.rate_filters.filters_meta.industries
          : [],
        tabs: ["All", "Movies", "TV Series"]
      },
      filters_temp: {
        artists: my_store
          ? my_store.rate_filters.filters_applied.artists.slice()
          : [],
        genres: my_store
          ? my_store.rate_filters.filters_applied.genres.slice()
          : [],
        years: my_store
          ? my_store.rate_filters.filters_applied.years.slice()
          : [],
        platforms: my_store
          ? my_store.rate_filters.filters_applied.platforms.slice()
          : [],
        awards: my_store
          ? my_store.rate_filters.filters_applied.awards.slice()
          : [],
        tags: my_store
          ? my_store.rate_filters.filters_applied.tags.slice()
          : [],
        nominations: my_store
          ? my_store.rate_filters.filters_applied.nominations
          : false,
        rating: my_store ? my_store.rate_filters.filters_applied.rating : "70",
        industry: my_store
          ? my_store.rate_filters.filters_applied.industry
          : {},
        tab: my_store ? my_store.rate_filters.filters_applied.tab : "All"
      },
      filters_applied: {
        artists: my_store ? my_store.rate_filters.filters_applied.artists : [],
        genres: my_store ? my_store.rate_filters.filters_applied.genres : [],
        years: my_store ? my_store.rate_filters.filters_applied.years : [],
        platforms: my_store
          ? my_store.rate_filters.filters_applied.platforms
          : [],
        awards: my_store ? my_store.rate_filters.filters_applied.awards : [],
        tags: my_store ? my_store.rate_filters.filters_applied.tags : [],
        nominations: my_store
          ? my_store.rate_filters.filters_applied.nominations
          : false,
        rating: my_store ? my_store.rate_filters.filters_applied.rating : "10",
        industry: my_store
          ? my_store.rate_filters.filters_applied.industry
          : {},
        tab: my_store ? my_store.rate_filters.filters_applied.tab : "All"
      },
      visible_cards: my_store ? my_store.rate_filters.visible_cards : [],
      content_ids: my_store ? my_store.rate_filters.content_ids : [],
      fetching_cards: false
    },
    suggestions: {
      calc_after: 5,
      rate_counter: my_store ? my_store.suggestions.rate_counter : [],
      rate_counter_all: my_store ? my_store.suggestions.rate_counter_all : 0,
      suggestions_ready_message_seen: true,
      contents: my_store ? my_store.suggestions.contents : [],
      more_contents: my_store ? my_store.suggestions.more_contents : [],
      discover_type_tab: my_store
        ? my_store.suggestions.discover_type_tab
        : ["community", "friends", "flibo"],
      content_type_tab: my_store
        ? my_store.suggestions.content_type_tab
        : ["movie", "tv"],
      last_fetch_time: my_store
        ? my_store.suggestions.last_fetch_time
        : 1000000000000,
      fetching_suggestions: false,
      fetching_feed_incremental: false,
      refresh_recommendation: my_store
        ? my_store.suggestions.refresh_recommendation
        : false,
      ready_to_refresh_recommendation: my_store
        ? my_store.suggestions.ready_to_refresh_recommendation
        : false,
      users_suggestions: my_store ? my_store.suggestions.users_suggestions : [],
      notify: false
    },
    feed_filters: {
      filters_meta: {
        platforms: my_store ? my_store.feed_filters.filters_meta.platforms : []
      },
      filters_temp: {
        platforms: my_store
          ? my_store.feed_filters.filters_applied.platforms.slice()
          : []
      },
      filters_applied: {
        platforms: my_store
          ? my_store.feed_filters.filters_applied.platforms
          : []
      }
    },
    discover_filters: {
      filters_meta: {
        genres: my_store ? my_store.discover_filters.filters_meta.genres : [],
        decades: my_store ? my_store.discover_filters.filters_meta.decades : [],
        artists: my_store ? my_store.discover_filters.filters_meta.artists : [],
        awards: my_store ? my_store.discover_filters.filters_meta.awards : [],
        platforms: my_store
          ? my_store.discover_filters.filters_meta.platforms
          : [],
        ratings: ["All", "9+", "8+", "7+", "6+", "<6"],
        industries: my_store
          ? my_store.discover_filters.filters_meta.industries
          : [],
        tabs: ["All", "Connections", "Suggestions"]
      },
      filters_temp: {
        artists: my_store
          ? my_store.discover_filters.filters_applied.artists.slice()
          : [],
        genres: my_store
          ? my_store.discover_filters.filters_applied.genres.slice()
          : [],
        years: my_store
          ? my_store.discover_filters.filters_applied.years.slice()
          : [],
        platforms: my_store
          ? my_store.discover_filters.filters_applied.platforms.slice()
          : [],
        awards: my_store
          ? my_store.discover_filters.filters_applied.awards.slice()
          : [],
        tags: my_store
          ? my_store.discover_filters.filters_applied.tags.slice()
          : [],
        nominations: my_store
          ? my_store.discover_filters.filters_applied.nominations
          : false,
        rating: my_store
          ? my_store.discover_filters.filters_applied.rating
          : "10",
        industry: my_store
          ? my_store.discover_filters.filters_applied.industry
          : {},
        tab: my_store ? my_store.discover_filters.filters_applied.tab : "All"
      },
      filters_applied: {
        artists: my_store
          ? my_store.discover_filters.filters_applied.artists
          : [],
        genres: my_store
          ? my_store.discover_filters.filters_applied.genres
          : [],
        years: my_store ? my_store.discover_filters.filters_applied.years : [],
        platforms: my_store
          ? my_store.discover_filters.filters_applied.platforms
          : [],
        awards: my_store
          ? my_store.discover_filters.filters_applied.awards
          : [],
        tags: my_store ? my_store.discover_filters.filters_applied.tags : [],
        nominations: my_store
          ? my_store.discover_filters.filters_applied.nominations
          : false,
        rating: my_store
          ? my_store.discover_filters.filters_applied.rating
          : "10",
        industry: my_store
          ? my_store.discover_filters.filters_applied.industry
          : {},
        tab: my_store ? my_store.discover_filters.filters_applied.tab : "All"
      },
      fetching_filtered: false,
      fetching_filter_incremental: false,
      is_string_query: false,
      filtered_content: my_store
        ? my_store.discover_filters.filtered_content
        : [],
      more_filtered_content: my_store
        ? my_store.discover_filters.more_filtered_content
        : [],
      never_seen_filters: my_store
        ? my_store.discover_filters.never_seen_filters
        : true,
      content_type_tab: my_store
        ? my_store.discover_filters.content_type_tab
        : ["movie", "tv"],
      last_fetch_time: my_store
        ? my_store.discover_filters.last_fetch_time
        : 1000000000000
    },
    watchlist: my_store ? my_store.watchlist : [],
    watchlist_filters: {
      filters_meta: {
        genres: my_store ? my_store.watchlist_filters.filters_meta.genres : [],
        platforms: my_store
          ? my_store.watchlist_filters.filters_meta.platforms
          : [],
        tabs: ["All", "Movies", "TV Series"]
      },
      filters_temp: {
        genres: my_store
          ? my_store.watchlist_filters.filters_applied.genres.slice()
          : [],
        platforms: my_store
          ? my_store.watchlist_filters.filters_applied.platforms.slice()
          : [],
        tab: my_store ? my_store.watchlist_filters.filters_applied.tab : "All"
      },
      filters_applied: {
        genres: my_store
          ? my_store.watchlist_filters.filters_applied.genres
          : [],
        platforms: my_store
          ? my_store.watchlist_filters.filters_applied.platforms
          : [],
        tab: my_store ? my_store.watchlist_filters.filters_applied.tab : "All"
      }
    },
    notifications: {
      suggestions: my_store ? my_store.notifications.suggestions : false,
      friends: my_store ? my_store.notifications.friends : false,
      requests: my_store ? my_store.notifications.requests : false,
      never_seen_profile_switch: my_store
        ? my_store.notifications.never_seen_profile_switch
        : true
    },
    friends_page: {
      friends: my_store ? my_store.friends_page.friends : []
    },
    scroll_positions: {
      discover: {
        all: my_store ? my_store.scroll_positions.discover.all : 0,
        friends: my_store ? my_store.scroll_positions.discover.friends : 0,
        flibo: my_store ? my_store.scroll_positions.discover.flibo : 0,
        filter: my_store ? my_store.scroll_positions.discover.filter : 0
      }
    },
    countries: my_store ? my_store.countries : [],
    quotes: [
      "Wash your hands regularly.",
      "Don't touch your face.",
      "Don't wear a mask unless you’re sick.",
      "Wear a mask if you're sick.",
      "Don't travel if you have a fever.",
      "Practice social distancing.",
      "Do not propagate hostility against Asians.",
      "Do seek help early if you have a fever.",
      "Cough into the crook of your elbow.",
      "Stay home. Save lives.",
      "Don't believe everything on the internet.",
      "Be at an arm's length from a sick person.",
      "Avoid international travel.",
      "Avoid handshakes & hugs.",
      "Avoid self medication such as antibiotics.",
      "Drink warm liquids.",
      "Work from home if possible.",
      "Do not stockpile on masks.",
      "Don't spread rumours or panic.",
      "This too shall pass.",
      "Don't worry, be happy.",
      "Everything's gonna be alright."
    ],
    country_mappings: {
      AU: "Australia",
      BR: "Brazil",
      CA: "Canada",
      FR: "France",
      DE: "Germany",
      IN: "India",
      ID: "Indonesia",
      IT: "Italy",
      JP: "Japan",
      MX: "Mexico",
      PH: "Philippines",
      RU: "Russia",
      ES: "Spain",
      GB: "United Kingdom",
      US: "United States"
    }
  }
});
