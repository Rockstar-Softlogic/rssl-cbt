import './main.html';
//import xlsx from 'xlsx';

XLSX = require('xlsx');

let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
				Meteor.call('newSession',function(error,result){
					if(error){
						insertNotice(error, 6000);
						return;
					}else{
						insertNotice(result);
					}
				});
			}else{

			}
		});
	},
	'click #newTerm': function(){
		let currentTerm = g.Settings.findOne({_id:"default"}).term, term;
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
					Meteor.call('newTerm',function(error,result){
						if(error){
							insertNotice(error, 6000);
							return;
						}else{
							insertNotice(result);
						}
					});
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



///end staff

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
				exam.term = termSuffix(exam.term);
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
			paper.term = termSuffix(paper.term);
			paper.count=paper.questions.length;
			return paper;
	},
});

Template.singleExam.events({
	'submit .gotoQuestion form':(e)=>{
		e.preventDefault();
		let questionNumber = e.target.questionNumber.value;
		let origin = window.location.href.split("#")[0];
			questionNumber = questionNumber<2?questionNumber:questionNumber-1;
		window.location = origin+"#"+(questionNumber);
		return;
	}
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
			insertNotice("Unsupported file selected", 6000);
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
			insertNotice("Please select a valid file to upload.");
			return;
		}
		else if(!examClass || !examSubject || !minute){
			insertNotice("Please select a class, subject and time given for exam.");
			return;
		}else{
			bootbox.confirm("Sure to upload this file?", function(result){
				if(result){
					$("div.processUpload").show("fast");
					getExam.class = examClass;
					getExam.subject = examSubject;
					getExam.publish = publish;
					getExam.minute = minute;
					Meteor.call("newExam",getExam,function(error,result){
						if(error){
							$("div.processUpload").hide("fast");
							insertNotice(error, 6000);
							return;
						}else{
							$("div.processUpload").hide("fast");
							insertNotice("Exam uploaded and added successfully");
							FlowRouter.go("examsList");
							return;
						}
					});
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
			Meteor.call('newExam',data,function(error, result){
				if(error){
					insertNotice(error, 6000);
					reEnableBtn("#newExam");
					return;
				}else{
					insertNotice("Exam created successful");
					FlowRouter.go('examsList');

				}
			});
		}
	},
	profileUpdate:{
		onSubmit:function(data){
			this.event.preventDefault();
			Meteor.call("profileUpdate",data,function(error){
				if(error){
					insertNotice(error, 6000);
					return;
				}else{
					insertNotice("Profile update successful");
					FlowRouter.go("profile");
				}
			});
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
					insertNotice(error, 6000);
					reEnableBtn("#editExam");
					return;
				}else{
					console.log("received here too");

					$("div.processUpload").hide('fast');
					insertNotice("Exam updated successful");
					FlowRouter.go('exams');

				}
			});
		}
	},
	newStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			doc.type="insert";
			Meteor.call('newStudent',doc,function(error){
				if(error){
					insertNotice(error, 6000);
					reEnableBtn("#newStudent");
					return;
				}else{
					insertNotice("Student added with success.");
					FlowRouter.go("studentList");
				}
			})
		}
	},
	editStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = FlowRouter.getParam("id");
			doc.id=id;
			Meteor.call('newStudent',doc,function(error){
				if(error){
					insertNotice(error, 6000);
					reEnableBtn("#editStudent");
					return;
				}else{
					insertNotice("Student data updated",4000);
					FlowRouter.go("studentList");
					
				}
			});
		}
	},
	newStaff:{
		onSubmit:function(doc){
			this.event.preventDefault();
			doc.type="insert";
			Meteor.call('newStaff',doc,function(error){
				if(error){
					insertNotice(error, 6000);
					reEnableBtn("#newStaff");
					return;
				}else{
					insertNotice("Staff added with success.");
					FlowRouter.go("staffList");
				}
			});
		}
	},
	editStaff:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = FlowRouter.getParam("id");
			doc.id=id;
			Meteor.call('newStaff',doc,function(error){
				if(error){
					insertNotice(error, 6000);
					reEnableBtn("#editStaff");
					return;
				}else{
					insertNotice("Staff data updated",4000);
					FlowRouter.go("staffList");
					
				}
			});
		}
	}
});

// **********************///
// **********************///
// ******BREAK Break******//
// **********************///
// **********************///

function reEnableBtn(id){
	return $(id+" button[type='submit']").attr("disabled",false);
}
function insertNotice(text, time = 4000){
	$('.insertNotice').text(text);
	$('.insertNotice').show('slow');
	bootbox.alert(text)
	setTimeout(function(){
		$('.insertNotice').fadeOut(3000);
			}, time);
}

function isEmptyObject(obj){
	for(var key in obj){
		if(Object.prototype.hasOwnProperty.call(obj, key)){
			return false;
		}
	}
	return true;
}

function sentenceCase(name){
	if(typeof(name) === "string"){
		var cased = [];
		name.split(" ").forEach(function(n){
			cased.push(n[0].toUpperCase() + n.substring(1).toLowerCase()); 
		});
		return cased.join(" ");
	}
	return name;
}

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