angular.module('chatsterApp')
  .factory('Messages', function($firebaseArray){
    var channelMessagesRef = firebase.database().ref('channelMessages');

    return {
      forChannel: function(channelId){
        return $firebaseArray(channelMessagesRef.child(channelId));
      }
    };
  });
