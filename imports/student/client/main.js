import './main.html';

Template.studentDashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('settings');
			self.subscribe('stExams');
		});
});

Template.studentDashboard.helpers({
	sessionInfo:function(){
		let settings = g.Settings.findOne();
		if(settings){
			return settings
		}
	},
	count:function(){
		let papers = g.Exams.find();
		if(papers){
			return papers.count();
		}
	}
});

Template.stProfile.helpers({
	user: function(){
        let currentUser = Meteor.user();
        return currentUser;
    },
});

Template.stProfileUpdate.helpers({
	profile:function(){
		let pro = Meteor.user().profile;
		if(pro){
			return pro;
		}
	},
});

Template.stExams.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExams');
			self.subscribe('stAnswers')
		});
});

Template.stExams.helpers({
	availableExams:function(){
		let papers = g.Exams.find().fetch().reverse();
		if(papers){
			let filtered = papers.filter(function(exam){
					let examResult = g.StAnswers.findOne({"examId":exam._id});
						if(!examResult){
							exam.term = termSuffix(exam.term);
							exam.count=exam.questions.length;
							return exam;
						}
						
					});
			return filtered;
		}
	},
	completedExams:function(){
		let examResult = g.StAnswers.find().fetch().reverse();
		if(examResult){
			examResult.forEach(function(exam){
				let paper = g.Exams.findOne({"_id":exam.examId});
					exam.subject=paper.subject;
					exam.session=paper.session;
					exam.term=termSuffix(paper.term);
					return exam;
				});
			return examResult;
		}
	},
});

Template.stViewExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExams');
		});
});

Template.stViewExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({"_id":id});
			paper.term = termSuffix(paper.term);
			paper.count = paper.questions.length;
		return paper;
	}
});

Template.stViewExam.events({
	'click #startExam':function(e){
		/*Meteor.call("createStAnswer",this,function(error){
			if(error){
				insertNotice(error,6000);
				FlowRouter.go("stExams");
				return;
			}
		});*/
	}
});

Template.stDoExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExams');
		});
});
Template.stDoExam.onRendered(function(){
		
});

Template.stDoExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({"_id":id});
			paper.term = termSuffix(paper.term);
			paper.questionCount = paper.questions.length;
			// Meteor.setTimeout(function(){
			// 	$("form#questionsList").submit();
			// },5000);
		
		return paper;
	},
	timeOut:function(){
		let id = FlowRouter.getParam("id");
		let minute = Number(g.Exams.findOne({"_id":id}).minute);
		let counter = new CountDown(minute);
			countBound = counter.countDownDiff.bind(counter);
			countBound();
	},
});

Template.stDoExam.events({
	'submit form#questionsList':function(e){
		e.preventDefault();
		let answers = [];
		let radio = document.querySelectorAll("input[type=radio]:checked");
		for(let i = 0; i < radio.length; i++){
			let temp = {};
				temp.id = Number(radio[i].name);
				temp.selected = radio[i].value;
			answers.push(temp);
		}
		console.log(this);
		Meteor.call("markStAnswers",answers,this,function(error){
			if(error){
				insertNotice(error,6000);
				FlowRouter.go("stExams");
				return;
			}else{
				insertNotice("Your Examination was submitted successfully. Good luck.");
				FlowRouter.go("stExams");
			}
		});
	},
	'click input[type="radio"]':function(e){
		let radio = document.querySelectorAll("input[type=radio]:checked").length;
		$(".count .checkedCount h3 span").text(radio);
		$(".count .questionLink a[href='#"+this.id+"']").css("background-color","#5cb85c");
	},
	'contextmenu #stDoExam':function(e){
		e.preventDefault();
	},
	'keydown .question':function(e){
    	let arrowKeys = [37, 38, 39, 40];
    	if(arrowKeys.indexOf(e.which) !== -1){
        	$(this).blur();
        	if(e.which == 38){
            	let y = $(window).scrollTop();
            	$(window).scrollTop(y - 10);
      		}else if(e.which == 40){
        	    let y = $(window).scrollTop();
            	$(window).scrollTop(y + 10);
        	}
        	return false;
    	}
	}

});

