import './main.html';

Template.studentDashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('settings');
			self.subscribe('stExams');
		});
});

Template.studentDashboard.helpers({
	count:function(){
		let setting = g.Settings.findOne({"_id":"default"});
		let papers = g.Exams.find({"session":setting.session,"term":setting.term});
		if(papers){
			return papers.count();
		}
	}
});


Template.stExams.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExams');
			self.subscribe('stAnswers');
			self.subscribe('settings');
		});
});

Template.stExams.helpers({
	availableExams:function(){
		let setting = g.Settings.findOne({"_id":"default"});
		let papers = g.Exams.find({"session":setting.session,"term":setting.term}).fetch().reverse();
		if(papers){
			let filtered = papers.filter(function(exam){
					let examResult = g.StAnswers.findOne({"examId":exam._id,"session":setting.session,"term":setting.term});
						if(!examResult){
							exam.count=exam.questions.length;
							return true;
						}
						
					});
			return filtered;
		}
	},
	completedExams:function(){
		let setting = g.Settings.findOne({"_id":"default"});
		let examResult = g.StAnswers.find({"session":setting.session,"term":setting.term}).fetch().reverse();
		if(examResult){
			return examResult;
		}
	},
});

Template.stViewExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stExams');
			self.subscribe('stAnswers');
		});
});

Template.stViewExam.onRendered(function(){
	let id = FlowRouter.getParam("id");
		Meteor.call("checkAnswer",id,function(error,result){
			if(error){
				FlowRouter.go("stExams");
				return;
			}else{
				Session.set("examId",id);
			}
		});
});

Template.stViewExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({"_id":id});
		if(paper){
			paper.count = paper.questions.length;
			return paper;				
		}
	}
});

Template.stViewExam.events({
	'click #startExam':function(e){
		/*Meteor.call("createStAnswer",this,function(error){
			if(error){
				g.notice(error,6000);
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
		let id = FlowRouter.getParam("id");
		let examId = Session.get("examId");
		if(!examId || examId!==id){
			FlowRouter.go("stExams");
		}else{
			Meteor.call("initAnswer",id,function(error){
				if(error){
					FlowRouter.go("stExams");
				}
			});
		}
});

Template.stDoExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({"_id":id});
		if(paper){
			paper.questionsCount = paper.questions.length;
			return paper;			
		}
			// Meteor.setTimeout(function(){
			// 	$("form#questionsList").submit();
			// },5000);
	},
	timeOut:function(){
		let id = FlowRouter.getParam("id");
		let minute = Number(g.Exams.findOne({"_id":id}).minute);
		let counter = new g.CountDown(minute);
			countBound = counter.countDownDiff.bind(counter);
			countBound();
	},
});

Template.stDoExam.onDestroyed(function(){
	Session.set("examId", undefined);
	delete Session.keys.examId;
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
		Meteor.call("markStAnswers",answers,this,function(error){
			if(error){
				g.notice(error,6000);
				FlowRouter.go("stExams");
				return;
			}else{
				g.notice("Your Examination was submitted successfully. Good luck.");
				FlowRouter.go("stExams");
			}
		});
	},
	'click button#examSubmit':function(e){
		e.preventDefault();
		bootbox.confirm("<h4><b>Are you sure to submit this exam?</b></h4>",function(result){
			if(result){
				$("form#questionsList").submit();
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
					answeredCount:ans.answeredCount || 0,
					unanswered:ans.unanswered || 0,
					correctAnswer: 0
					},
			correct=0;//correct answers
		//merge questions and answers
		if(!ans.answers){return qAns;}
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

Template.stSingleResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('stAnswers');
			self.subscribe('settings');
		});
});

Template.stSingleResult.helpers({
	result:function(){
		let currentClass = Meteor.user().profile.currentClass,
			setting = g.Settings.findOne({"_id":"default"});
		let session = setting.session,
			term = setting.term;
		let exams = g.StAnswers.find({"session":session,"term":term}).fetch();
		if(exams){
			exams.forEach(function(exam){
				exam.score = exam.answers?g.countCorrectAnswer(exam.answers):"No answer submitted";
				return exam;
			});
			return exams;
		}
	},
});


////////////////////////autoform hooks///////////////////////////////////
AutoForm.hooks({
	stProfileUpdate:{
		onSubmit:function(doc){
			this.event.preventDefault();
			g.meteorCall("stProfileUpdate",{
						doc:doc,
						submitBtnId:"#stProfileUpdate",
						successMsg:"Profile update successful",
						redirect:"stProfile"	
			});
		}
	},
});

