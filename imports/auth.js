
import "./auth.html";
import "./student/client/main.js";
import "./admin/client/main.js";

Template.header.helpers({
    user: function(){
        var currentUser = Meteor.user();
        return currentUser;
    },
});

Template.header.events({
    'click #header-logout': function(e){
        e.preventDefault();
        var confirmLogout = bootbox.confirm("You are about to logout, continue?", function(result){
            if(result){
                Meteor.logout(function(error){
                    if(error){
                        bootbox.alert(error);   
                    }
                });
            }
        });
    }
});

Template.stHeader.helpers({
    user: function(){
        var currentUser = Meteor.user();
        return currentUser;
    },
});

Template.stHeader.events({
    'click #header-logout': function(e){
        e.preventDefault();
        var confirmLogout = bootbox.confirm("You are about to logout, continue?", function(result){
            if(result){
                Meteor.logout(function(error){
                    if(error){
                        bootbox.alert(error);   
                    }else{
                        bootbox.alert("You're logged out. Thanks"); 
                    }
                });
            }
        });
    }
});