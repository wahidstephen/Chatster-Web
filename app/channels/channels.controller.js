angular.module('chatsterApp')
.controller('ChannelsCtrl', function($state, Auth, Users, profile, channels){
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
});
