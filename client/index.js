import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';
import '../imports/auth.js'; //Authenticated users client code

//Template global helpers
Template.registerHelper("g.Schemas", g.Schemas);

registerGlobalHelpers({
    termSuffix:function(term){
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
    },
    classes:function(){
        return g.classArray;
    },
    subjects:function(){
        return g.subjectArray;
    },
    setting:function(){
     let set = g.Settings.findOne({"_id":"default"});
        if(set){
            return set;
        }else{
            return {session:"Session not set",term:"Term not set"};
        }
    },
})
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

//termsuffix
g.termSuffix = function(term){
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
}

function registerGlobalHelpers(helpers){
  _.chain(helpers)
   .keys()
   .each((i)=>{Template.registerHelper(i, helpers[i])})
   .value()
  }
