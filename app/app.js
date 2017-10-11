'use strict';

/**
 * @ngdoc overview
 * @name chatsterApp
 * @description
 * # chatsterApp
 *
 * Main module of the application.
 */
angular
  .module('chatsterApp', [
    'firebase',
    'angular-md5',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'auth/login.html'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'auth/register.html'
      });

    $urlRouterProvider.otherwise('/');
  })
  .config(function() {
    var config = {
    apiKey: "AIzaSyB_Yu3oAZ7MYNy9sox4mP-99tFcWxYXVxs",
    authDomain: "chatster-31375.firebaseapp.com",
    databaseURL: "https://chatster-31375.firebaseio.com",
    projectId: "chatster-31375",
    storageBucket: "",
    messagingSenderId: "175751888370"
  };
  firebase.initializeApp(config);
  });
