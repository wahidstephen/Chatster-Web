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
.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'home/home.html',
    resolve: {
      requireNoAuth: ["$state", "Auth", function($state, Auth){
        return Auth.$requireSignIn().then(function(auth){
          $state.go('channels');
        }, function(error){
          return;
        });
      }]
    }
  })
  .state('login', {
    url: '/login',
    controller: 'AuthCtrl as authCtrl',
    templateUrl: 'auth/login.html',
    resolve: {
      requireNoAuth: ["$state", "Auth", function($state, Auth){
        return Auth.$requireSignIn().then(function(auth){
          $state.go('home');
        }, function(error){
          return;
        });
      }]
    }
  })
  .state('register', {
    url: '/register',
    controller: 'AuthCtrl as authCtrl',
    templateUrl: 'auth/register.html',
    resolve: {
      requireNoAuth: ["$state", "Auth", function($state, Auth){
        return Auth.$requireSignIn().then(function(auth){
          $state.go('home');
        }, function(error){
          return;
        });
      }]
    }
  })
  .state('profile', {
    url: '/profile',
    controller: 'ProfileCtrl as profileCtrl',
    templateUrl: 'users/profile.html',
    resolve: {
      auth: ["$state", "Users", "Auth", function($state, Users, Auth){
        return Auth.$requireSignIn().catch(function(){
          $state.go('home');
        });
      }],
      profile: ["Users", "Auth", function(Users, Auth){
        return Auth.$requireSignIn().then(function(auth){
          return Users.getProfile(auth.uid).$loaded();
        });
      }]
    }
  })
  .state('channels', {
    url: '/channels',
    controller: 'ChannelsCtrl as channelsCtrl',
    templateUrl: 'channels/index.html',
    resolve: {
      channels: ["Channels", function (Channels){
        return Channels.$loaded();
      }],
      profile: ["$state", "Auth", "Users", function ($state, Auth, Users){
        return Auth.$requireSignIn().then(function(auth){
          return Users.getProfile(auth.uid).$loaded().then(function (profile){
            if(profile.displayName){
              return profile;
            } else {
              $state.go('profile');
            }
          });
        }, function(error){
          $state.go('home');
        });
      }]
    }
  })
  .state('channels.create', {
    url: '/create',
    templateUrl: 'channels/create.html',
    controller: 'ChannelsCtrl as channelsCtrl'
  })
  .state('channels.messages', {
    url: '/{channelId}/messages',
    templateUrl: 'channels/messages.html',
    controller: 'MessagesCtrl as messagesCtrl',
    resolve: {
      messages: ["$stateParams", "Messages", function($stateParams, Messages){
        return Messages.forChannel($stateParams.channelId).$loaded();
      }],
      channelName: ["$stateParams", "channels", function($stateParams, channels){
        return '#'+channels.$getRecord($stateParams.channelId).name;
      }]
    }
  })
  .state('channels.direct', {
    url: '/{uid}/messages/direct',
    templateUrl: 'channels/messages.html',
    controller: 'MessagesCtrl as messagesCtrl',
    resolve: {
      messages: ["$stateParams", "Messages", "profile", function($stateParams, Messages, profile){
        return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
      }],
      channelName: ["$stateParams", "Users", function($stateParams, Users){
        return Users.all.$loaded().then(function(){
          return '@'+Users.getDisplayName($stateParams.uid);
        });
      }]
    }
  });

  $urlRouterProvider.otherwise('/');
}])
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

angular.module('chatsterApp')
.controller('AuthCtrl', ["Auth", "$state", function(Auth, $state){
  var authCtrl = this;

  authCtrl.user = {
    email: '',
    password: ''
  };

  authCtrl.login = function (){
    Auth.$signInWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(function (auth){
      $state.go('home');
    }, function (error){
      authCtrl.error = error;
    });
  };

  authCtrl.register = function (){
    Auth.$createUserWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(function (user){
      $state.go('home');
    }, function (error){
      authCtrl.error = error;
    });
  };

}]);

