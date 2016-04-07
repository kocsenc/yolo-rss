'use strict';

/**
 * @ngdoc function
 * @name hayboys.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hayboys app
 */
var app = angular.module('yolorss', ['ngResource', 'ngAnimate', 'ngCookies', 'ngSanitize']);


angular
  .module('yolorss')
  .controller('main', ['$resource', '$cookies', 'FeedService', MainCtrl]);

function MainCtrl($resource, $cookies, FeedService) {
  var vm = this;

  /* Variables */
  var rssFeeds = [
    {
      title: 'USA Today',
      url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories'
    },
    {
      title: 'BBC World News',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml'
    },
    {
      title: 'ESPN Headlines',
      url: ' http://sports.espn.go.com/espn/rss/news'
    },
    {
      title: 'The Weather Channel®',
      url: 'http://rss.weather.com/rss/national/rss_nwf_rss.xml?cm_ven=NWF&cm_cat=rss&par=NWF_rss'
    },
    {
      title: 'TechCrunch',
      url: 'http://feeds.feedburner.com/TechCrunch'
    }
  ];

  vm.categorySelected = 0;

  /* Functions */
  vm.selectCategory = selectCategory;
  vm.favorite = favorite;

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

    FeedService.parseFeed(rssFeeds[number].url).then(function (res) {
      vm.loading = false;
      var responseStatus = res.data.responseStatus;
      var f = res.data.responseData.feed;
      vm.feed = {
        title: f.title,
        link: f.link,
        description: f.description,
        type: f.type,
        posts: f.entries
      };
      populateFavorites(vm.feed.posts);

      /**
       * Posts have:
       * - title
       * - link
       * - author
       * - publishedDate
       * - content (html)
       * -
       */
    });
  }

  function populateFavorites(posts) {
    angular.forEach(posts, function (post) {
      var postCookie = $cookies.getObject(post.link);
      if (postCookie) {
        post.favorited = postCookie;
      }
    });
  }

  /**
   * Toggles favorite of a post.
   * @param post
   */
  function favorite(post) {
    post.favorited = !post.favorited;
    $cookies.put(post.link, post.favorited);
  }

  function setLastVisited() {
    var key = 'lastVisit';
    if (!$cookies.get(key)) {
      $cookies.put(key, new Date().toString());
    }
    vm.lastVisit = $cookies.get(key);
  }
}

app.factory('FeedService', ['$http', function ($http) {
  return {
    parseFeed: function (url) {
      return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
    }
  }
}]);
