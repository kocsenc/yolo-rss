'use strict';

/**
 * @ngdoc function
 * @name hayboys.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hayboys app
 */
var app = angular.module('yolorss', ['ngResource', 'ngAnimate', 'ngCookies', 'ngSanitize', 'infinite-scroll']);


angular
  .module('yolorss')
  .controller('main', ['$timeout', '$cookies', 'FeedService', MainCtrl]);

function MainCtrl($timeout, $cookies, FeedService) {
  var vm = this;

  /* Variables */
  vm.rssFeeds = [
    {
      title: 'USA Today',
      icon: 'newspaper',
      url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories'
    },
    {
      title: 'BBC World News',
      icon: 'world',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml'
    },
    {
      title: 'ESPN',
      icon: 'soccer',
      url: 'http://sports.espn.go.com/espn/rss/news'
    },
    {
      title: 'Weather Channel®',
      icon: 'cloud',
      url: 'http://rss.weather.com/rss/national/rss_nwf_rss.xml?cm_ven=NWF&cm_cat=rss&par=NWF_rss'
    },
    {
      title: 'TechCrunch',
      icon: 'game',
      url: 'http://feeds.feedburner.com/TechCrunch'
    }
  ];
  vm.categorySelected = 0;
  vm.loading = false;
  vm.limit = 5;
  vm.login = {
    show: false,
    buttonText: "Login",
    form: {
      username: "",
      password: ""
    },
    loggedIn: false,
    loggedInUser: ""
  };
  vm.newRSSUrl = "";

  /* Functions */
  vm.selectCategory = selectCategory;
  vm.parseFeed = parseFeed;
  vm.favorite = favorite;
  vm.onInfiniteScroll = onInfiniteScroll;
  vm.loginNow = loginNow;
  vm.toggleLogin = toggleLogin;
  vm.viewFavs = viewFavs;

  /* Init */
  selectCategory(0);
  setLastVisited();

  /**
   * Retrieves the appropriate feed and populates it.
   * @param number
   */
  function selectCategory(number) {
    vm.loading = true;
    vm.categorySelected = number;
    parseFeed(vm.rssFeeds[number].url);
  }

  function parseFeed(url) {
    if (url) {
      FeedService.parseFeed(url).then(function (res) {
        vm.loading = false;
        var responseStatus = res.data.responseStatus;
        if (responseStatus !== 200) {
          // on error
          return;
        }

        var f = res.data.responseData.feed;
        vm.feed = {
          title: f.title,
          link: f.link,
          description: f.description,
          type: f.type,
          posts: f.entries
        };
        populateFavorites(vm.feed.posts);
        vm.limit = 5;

        /**
         * Posts have:
         * - title
         * - link
         * - author
         * - publishedDate
         * - content (html)
         */
      });
      vm.newRSSUrl = "";
    }
  }


  function onInfiniteScroll() {
    if (vm.limit <= 15 || vm.feed.link !== "/") {
      vm.loading = true;
      $timeout(function () {
        vm.limit += 2;
        vm.loading = false;
      }, 650, true);
    }
  }

  function populateFavorites(posts) {
    angular.forEach(posts, function (post) {
      var cookieExists = !!$cookies.getObject(post.link);
      if (cookieExists) {
        post.favorited = true;
      }
    });
  }

  /**
   * Toggles favorite of a post.
   * @param post
   */
  function favorite(post) {
    var cookieExists = !!$cookies.getObject(post.link);
    if (cookieExists) {
      $cookies.remove(post.link);
    } else {
      var rawPost = angular.toJson(post);
      if (rawPost.length > 3000) {
        rawPost = angular.toJson({
          title: post.title,
          link: post.link,
          author: post.author,
          publishedDate: post.publishedDate,
          content: "Content too large to favorite. Click on title to view."
        })
      }
      $cookies.put(post.link, rawPost);
    }
    post.favorited = !post.favorited;
  }

  function viewFavs() {
    vm.feed = {
      title: "My Favorites",
      link: "/",
      description: "",
      posts: []
    };
    populateFavorites(vm.feed.posts);

    angular.forEach($cookies.getAll(), function (rawPost, key) {
      if (key.indexOf("http") >= 0) {
        var post = angular.fromJson(rawPost);
        post.favorited = true;
        vm.feed.posts.push(post);
      }
    });
  }

  function setLastVisited() {
    var key = 'lastVisit';
    if (!$cookies.get(key)) {
      $cookies.put(key, new Date().toString());
    }
    vm.lastVisit = $cookies.get(key);
  }

  function loginNow() {
    if (!vm.login.loggedIn) {
      vm.login.loggedIn = true;
      vm.login.loggedInUser = vm.login.form.username;
      vm.login.buttonText = "Logout";
      vm.login.form = {
        username: "",
        password: ""
      }
    }

    vm.login.show = false;
  }

  function toggleLogin() {
    if (vm.login.loggedIn) {
      logout();
    } else {
      vm.login.show = !vm.login.show;
      if (vm.login.show) {
        vm.login.buttonText = "Hide"
      } else {
        vm.login.buttonText = "Login"
      }
    }
  }

  function logout() {
    vm.login.loggedIn = false;
    vm.login.loggedInUser = null;
    vm.login.buttonText = "Login";
  }
}

app.factory('FeedService', ['$http', function ($http) {
  return {
    parseFeed: function (url) {
      return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
    }
  }
}]);