angular.module('chatsterApp')
  .factory('Auth', ["$firebaseAuth", function($firebaseAuth){
    var auth = $firebaseAuth();

    return auth;
  }]);

angular.module('chatsterApp')
.factory('Users', ["$firebaseArray", "$firebaseObject", function($firebaseArray, $firebaseObject){
  var usersRef = firebase.database().ref('users');
  var connectedRef = firebase.database().ref('.info/connected');
  var users = $firebaseArray(usersRef);

  var Users = {
    getProfile: function(uid){
      return $firebaseObject(usersRef.child(uid));
    },
    getDisplayName: function(uid){
      return users.$getRecord(uid).displayName;
    },
    getGravatar: function(uid){
      return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
    },
    setOnline: function(uid){
      var connected = $firebaseObject(connectedRef);
      var online = $firebaseArray(usersRef.child(uid+'/online'));

      connected.$watch(function (){
        if(connected.$value === true){
          online.$add(true).then(function(connectedRef){
            connectedRef.onDisconnect().remove();
          });
        }
      });
    },
    all: users
  };

  return Users;
}]);

angular.module('chatsterApp')
.controller('ProfileCtrl', ["$state", "md5", "auth", "profile", function($state, md5, auth, profile){
  var profileCtrl = this;
  profileCtrl.profile = profile;

  profileCtrl.updateProfile = function(){
    profileCtrl.profile.emailHash = md5.createHash(auth.email);
    profileCtrl.profile.$save().then(function(){
      $state.go('channels');
    });
  };

}]);

angular.module('chatsterApp')
.controller('ChannelsCtrl', ["$state", "Auth", "Users", "profile", "channels", function($state, Auth, Users, profile, channels){
  var channelsCtrl = this;
  Users.setOnline(profile.$id);
  channelsCtrl.profile = profile;
  channelsCtrl.channels = channels;
  channelsCtrl.getDisplayName = Users.getDisplayName;
  channelsCtrl.getGravatar = Users.getGravatar;
  channelsCtrl.newChannel = { name: '' };
  channelsCtrl.users = Users.all;

  channelsCtrl.logout = function(){
    channelsCtrl.profile.online = null;
    channelsCtrl.profile.$save().then(function(){
      Auth.$signOut().then(function(){
        $state.go('home');
      });
    });
  }
  channelsCtrl.createChannel = function(){
    channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
      $state.go('channels.messages', {channelId: ref.key});
    });
  };
}]);

angular.module('chatsterApp')
  .factory('Channels', ["$firebaseArray", function($firebaseArray){
    var ref = firebase.database().ref('channels');
    var channels = $firebaseArray(ref);

    return channels;
  }]);

angular.module('chatsterApp')
.factory('Messages', ["$firebaseArray", function($firebaseArray){
  var channelMessagesRef = firebase.database().ref('channelMessages');
  var userMessagesRef = firebase.database().ref('userMessages');

  return {
    forChannel: function(channelId){
      return $firebaseArray(channelMessagesRef.child(channelId));
    },
    forUsers: function(uid1, uid2){
      var path = uid1 < uid2 ? uid1+'/'+uid2 : uid2+'/'+uid1;

      return $firebaseArray(userMessagesRef.child(path));
    }
  };
}]);

angular.module('chatsterApp')
.controller('MessagesCtrl', ["profile", "channelName", "messages", function(profile, channelName, messages){
  var messagesCtrl = this;

  messagesCtrl.messages = messages;
  messagesCtrl.channelName = channelName;
  messagesCtrl.message = '';

  messagesCtrl.sendMessage = function (){
    if(messagesCtrl.message.length > 0){
      messagesCtrl.messages.$add({
        uid: profile.$id,
        body: messagesCtrl.message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }).then(function (){
        messagesCtrl.message = '';
      });
    }
  };
}]);
