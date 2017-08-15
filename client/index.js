import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';
import '../imports/auth.js'; //Authenticated users client code

//Template global helpers
Template.registerHelper("g.Schemas", g.Schemas);

registerGlobalHelpers({
    loggedInUser:function(){
        let profile = Meteor.user();
        return profile;
    },
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
    termArray:function(){
        return g.termArray;
    },
    sessionArray:function(){
        let session = g.sessionArray();
        return session;
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
        $("#btn-login").attr("disabled",true);
        var user = event.target.username.value;
        var password = event.target.password.value;
        Meteor.loginWithPassword(user,password,function(err, res){
            if(err){
               err.error == 403?$("#login-error").text("Invalid email/username or password"):$("#login-error").text("Login failed! Empty value.");
           		$("#login-error").slideDown("slow");
           		$("#btn-login").text("Login");
                $("#btn-login").attr("disabled",false);
           		return false;
            }
        });
    },
    'click #logout': function(e){
    	e.preventDefault();
    	 g.logout();
    }
});

Template.feedback.events({
    'submit form':function(e){
        e.preventDefault();
        let subject = e.target.subject.value,
            message = e.target.message.value,
            email = e.target.email?e.target.email.value:Meteor.user().emails[0].address;
        
            if((subject.length < 5 || subject.length > 100) || message.length < 50 || !email){
                bootbox.alert("<h4>Error in message or subject </h4>");
                return;
            }
        let mailObject = {email:email,subject:subject,message:message};
        $("div.processRequest").show("fast");
        $.ajax({
            url:"https://formspree.io/wisdomabioye@gmail.com",
            method: "POST",
            data: mailObject,
            dataType: "json",
            success:function(data){
                if(data.success){
                    $("div.processRequest").hide("fast");
                    bootbox.alert("<h4>Message sent. Thank you!</h4>");
                    FlowRouter.go("/");
                }
            },
            error:function(data, error){
                $("div.processRequest").hide("fast");
                bootbox.alert("<h4>Error occurred! Please try again!</h4>");

            }
        });
        // Meteor.call("sendFeedback",mailObject,function(err,result){
        //     if(err){
        //         bootbox.alert(err);
        //     }else{
        //         bootbox.alert("Message was sent. Thank you!");
        //         FlowRouter.go("/");
        //     }
        // })     
    }
});
// function registerGlobalHelpers(helpers){
//   _.chain(helpers)
//    .keys()
//    .each((i)=>{Template.registerHelper(i, helpers[i])})
//    .value()
// }

function registerGlobalHelpers(helpers){
  _.each(helpers, (fn, name) => { Template.registerHelper(name, fn); });
 }
