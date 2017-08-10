Meteor.publish({
	'stExams':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let currentClass = Meteor.user().profile.currentClass;
			let exams = g.Exams.find({"class":currentClass, "publish":true},{fields:{"answers":0,"questions.answer":0}});
			if(exams){
				return exams;
			}
		}
		return this.ready();
	},
	'stExamResult':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let currentClass = Meteor.user().profile.currentClass;
			let exams = g.Exams.find({"class":currentClass, "publish":true},{fields:{"answers":0}});
			if(exams){
				return exams;
			}
		}
		return this.ready();
	},
	'stAnswers':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let answers = g.StAnswers.find({"studentId":userId});
			if(answers){
				return answers;
			}
		}
		return this.ready();
	}
	
});