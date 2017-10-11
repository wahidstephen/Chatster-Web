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
    controller: 'AuthCtrl as authCtrl',
    templateUrl: 'auth/login.html',
    resolve: {
      requireNoAuth: function($state, Auth){
        return Auth.$requireSignIn().then(function(auth){
          $state.go('home');
        }, function(error){
          return;
        });
      }
    }
  })
  .state('register', {
    url: '/register',
    controller: 'AuthCtrl as authCtrl',
    templateUrl: 'auth/register.html',
    resolve: {
      requireNoAuth: function($state, Auth){
        return Auth.$requireSignIn().then(function(auth){
          $state.go('home');
        }, function(error){
          return;
        });
      }
    }
  })
  .state('profile', {
  url: '/profile',
  controller: 'ProfileCtrl as profileCtrl',
  templateUrl: 'users/profile.html',
  resolve: {
    auth: function($state, Users, Auth){
      return Auth.$requireSignIn().catch(function(){
        $state.go('home');
      });
    },
    profile: function(Users, Auth){
      return Auth.$requireSignIn().then(function(auth){
        return Users.getProfile(auth.uid).$loaded();
      });
    }
  }
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
