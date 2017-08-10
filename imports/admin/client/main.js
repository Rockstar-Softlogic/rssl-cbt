import './main.html';
XLSX = require('xlsx');

Template.staffDashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('settings');
			self.subscribe('myExams');
		});
});

Template.staffDashboard.helpers({
	sessionInfo:function(){
		let settings = g.Settings.findOne();
		if(settings){
			return settings
		}
	},
	count:function(){
		let total = g.Exams.find({});
		if(total){
			total = total.count();
			let publish = g.Exams.find({"publish":true}).count();
			let unpublish = g.Exams.find({"publish":false}).count();
			return {total:total,publish:publish,unpublish:unpublish};	
		}
		
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
			}else{
				return false;
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

});

Template.profile.helpers({
	user: function(){
        let currentUser = Meteor.user();
        return currentUser;
    },
});

Template.profileUpdate.helpers({
	profile:function(){
		let pro = Meteor.user().profile;
		if(pro){
			return pro;
		}
	},
});

Template.studentList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("studentList");
		});
});

Template.studentList.helpers({
	students:function(){
		let users= Meteor.users.find({"_id":{$ne:Meteor.userId()}});
		if(users){
			return users
		}
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
///Staff script
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
//end staff
Template.examsList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("myExams");
		});
});

Template.examsList.helpers({
	exams:function(){
		let examFilter = Session.get('examFilter'),papers;
		if(examFilter){
			examFilter=="showAllExams"?papers=g.Exams.find().fetch().reverse():papers=g.Exams.find(examFilter).fetch().reverse();	
		}else{
			papers=g.Exams.find().fetch().reverse();
		}
		if(papers){
			papers.forEach(function(exam){
				exam.term = g.termSuffix(exam.term);
				exam.count=exam.questions.length;
				return exam;

			});
			return papers;	
		}
	},
	subjects:function(){
		return g.subjectArray;
	}
});

Template.examsList.events({
	"submit form":function(event){
		event.preventDefault();
		let examClass=event.target.examClass.value;
		let examSubject=event.target.examSubject.value;
		let publish = event.target.publish.checked;
		let examFilter = {subject:examSubject,class:examClass,publish:publish};
		Session.set("examFilter",examFilter);
	},
	"click #showAllExams":function(e){
		e.preventDefault();
		Session.set('examFilter',"showAllExams");
	},
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
			paper.term = g.termSuffix(paper.term);
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
		let paper = g.Exams.findOne({_id:id});
		return paper;
	}
});
Template.uploadExam.helpers({
	subjects:function(){
		return g.subjectArray;
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
			console.log("received");
			console.log(doc);
			$("div.processUpload").show('slow');
			Meteor.call('newExam',doc,function(error, result){
				if(error){
					$("div.processUpload").hide('fast');
					g.notice(error, 6000);
					reEnableBtn("#editExam");
					return;
				}else{
					console.log("received here too");

					$("div.processUpload").hide('fast');
					g.notice("Exam updated successful");
					FlowRouter.go('exams');

				}
			});
			//g.meteorCall("profileUpdate",data,"#profileUpdate","Profile update successful","profile");

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



