Meteor.methods({
	createStAnswer:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		
	},
	checkAnswer:function(id){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let check = g.StAnswers.findOne({"examId":id});
		if(check){
			throw new Meteor.Error("401", "Result for this exam is available.");
		}
		return true;
		
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
			
			if(checkCount==0){
				let insert = g.StAnswers.insert({"examId":co._id,
											"studentId":co.userId,
											"subject":co.subject,
											"class":co.class,
											"session":co.session,
											"term":co.term,
											"questionsCount":co.questions.length,
											"answeredCount":computeAnswer().length,
											"unanswered":(co.questions.length-(computeAnswer().length)),
											"answers":computeAnswer()});
				return insert;
			}else if(checkCount==1){
				if(checkLength.answers){
					throw new Meteor.Error("302", "You've already submitted this exam! Thank you.");
				}else{
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
			}else{
				throw new Meteor.Error("501", "You have multiple result for this exam already.");
			}

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

