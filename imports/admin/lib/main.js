
Meteor.methods({
	newSession: function(){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let session = new Date().getFullYear();
			session += (("/") + (++session)).toString();
		let count = g.Settings.find().count();
		if(count==1){
			g.Settings.update({_id:"default"},{$set:{"session":session,"term":1}});
		}else if(count==0){
			g.Settings.insert({_id:"default",session:session,term:1});
		}else{
			throw new Meteor.Error(400, "Session and term handler is faulty, notify the administrator");
		}
		return ("Session "+session+" was created and term set to 1<sup>st</sup>.");	
	},

	newTerm: function(){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let term;
		let currentTerm = g.Settings.findOne({_id:"default"})?g.Settings.findOne({_id:"default"}).term:undefined;
		if(!currentTerm || currentTerm==3){
			throw new Meteor.Error(400, 'Term cannot be determined. Create new session instead.');
		}else{
			switch(currentTerm){
				case 1:
					term = 2;
					break;
				case 2:
					term = 3;
					break;
				default:
					throw new Meteor.Error("Error", "Term cannot be determined.");
			}
			g.Settings.update({_id:"default"},{$set:{"term":term}});
			return ("Term was updated to "+term);
		}		
	},
	profileUpdate:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let userId = this.userId;
		let update = Meteor.users.update({"_id":userId},{$set:{"profile":doc}});
		return update;
	},
	newExam:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let userId = this.userId, settings;
		if(Meteor.isServer){
			settings = g.Settings.findOne({_id:"default"});
			if(!settings){
				throw new Meteor.Error("400","School not in session. Create session first.");
			}else{
				let check = g.Exams.find({"class":doc.class,"subject":doc.subject,"session":settings.session,"term":settings.term}).count();
				if(check>0){
					throw new Meteor.Error(doc.subject+" for "+doc.class+" already exist.");
				}
				doc.session=settings.session;
				doc.term=settings.term;
				doc.answers=[];
				for(var i=0; i<doc.questions.length; i++){
					doc.questions[i].id=i+1;
					let answerObj = {id:doc.questions[i].id,answer:doc.questions[i].answer};
					doc.answers.push(answerObj);
				}
				let createPaper = g.Exams.insert(doc);
				return createPaper;
			}	
		}
	},
	editExam:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let id = doc.target;
			delete doc.target;
		doc.answers=[];
		for(var i=0; i<doc.questions.length; i++){
			doc.questions[i].id=i+1;
			let answerObj = {id:doc.questions[i].id,answer:doc.questions[i].answer};
			doc.answers.push(answerObj);
		}
		let updatePaper = g.Exams.update({"_id":id},{$set:doc});
		return updatePaper;
	},
	newStudent:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		if(!doc.studentId || !doc.currentClass || !doc.firstName || !doc.lastName){
			throw new Meteor.Error('400', 'One of required field(s) is missing');
		}
		if(doc.type=="insert"){
			delete doc.type;
			let newSt = Accounts.createUser({
						username:doc.studentId,
						password:"12345",
						profile:doc
					});
			if(newSt){
				Roles.addUsersToRoles(newSt, 'student');
				return newSt;
			}	
		}//insert
		else{
			let id = doc.id;
				delete doc.id;
			let update = Meteor.users.update({"_id":id},{$set:{"profile":doc}});
			return update;
		}		
	},
	newStaff:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		if(!doc.staffId || !doc.firstName || !doc.lastName){
			throw new Meteor.Error('400', 'One of required field(s) is missing');
		}
		if(doc.type=="insert"){
			let newStaff = Accounts.createUser({
						username:doc.staffId,
						password:"12345",
						profile:doc
					});
			if(newStaff){
				Roles.addUsersToRoles(newStaff, 'staff');
				return newStaff;
			}	
		}//insert
		else{
			let id = doc.id;
				delete doc.id;
			let update = Meteor.users.update({"_id":id},{$set:{"profile":doc}});
			return update;
		}//update
	},
	removeExam:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let remove = g.Exams.remove({"_id":doc._id,"class":doc.class,"subject":doc.subject,"session":doc.session,"term":doc.term});
			if(remove){
				g.StAnswers.remove({"examId":doc._id,"class":doc.class,"subject":doc.subject,"session":doc.session,"term":doc.term});
			}else{
				throw new Meteor.Error("501", "Unable to remove exam. Contact the administrator.");
			}
	},
	removeUser:function(id){
		if(this.userId && Roles.userIsInRole(this.userId, ['admin'])){	
			let delUser = Meteor.users.remove({"_id":id});
			if(delUser){
				//if student delete student result
				let delResult = g.StAnswers.remove({"studentId":id});
				//if staff, delete exams by this staff
				let delExam = g.Exams.remove({"createdBy":id});
			}
		}else if(this.userId && Roles.userIsInRole(this.userId, ['staff'])){
			if(Roles.userIsInRole(id, ['student'])){
				let delUser = Meteor.users.remove({"_id":id});
				if(delUser){
					//delete student result
					let delResult = g.StAnswers.remove({"studentId":id});
				}		
			}else{
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
		}else{
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		
	},
	removeResult:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['staff','admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let removeRes = g.StAnswers.remove({"_id":doc._id,"subject":doc.subject,"class":doc.class,"session":doc.session,"term":doc.term});
		if(removeRes){
			return removeRes;
		}
	},
	promoteStudents:function(bool){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		if(!bool){throw new Meteor.Error('500',"Unable to validate.")}
			let students = Meteor.users.find({"roles":"student","profile.currentClass":{$ne:"Graduated"}});
			if(students){
				let promote = students.map(function(st){
								let newClass = g.promoteStudents(st.profile.currentClass);
								Meteor.users.update({"_id":st._id},{$set:{"profile.currentClass":newClass}});
								return newClass;
							});
				return true;
			}	
	}	
			
});