Template.stResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExamResult');
			self.subscribe('stAnswers');
		});
});

Template.stResult.helpers({
	result:function(){
		let id = FlowRouter.getParam('id');
		let ans = g.StAnswers.findOne({"_id":id});
		let q = g.Exams.findOne({"_id":ans.examId});
		//build questions and answers from q and ans var
		let qAns = {
					class:q.class,
					subject:q.subject,
					questionsCount:ans.questionsCount,
					answeredCount:ans.answeredCount,
					unanswered:ans.unanswered
					},
			correct=0;//correct answers
		//merge questions and answers
		for(let i = 0; i < ans.answers.length; i++){
			if(ans.answers[i].mark=="correct")correct++;//increment correct
			
			for(let j = 0; j < q.questions.length; j++){
				if(ans.answers[i].id==q.questions[j].id){
					q.questions[j].selected = ans.answers[i].selected;
					q.questions[j].mark = ans.answers[i].mark;
				}
			}
		}//end merge

		//label and marking
		for(let i = 0; i < q.questions.length; i++){
			//determine selected answer and unanswered
			if(q.questions[i].mark=="correct"){
				switch(q.questions[i].answer){
					case q.questions[i].a:
						q.questions[i].a = "<u><b>"+q.questions[i].a+"</b></u> <span class='fa fa-check text-success'></span>";
						break;
					case q.questions[i].b:
						q.questions[i].b = "<u><b>"+q.questions[i].b+"</b></u> <span class='fa fa-check text-success'></span>";
						break;
					case q.questions[i].c:
						q.questions[i].c = "<u><b>"+q.questions[i].c+"</b></u> <span class='fa fa-check text-success'></span>";
						break;
					case q.questions[i].d:
						q.questions[i].d = "<u><b>"+q.questions[i].d+"</b></u> <span class='fa fa-check text-success'></span>";
						break;
				}//end switch
			}else if(q.questions[i].mark=="wrong"){
				switch(q.questions[i].selected){
					case q.questions[i].a:
						q.questions[i].a = "<u>"+q.questions[i].a+"</u> <span class='fa fa-times text-danger'></span>";
						break;
					case q.questions[i].b:
						q.questions[i].b = "<u>"+q.questions[i].b+"</u> <span class='fa fa-times text-danger'></span>";
						break;
					case q.questions[i].c:
						q.questions[i].c = "<u>"+q.questions[i].c+"</u> <span class='fa fa-times text-danger'></span>";
						break;
					case q.questions[i].d:
						q.questions[i].d = "<u>"+q.questions[i].d+"</u> <span class='fa fa-times text-danger'></span>";
						break;
				}//end switch
			}else{
				q.questions[i].unanswered=true;
			}//end if
		}//end for-loop
			qAns.correctAnswer=correct;
			qAns.questions = q.questions;
		return qAns;
	}
});

////////////////////////autoform hooks///////////////////////////////////
AutoForm.hooks({
	stProfileUpdate:{
		onSubmit:function(doc){
			this.event.preventDefault();
			Meteor.call("profileUpdate",doc,function(error){
				if(error){
					insertNotice(error, 6000);
					return;
				}else{
					insertNotice("Profile update successful");
					FlowRouter.go("stProfile");
				}
			});
		}
	},

});

function insertNotice(text, time = 4000){
	$('.insertNotice').text(text);
	$('.insertNotice').show('slow');
	bootbox.alert(text)
	setTimeout(function(){
		$('.insertNotice').fadeOut(3000);
			}, time);
}

function termSuffix(term){
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

function counter(num){
	if(num > 0){
		num--;
		console.log(num);
	}else{
		bootbox.alert("Time end!");
		return Meteor.clearInterval()
	}
}

function CountDown(minute){
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
