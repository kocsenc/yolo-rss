'use strict';

/**
 * @ngdoc function
 * @name hayboys.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hayboys app
 */
var app = angular.module('yolorss', ['ngResource', 'ngAnimate', 'ngCookies']);


angular
  .module('yolorss')
  .controller('main', ['$resource', '$cookies', MainCtrl]);

function MainCtrl($resource, $cookies) {
  var vm = this;

  setLastVisited();

  function setLastVisited() {
    var key = 'lastVisit';
    if (!$cookies.get(key)) {
      console.log('Saving Cookie: ', new Date());
      $cookies.put(key, new Date().toString());
    }
    vm.lastVisit = $cookies.get(key);

    alert($cookies.get(key));
  }

  vm.potato = 'YOLO';

}
