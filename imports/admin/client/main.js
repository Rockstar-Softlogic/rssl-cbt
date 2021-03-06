import './main.html';
XLSX = require('xlsx');

Template.staffDashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('settings');
			self.subscribe('myExams');
			self.subscribe('studentList');
		});
});

Template.staffDashboard.helpers({
	examCount:function(){
		let setting = g.Settings.findOne({"_id":"default"});
		let total = g.Exams.find({"createdBy":Meteor.userId(),"session":setting.session,"term":setting.term});
		if(total){
			total = total.count();
			let publish = g.Exams.find({"createdBy":Meteor.userId(),"publish":true}).count();
			let unpublish = g.Exams.find({"createdBy":Meteor.userId(),"publish":false}).count();
			return {total:total,publish:publish,unpublish:unpublish};	
		}
	},
	studentCount:function(){
		let allStudent = Meteor.users.find({"_id":{$ne:Meteor.userId()}}).count(),
			jss1 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"JSS1"}).count(),
			jss2 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"JSS2"}).count(),
			jss3 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"JSS3"}).count(),
			sss1 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"SSS1"}).count(),
			sss2 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"SSS2"}).count(),
			sss3 = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"SSS3"}).count();
			graduated = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"Graduated"}).count();
		return {allStudent:allStudent,jss1:jss1,jss2:jss2,jss3:jss3,sss1:sss1,sss2:sss2,sss3:sss3,graduated:graduated};
	}

});

Template.staffDashboard.events({
	'click #newSession': function(){
		let session = new Date().getFullYear();
			session += (("/") + (++session)).toString();
		bootbox.confirm("Create new session "+session+"? Term will be set to 1<sup>st</sup> on creation of new session.", function(result){
			if(result){
				g.meteorCall("newSession",{
					successMsg:"Session created successfully."});
			}
		});
	},
	'click #newTerm': function(){
		let currentTerm = g.Settings.findOne({_id:"default"}).term, term;
		if(!currentTerm){g.notice("Create a session first.",6000);return;}
			switch(currentTerm){
				case 1:
					term = "2nd";
					break;
				case 2:
					term = "3rd";
					break;
				case 3:
					term = "invalid";
			}
		if(term=="invalid"){
			bootbox.alert("Create new session please.");
			return;
		}else{
			bootbox.confirm("Sure to create "+term+" term?", function(result){
				if(result){
					g.meteorCall("newTerm",{successMsg:"Term created successfully."});
				}
			});
		}
	},
	'click #promoteStudents':function(e){
		e.preventDefault();
		let text = "<h4>Are you sure to promote all the students in the school?<br/>";
			text += "JSS1 => JSS2 <br/> JSS2 => JSS3 <br/> JSS3 => SSS1 <br/>";
			text += "SSS1 => SSS2 <br/> SSS2 => SSS3 <br/> SSS3 => Graduated </h4>";
			bootbox.confirm(text,function(result){
				if(result){
					g.meteorCall("promoteStudents",{
						doc:true,
						successMsg:"All students have been promoted!"
					});
				}
			});
	}


});


Template.studentList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("studentList");
		});
});

Template.studentList.helpers({
	students:function(){
		let stFilter = Session.get("studentFilter"),users;
		if(stFilter){
			users = Meteor.users.find({"_id":{$ne:Meteor.userId()},$or:[{"username":stFilter.stId},{"profile.currentClass":stFilter.class}]});
		}else{
			users = Meteor.users.find({"_id":{$ne:Meteor.userId()},"profile.currentClass":"JSS1"});
		}
		if(users){
			return users;
		}
	}	
});

Template.studentList.events({
	"submit form":function(e){
		e.preventDefault();
		let stId = e.target.studentId.value,
			currentClass = e.target.class.value;
		Session.set("studentFilter",{stId:stId,class:currentClass});
	},

	"click #deleteStudent":function(e){
		let self = this.profile;
		let msg = "<h4><b>Deleting a student will also delete his/her results.</b><br/><br/>";
			msg += "<b> <u>Details</u><br/> "+self.lastName+", "+self.firstName+" in "+self.currentClass+" </b></h4>";
			msg += "<h3> Are you sure? This action cannot be undone!</h3>";
		let target = this._id;
		bootbox.confirm(msg,function(result){
			if(result){
				g.meteorCall("removeUser",{doc:target,
										successMsg:"The student was removed!."
										});
			}
		});
	}
});

Template.editStudent.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("studentList");
		});
});

