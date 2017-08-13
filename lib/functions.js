//global functions and variables
g.subjectArray = ["English", "Mathematics", "Physics", "Chemistry", 'Biology', 'Geography', 'Economics','Computer', 'Agric', 'Civic', 'Commerce', 'Accounting', 'Government'];
g.classArray = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
g.monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
g.termArray = [1, 2, 3];
g.stateArray = ["Abia","Adamawa","Akwa-Ibom","Anambra","Bauchi"];
//Session Array
g.sessionArray = function(){
	let start = Number(2017),
		now = new Date().getFullYear(),
		list = [];
	for(start; start <= now; start++){
		list.push(start + "/"+(start+1));	
	}
	return list.reverse();
}
//Meteor.call wrapper doc="",submitBtnId,successMsg,redirect
g.meteorCall = function(method,options){
	options = options || {};
	let doc = options.doc,
		submitBtnId = options.submitBtnId,
		successMsg = options.successMsg,
		redirect = options.redirect;

	$("div.processRequest").show("fast");
	Meteor.call(method,doc,function(error,result){
		if(error){
			$("div.processRequest").hide("fast");
			g.notice(error,8000);
			if(submitBtnId)g.enableBtn(submitBtnId);
			return;
		}else{
			$("div.processRequest").hide("fast");
			g.notice(successMsg,4000);
			if(redirect)FlowRouter.go(redirect);
		}
	});
}
//exam result calculator
g.countCorrectAnswer = function(answers){
	var correct = wrong = 0;
		for(var i = 0; i < answers.length; i++){
			if(answers[i].mark=="correct")correct++;
			else wrong++;
		}
	return correct;
}


//Sentence case
g.sentenceCase = function(name){
	if(typeof(name) === "string"){
		var cased = [];
		name.split(" ").forEach(function(n){
			cased.push(n[0].toUpperCase() + n.substring(1).toLowerCase()); 
		});
		return cased.join(" ");
	}
	return name;
}
//check empty object
g.isEmptyObject = function(obj){
	for(var key in obj){
		if(Object.prototype.hasOwnProperty.call(obj, key)){
			return false;
		}
	}
	return true;
}
//re enable submit button on error
g.enableBtn = function(id){
	return $(id+" button[type='submit']").attr("disabled",false);
}
//bottom right corner notice
g.notice = function(text, time = 4000){
	$('.insertNotice').text(text);
	$('.insertNotice').show('slow');
	bootbox.alert({title:"<h4>Notification</h4>",message:text});
	setTimeout(function(){
		$('.insertNotice').fadeOut(3000);
			}, time);
}

//countdown timer
g.CountDown = function(minute){
	this.now = new Date(),
	this.totalMin = this.now.getMinutes()+minute,
	this.seconds = this.now.getSeconds(),
	this.endHours = Math.floor(this.totalMin/60),
	this.endMinutes = this.totalMin - (this.endHours*60),
	this.endTime = this.now.getHours()+this.endHours+":"+this.endMinutes,
	this.hoursDiff = Math.floor(minute/60),
	this.minutesDiff = minute - (this.hoursDiff*60),
	this.timeDiff = this.hoursDiff+":"+this.minutesDiff,
	this.countDownDiff = function(){
			var sec = 0//this.seconds,
				min = this.minutesDiff,
				hr = this.hoursDiff,
				trackSec = 0,
				trackMin = 0,
				trackHr = 0;
		Meteor.setTimeout(function count(){
			var loc = window.location.pathname.split("#")[0].split("/");
			if(loc[loc.length-1].length==17&&loc[loc.length-2]=="do"){
				if(sec < 0){
					sec = 59;//reset seconds to 59
					min--;
				}
				if(min < 0){
					min = 59;//reset minutes to 59
					hr--;
				}
				if(hr < 0){
					hr = 23;//reset hour to 23
				}
				if(sec<10)sec="0"+sec; //a digit to 2 digits;
				if(min<10)min="0"+Math.abs(min);
				if(hr<10)hr="0"+Math.abs(hr);
				$(".count .timeCount h3").text(hr+":"+min+":"+sec);
				sec--;
				if(sec==trackSec&&min==trackMin&&hr==trackHr){
					new Audio(window.location.origin+"/times_up.mp3").play();
					$("form#questionsList").submit();
					$(".count .timeCount span").html("<b>Time's up!</b>");
					Meteor.clearTimeout(count);
					return;
				}
				if(min%5==0 && sec==00){
					new Audio(window.location.origin+"/times_up.mp3").play();
				}
				Meteor.setTimeout(count,1000);
			}else{
					Meteor.clearTimeout(count);
			}
		}, 1000);
	}
}

//logout function
g.logout = function(){
 	let confirmLogout = bootbox.confirm("You are about to logout, continue?", function(result){
            if(result){
                Meteor.logout(function(error){
                    if(error){
                        bootbox.alert(error);   
                    }else{
                        Object.keys(Session.keys).forEach(function(key){
                            Session.set(key, undefined);
                        });
                        Session.keys = {};
                        return;
                    }
                });
            }
        });
}
