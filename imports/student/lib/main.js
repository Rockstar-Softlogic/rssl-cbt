Meteor.methods({
	createStAnswer:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let checkCount = g.StAnswers.find({"examId":doc._id,
										"studentId":this.userId}).count();
		let checkLength = g.StAnswers.findOne({"examId":doc._id,
										"studentId":this.userId});
		if(checkCount==0){
			let insert = g.StAnswers.insert({"examId":doc._id,
										"studentId":this.userId,
										"questionsCount":doc.questions.length});
			return insert;
		}else if(checkCount==1){
			if(checkLength.questions){
				throw new Meteor.Error("302", "You've already submitted this exam.");
			}else{
				let attempt = checkLength.attempt?attempt+1:1;
				let update = g.StAnswers.update({"examId":doc._id,
										"studentId":this.userId},{$set:{"attempt":attempt}});
				return update;
			}
		}else{
			throw new Meteor.Error("501", "You have multiple result for this exam already.");
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
			
			if(checkCount==0){
				let insert = g.StAnswers.insert({"examId":co._id,
											"studentId":this.userId,
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
											"studentId":this.userId},{$set:{"attempt":attempt,
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

