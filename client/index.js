import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';
import '../imports/auth.js'; //Authenticated users client code

Template.registerHelper("g.Schemas", g.Schemas);

Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        $("#btn-login").text("Please wait...");
        var user = event.target.email.value;
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