Template.editStudent.helpers({
	student:function(){
		let id = FlowRouter.getParam("id");
		let user = Meteor.users.findOne({"_id":id}).profile;
		if(user){
			return user;
		}
	}
	
});
///Staff script ...////
Template.staffList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("staffList");
		});
});

Template.staffList.helpers({
	staffs:function(){
		let users= Meteor.users.find({"_id":{$ne:Meteor.userId()}});
		if(users){
			return users
		}
	}	
});

Template.staffList.events({
	"click #deleteStaff":function(e){
		let self = this;
		let msg = "<h4><b>Deleting a staff will also delete his/her examinations.</b><br/><br/>";
			msg += "<b> <u>Details</u><br/> "+self.profile.lastName+", "+self.profile.firstName+" with staff Id "+self.username+" </b></h4>";
			msg += "<h3> Are you sure? This action cannot be undone!</h3>";
		let target = this._id;
		bootbox.confirm(msg,function(result){
			if(result){
				g.meteorCall("removeUser",{doc:target,
										successMsg:"The staff was removed!."
										});
			}
		});
	}	
});

Template.editStaff.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("staffList");
		});
});

Template.editStaff.helpers({
	staff:function(){
		let id = FlowRouter.getParam("id");
		let user = Meteor.users.findOne({"_id":id}).profile;
		if(user){
			return user;
		}
	}	
});

Template.singleStaffExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("myExams");
			self.subscribe("staffList");
			self.subscribe("examAnswer");
			self.subscribe("settings");
		});
});

Template.singleStaffExam.helpers({
	exams:function(){
		let id = FlowRouter.getParam('id'),staffExam;
		let setting = g.Settings.findOne({"_id":"default"});
		let filter = Session.get('singleStaffExamFilter');
		if(filter){
			filter=="showAllExams"?staffExam=g.Exams.find({"createdBy":id,"session":setting.session,"term":setting.term}).fetch().reverse():staffExam=g.Exams.find({"createdBy":id,$or:[{"session":filter.session},{"term":filter.term}],$or:[{"subject":filter.subject},{"class":filter.class}]}).fetch().reverse();	
		}else{
			staffExam = g.Exams.find({'createdBy':id,"session":setting.session,"term":setting.term}).fetch().reverse();
		}
		
		if(staffExam){
			staffExam.forEach(function(exam){
				g.StAnswers.find({"examId":exam._id}).count()>0?exam.resultAvail=true:exam.resultAvail=false;
				exam.count=exam.questions.length;
				return exam;

			});
			return staffExam;	
		}
	},
	staffInfo:function(){
		let id = FlowRouter.getParam('id');
		return Meteor.users.findOne({"_id":id});
	}

});

Template.singleStaffExam.events({
	"submit form":function(e){
		e.preventDefault();
		let examClass=event.target.examClass.value,
			examSubject=event.target.examSubject.value,
			session = event.target.session.value,
			term = Number(event.target.term.value);

		let examFilter = {subject:examSubject,class:examClass,session:session,term:term};
		Session.set("singleStaffExamFilter",examFilter);
	},
	"click #showAllExams":function(e){
		e.preventDefault();
		Session.set('singleStaffExamFilter',"showAllExams");
	},
	"click #removeExam":function(e){
		e.preventDefault();
		let warning = "<b>Are you sure? <br/>You're about to delete "+this.subject+" examination for "+this.class+" this will also delete all the submitted answers. This cannot be undone.</b>";
		let self = this;
		bootbox.confirm(warning,function(result){
			if(result){
				g.meteorCall("removeExam",{doc:self,
											successMsg:"Exam has been removed!",
											});
			}
		});

	}
});		

//end staff
Template.examsList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("myExams");
			self.subscribe("examAnswer");
			self.subscribe("settings");
		});
});

Template.examsList.helpers({
	exams:function(){
		let setting = g.Settings.findOne({"_id":"default"});
		let filter = Session.get('examFilter'),papers;
		if(filter){
			filter=="showAllExams"?papers=g.Exams.find({"createdBy":Meteor.userId(),"session":setting.session,"term":setting.term}).fetch().reverse():papers=g.Exams.find({"createdBy":Meteor.userId(),$or:[{"session":filter.session},{"term":filter.term}],$or:[{"subject":filter.subject},{"class":filter.class},{"publish":filter.publish}]}).fetch().reverse();	
		}else{
			papers=g.Exams.find({"createdBy":Meteor.userId(),"session":setting.session,"term":setting.term}).fetch().reverse();
		}
		if(papers){
			papers.forEach(function(exam){
				g.StAnswers.find({"examId":exam._id}).count()>0?exam.resultAvail=true:exam.resultAvail=false;
				exam.count=exam.questions.length;
				return exam;

			});
			return papers;	
		}
	},


});

