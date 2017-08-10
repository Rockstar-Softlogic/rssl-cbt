//global functions and variables
g.subjectArray = ["English", "Mathematics", "Physics", "Chemistry", 'Biology', 'Geography', 'Economics','Computer', 'Agric', 'Civic', 'Commerce', 'Accounting', 'Government'];
g.classArray = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
g.monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
g.termArray = [1, 2, 3];
g.stateArray = ["Abia","Adamawa","Akwa-Ibom","Anambra","Bauchi"];

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