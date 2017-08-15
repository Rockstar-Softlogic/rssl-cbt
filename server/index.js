import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import '../imports/admin/server/main.js';
import '../imports/student/server/main.js';


Meteor.startup(() => {
  // code to run on server at startup
  process.env.MAIL_URL = "smtps://postmaster%40sandbox64c23d2898f143a89139ad9d8f840f3b.mailgun.org:5130f0c77d236008a9ca0333ebe7bf1a@smtp.mailgun.org:587";
});

function initAdmin(){
	let lookUp = Meteor.users.findOne({username:"wisdomabioye", "emails.0.address":"hakym2009@gmail.com", roles:'admin'});
	if(!lookUp){
		let admin= Accounts.createUser({username:"wisdomabioye", email:"hakym2009@gmail.com", password: "wetindey"});
		if(admin){
			Roles.addUsersToRoles(admin, ['staff', 'admin','superAdmin']);
			console.log("Admin created and addded to roles");
		}
	}else{
		console.log(lookUp.username,lookUp.emails[0].address, " already a ",lookUp.roles);
	}

}
initAdmin();

function fakeAdmin(){
	let lookUp = Meteor.users.findOne({username:"admin", "emails.0.address":"admin@rssl.com", roles:'admin'});
	if(!lookUp){
		let admin = Accounts.createUser({username:"admin", email:"admin@rssl.com", password: "admin123"});
		if(admin){
			Roles.addUsersToRoles(admin, ['staff', 'admin']);
			console.log("Fake admin created and addded to roles");
		}
	}else{
		console.log(lookUp.username,lookUp.emails[0].address, " already a ",lookUp.roles);
	}

}
fakeAdmin();

Meteor.methods({

	//later use....suspended!
	// sendFeedback:function(doc){
	// 	check([doc.email,doc.subject,doc.message],[String]);
	// 	let to = 'hakym2009@gmail.com';
	// 	let obj = {to:to,from:doc.email,subject:doc.subject,text:doc.message};
	// 	Email.send(obj);
	// }
})