Template.examsList.events({
	"submit form":function(event){
		event.preventDefault();
		let examClass=event.target.examClass.value,
			examSubject=event.target.examSubject.value,
			publish = event.target.publish.checked,
			session = event.target.session.value,
			term = Number(event.target.term.value);

		let examFilter = {subject:examSubject,class:examClass,publish:publish,session:session,term:term};
		Session.set("examFilter",examFilter);
	},
	"click #showAllExams":function(e){
		e.preventDefault();
		Session.set('examFilter',"showAllExams");
	},
	"click #removeExam":function(e){
		e.preventDefault();
		let warning = "<b>Are you sure? <br/>You're about to delete "+this.subject+" examination for "+this.class+" this will also delete all the submitted answers. This cannot be undone.</b>";
		let self = this;
		bootbox.confirm(warning,function(result){
			if(result){
				g.meteorCall("removeExam",{doc:self,
										successMsg:"Exam has been removed!",
										});
			}
		});

	}
});

Template.singleExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("myExams");
		});
});

Template.singleExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({_id:id});
			paper.count=paper.questions.length;
			return paper;
	},
});

Template.editExam.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("myExams");
		});
});
Template.editExam.helpers({
	exam:function(){
		let id = FlowRouter.getParam("id");
		let paper = g.Exams.findOne({_id:id},{fields:{"answers":0}});
		return paper;
	}
});

Template.studentResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("studentList");
			self.subscribe("examAnswer");
			self.subscribe("settings");
		});
});

Template.studentResult.helpers({
	result:function(){
		let id = FlowRouter.getParam("id"),
			setting = g.Settings.findOne({"_id":"default"});
		let session = setting.session,term = setting.term;
		
		let exams = g.StAnswers.find({"session":session,"term":term,"studentId":id}).fetch();
		if(exams){
			exams.forEach(function(exam){
				exam.score = exam.answers?g.countCorrectAnswer(exam.answers):"No answer submitted";
				return exam;
			});
			return exams;
		}
	},
	profile:function(){
		let id = FlowRouter.getParam("id");
		let pro = Meteor.users.findOne({"_id":id}).profile;
		if(pro){
			return pro;
		}
	},

});


Template.resultList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('examAnswer');
			self.subscribe('studentList');
		});
});

Template.resultList.helpers({
	results:function(){
		let id = FlowRouter.getParam("id");
		let result = g.StAnswers.find({"examId":id}).fetch();
		if(result){
			result.forEach(function(res){
				let st = Meteor.users.findOne({"_id":res.studentId});
					if(st){
						res.profile = st.profile;
					}else{
						res.profile = {firstName:"Unknown",lastName:"Unknown",studentId:"Empty Id"};
					}
					res.answers?res.correctAnswers=g.countCorrectAnswer(res.answers):false;
				return res;
			});
			return result;
		}
	},
	resultInfo:function(){
		let id = FlowRouter.getParam("id");
		let result = g.StAnswers.findOne({"examId":id},{fields:{"class":1,"subject":1,"session":1,"term":1,"questionsCount":1}});
		if(result){
			return result;
		}
	}
});

Template.resultList.events({
	'click #removeResult':function(e){
		e.preventDefault();
		let self = this;
		let msg = "<h4>Remove "+self.profile.lastName+" "+self.profile.firstName+" "+self.subject+" Result?</h4>";
			msg += "<h4> This cannot be undone.</h4>";
		bootbox.confirm(msg,function(result){
			if(result){
				g.meteorCall("removeResult",{doc:self,
											successMsg:"Student result has been removed."});
			}
		});

	}
});


Template.uploadExam.events({
	'change input#file':function(e){
		e.preventDefault();
		let allowedFormat = ["sheet","spreadsheet"];
		let file = e.target.files[0];
		if(!file)return;
		let reader = new FileReader();
		let type = file.type.split(".");
		if(allowedFormat.indexOf(type[type.length-1])<0){
			g.notice("Unsupported file selected", 6000);
			return;
		}
		reader.onload = function(e){
			let data = e.target.result;
			let exam = XLSX.read(data,{type:'binary'});
			let sheet = exam.Sheets.Sheet1;
			let examPreview = excelToJSON(sheet);
				excelToTable(examPreview);
				Session.set("examToUpload",{questions:examPreview});
		};
		reader.readAsBinaryString(file);
	},
	'submit form':function(e){
		e.preventDefault();
		let examClass=e.target.examClass.value;
		let examSubject=e.target.examSubject.value;
		let publish=e.target.publish.checked;
		let minute =e.target.minute.value;
		let getExam = Session.get("examToUpload");
		if(!getExam){
			g.notice("Please select a valid file to upload.");
			return;
		}
		else if(!examClass || !examSubject || !minute){
			g.notice("Please select a class, subject and time given for exam.");
			return;
		}else{
			bootbox.confirm("Sure to upload this file?", function(result){
				if(result){
					getExam.class = examClass;
					getExam.subject = examSubject;
					getExam.publish = publish;
					getExam.minute = minute;
					g.meteorCall("newExam",{doc:getExam,
											successMsg:"Exam uploaded and added successfully",
											redirect:"examsList"});
				}
			});
			
		}
	},
	'click #uploadFormatToggle':function(e){
		e.preventDefault();
		$("#uploadFormat").fadeToggle();
	}
});

