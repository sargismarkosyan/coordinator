'use strict';

angular
  .module('coordinatorApp', [
    'ui.router',
    'ui.bootstrap',
    'coordinatorApp.settings',
    'coordinatorApp.constants',
    'coordinatorApp.helpers',
    'coordinatorApp.home'
  ])
  .config(['$urlRouterProvider', function ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }]);
