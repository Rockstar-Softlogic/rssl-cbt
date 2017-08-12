import fs from 'fs';
import path from 'path';

Meteor.publish({
	'settings':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['staff', 'student'])){
			let appSetting = g.Settings.find({"_id":"default"});	
				if(appSetting){
					return appSetting;
				}
		}
		return this.ready();
	},
	'myExams':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['staff'])){
			let exams = g.Exams.find({createdBy:userId});
			if(exams){
				return exams;
			}
		}
		return this.ready();
	},
	'studentList':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['staff'])){
			let st = Meteor.users.find({"roles":"student"});
			if(st){
				return st;
			}
		}
		return this.ready();
	},
	'staffList':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin'])){
			let staff = Meteor.users.find({"roles":"staff"});
			if(staff){
				return staff;
			}
		}
		return this.ready();
	},
	'examAnswer':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['staff'])){
			let answers = g.StAnswers.find({});
			if(answers){
				return answers;
			}
		}
		return this.ready();
	}
	
});

Meteor.methods({
	'uploadPassport':function(name, argument){
		serverRoot = process.env.PWD;
		let filePath = path.join(serverRoot, name);
		console.log(filePath);
		fs.writeFile(filePath, Buffer.from(argument, 'base64'), function(err){
			if(err){
				throw new Meteor.Error('Error occured', err);
			}
		});
	},
});