//Autoform hooks and addHooks
AutoForm.hooks({
	newExam:{
		onSubmit:function(data){
			this.event.preventDefault();
			g.meteorCall("newExam",{doc:data,
									submitBtnId:"#newExam",
									successMsg:"Exam created successful",
									redirect:"examsList"});
		}
	},
	profileUpdate:{
		onSubmit:function(data){
			this.event.preventDefault();
			g.meteorCall("profileUpdate",{doc:data,
										submitBtnId:"#profileUpdate",
										successMsg:"Profile update successful",
										redirect:"profile"});

		}
	},
	editExam:{
		onSubmit:function(doc){
			this.event.preventDefault();
			doc.target = this.currentDoc._id;
			g.meteorCall("editExam",{doc:doc,
									submitBtnId:"#editExam",
									successMsg:"Exam updated successfully",
									redirect:"examsList"});
		}
	},
	newStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			doc.type="insert";
			g.meteorCall("newStudent",{doc:doc,
										submitBtnId:"#newStudent",
										successMsg:"Student added with success.",
										redirect:"studentList"});

		}
	},
	editStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = FlowRouter.getParam("id");
			doc.id=id;
			g.meteorCall("newStudent",{doc:doc,
										submitBtnId:"#editStudent",
										successMsg:"Student data updated.",
										redirect:"studentList"});

		}
	},
	newStaff:{
		onSubmit:function(doc){
			this.event.preventDefault();
			doc.type="insert";
			g.meteorCall("newStaff",{doc:doc,
									submitBtnId:"#newStaff",
									successMsg:"Staff added with success.",
									redirect:"staffList"});

		}
	},
	editStaff:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = FlowRouter.getParam("id");
			doc.id=id;
			g.meteorCall("newStaff",{doc:doc,
									submitBtnId:"#editStaff",
									successMsg:"Staff data updated.",
									redirect:"staffList"});

		}
	}
});

// **********************///
// **********************///
// ******BREAK Break******//
// **********************///
// **********************///

function excelToJSON(sheet){
	let rows = Number(sheet["!ref"].split("G")[1]);
	let array = [];

	for(let i = 2; i <= rows; i++){
		let obj = {};
		obj.id = sheet["A"+i]['v'];
		obj.question = sheet["B"+i]['v'];
		obj.a = sheet["C"+i]['v'];
		obj.b = sheet["D"+i]['v'];
		obj.c = sheet["E"+i]?sheet["E"+i]['v']:"";
		obj.d = sheet["F"+i]?sheet["F"+i]['v']:"";
		obj.answer = sheet["G"+i]['v'];
		array.push(obj);
	}
	return array;
}

function excelToTable(array){
	let fragment = document.createDocumentFragment();
	let head = document.createElement("tr"),
		th = "<th>Id</th><th>Question</th><th>Option A</th><th>Option B</th><th>Option C</th><th>Option D</th><th>Answer</th>";
		head.innerHTML=th;
		fragment.appendChild(head);
	for(let i = 0; i < array.length; i++){
		let ct = array[i];
		let id = "<td>"+ct.id+"</td>",
			question = "<td>"+ct.question+"</td>",
			a = "<td>"+ct.a+"</td>",
			b = "<td>"+ct.b+"</td>",
			c = "<td>"+ct.c+"</td>",
			d = "<td>"+ct.d+"</td>",
			answer = "<td>"+ct.answer+"</td>";
		let tr = document.createElement('tr');
			tr.innerHTML = id+question+a+b+c+d+answer;
		fragment.appendChild(tr);
	}
	let table = document.createElement("table");
		table.appendChild(fragment);
	let	preview = document.getElementById("examPreview");
		preview.innerHTML="";
		preview.appendChild(table);
	return table;
}



