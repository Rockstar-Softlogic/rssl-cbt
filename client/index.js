import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';
import '../imports/auth.js'; //Authenticated users client code

//Template global helpers
Template.registerHelper("g.Schemas", g.Schemas);
Template.registerHelper("termSuffix",function(term){
    switch(term){
        case 1:
            term="1st";
            break;
        case 2:
            term="2nd";
            break;
        case 3:
            term="3rd";
    }
    return term;
});
Template.registerHelper("classes",function(){
    return g.classArray;
});
Template.registerHelper("subjects",function(){
    return g.subjectArray;
});

Template.registerHelper("setting",function(){
    let set = g.Settings.findOne({"_id":"default"});
    if(set){
        return set;
    }else{
        return {session:"Session not set",term:"Term not set"};
    }
});
//end global template helpers

Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        $("#btn-login").text("Please wait...");
        var user = event.target.username.value;
        var password = event.target.password.value;
        Meteor.loginWithPassword(user,password,function(err, res){
            if(err){
               err.error == 403?$("#login-error").text("Invalid email/username or password"):$("#login-error").text("Login failed! Empty value.");
           		$("#login-error").slideDown("slow");
           		$("#btn-login").text("Login");
           		return false;
            }
        });
    },
    'click #logout': function(e){
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