Meteor.methods({
	stProfileUpdate:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let userId = this.userId;
		let update = Meteor.users.update({"_id":userId},{$set:{"profile.email":doc.email,
																"profile.otherName":doc.otherName,
																"profile.gender":doc.gender,
																"profile.dob":doc.dob,
																"profile.phone":doc.phone,
																"profile.address":doc.address
															}});
		return update;
	},
	initAnswer:function(id){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		if(id.length !== 17 || typeof id !=="string"){
			throw new Meteor.Error(302, "Invalid Parameter");
		}
		let checkAnswer = g.StAnswers.findOne({"examId":id,"studentId":this.userId});
		if(checkAnswer){
			throw new Meteor.Error("401", "Your result for this exam is already available.");
		}
		let exam = g.Exams.findOne({"_id":id});	
		let freshAnswer = g.StAnswers.insert({examId:id,
											studentId:this.userId,
											class:exam.class,
											term:exam.term,
											session:exam.session,
											subject:exam.subject,
											questionsCount:exam.questions.length,
								});
		return freshAnswer;

	},
	checkAnswer:function(id){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let checkAnswer = g.StAnswers.findOne({"examId":id,"studentId":this.userId});
		if(checkAnswer){
			throw new Meteor.Error("401", "Your result for this exam is already available.");
		}
		
	},
	markStAnswers:function(sa,co){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		if(Meteor.isServer){
			let checkCount = g.StAnswers.find({"examId":co._id,
										"studentId":this.userId}).count();
			let checkLength = g.StAnswers.findOne({"examId":co._id,
											"studentId":this.userId});
			
			if(checkCount===1){
				let attempt = checkLength.attempt?attempt+1:1;
				let update = g.StAnswers.update({"examId":co._id,
											"studentId":this.userId},{$set:{
																			"subject":co.subject,
																			"class":co.class,
																			"session":co.session,
																			"term":co.term,
																			"attempt":attempt,
																			"questionsCount":co.questions.length,
																			"answeredCount":sa.length,
																			"unanswered":(co.questions.length-sa.length),
																			"answers":computeAnswer()}});
				return update;
			}

			// if(checkCount==0){
			// 	let insert = g.StAnswers.insert({"examId":co._id,
			// 								"studentId":co.userId,
			// 								"subject":co.subject,
			// 								"class":co.class,
			// 								"session":co.session,
			// 								"term":co.term,
			// 								"questionsCount":co.questions.length,
			// 								"answeredCount":computeAnswer().length,
			// 								"unanswered":(co.questions.length-(computeAnswer().length)),
			// 								"answers":computeAnswer()});
			// 	return insert;
			// }else if(checkCount==1){
			// 		throw new Meteor.Error("302", "You've already done this exam! Thank you.");

			// 	if(checkLength.answers){
			// 		throw new Meteor.Error("302", "You've already done this exam! Thank you.");
			// 	}else{
			// 		let attempt = checkLength.attempt?attempt+1:1;
			// 		let update = g.StAnswers.update({"examId":co._id,
			// 								"studentId":this.userId},{$set:{
			// 																"subject":co.subject,
			// 																"class":co.class,
			// 																"session":co.session,
			// 																"term":co.term,
			// 																"attempt":attempt,
			// 																"questionsCount":co.questions.length,
			// 																"answeredCount":sa.length,
			// 																"unanswered":(co.questions.length-sa.length),
			// 																"answers":computeAnswer()}});
			// 		return update;
			// 	}
			// }else{
			// 	throw new Meteor.Error("501", "You have multiple result for this exam already.");
			// }

		}

		function computeAnswer(){
			let ca = g.Exams.findOne({"_id":co._id}).answers;
			for(let i = 0; i < sa.length; i++){
				for(let j = 0; j < ca.length; j++){
					if(sa[i].id == ca[j].id){
						if(sa[i].selected==ca[j].answer){
							sa[i].mark="correct";	
						}else{
							sa[i].mark="wrong";	
						}
					}//comparison of answer id and question id
				}//second level for loop
			}//topmost level for-loop
			return sa
		}
		
	},
});

