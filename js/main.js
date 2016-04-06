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
  vm.loading = true;

  FeedService.parseFeed('http://news.ycombinator.com/rss').then(function (res) {
    vm.loading = false;

    console.log(res);

    var responseStatus = res.data.responseStatus;
    var f = res.data.responseData.feed;

    vm.feed = {
      title: f.title,
      link: f.link,
      description: f.description,
      type: f.type,
      posts: f.entries
    };

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


  setLastVisited();
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
