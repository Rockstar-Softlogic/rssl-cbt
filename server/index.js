import { Meteor } from 'meteor/meteor';
import '../imports/admin/server/main.js';
import '../imports/student/server/main.js';


Meteor.startup(() => {
  // code to run on server at startup
});

function initAdmin(){
	let lookUp = Meteor.users.findOne({username:"wisdomabioye", "emails.0.address":"hakym2009@gmail.com", roles:'staff'});
	if(!lookUp){
		let admin= Accounts.createUser({username:"wisdomabioye", email:"hakym2009@gmail.com", password: "wetindey"});
		if(admin){
			Roles.addUsersToRoles(admin, ['staff', 'admin']);
			console.log("Admin created and addded to roles");
		}
	}else{
		console.log(lookUp.username,lookUp.emails[0].address, " already a ",lookUp.roles);
	}

}
initAdmin();
