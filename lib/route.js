//using flowRouter
import { FlowRouter } from 'meteor/kadira:flow-router';

//
if(Meteor.isClient){
	Accounts.onLogin(function(){
		if(Meteor.userId() && Roles.userIsInRole(Meteor.userId(), ['staff'])){
			FlowRouter.go('/dashboard');	
		}else if(Roles.userIsInRole(Meteor.userId(), ['student'])){
			FlowRouter.go('/st/dashboard/exams');
		}
	});
	Accounts.onLogout(function(){
		FlowRouter.go('/');
	});
}
//private routes
// check login
function checkLoggedIn(ctx, redirect){
	if(!Meteor.userId()){
		redirect('/error');
	}
}

FlowRouter.route('/', {
	name: "login",
	action(){
		BlazeLayout.render('login');
	}
});
////////////////////////////////////////
////////////Staff Routes////////////////
////////////////////////////////////////
let staffRoutes = FlowRouter.group({
	prefix: '/dashboard',
	name: 'dashboard',
	triggersEnter:[checkLoggedIn]
});

staffRoutes.route('/', {
	name: 'staffDashboard',
	action(){
		BlazeLayout.render('dashboard', {content: 'staffDashboard'});
	}
});

////////////////////////////////////////
////////////Exams Routes////////////////
////////////////////////////////////////
staffRoutes.route('/exams', {
	name: 'examsList',
	action(){
		BlazeLayout.render('dashboard', {content: 'examsList'});
	}
});
staffRoutes.route('/exams/new', {
	name: 'newExam',
	action(){
		BlazeLayout.render('dashboard', {content: 'newExam'});
	}
});
staffRoutes.route('/exams/upload', {
	name: 'uploadExam',
	action(){
		BlazeLayout.render('dashboard', {content: 'uploadExam'});
	}
});

staffRoutes.route('/exams/:id', {
	name: 'singleExam',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleExam'});
	}
});
staffRoutes.route('/exams/edit/:id', {
	name: 'editExam',
	action(){
		BlazeLayout.render('dashboard', {content: 'editExam'});
	}
});
staffRoutes.route('/student', {
	name: 'studentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'studentList'});
	}
});

staffRoutes.route('/student/new', {
	name: 'newStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'newStudent'});
	}
});
staffRoutes.route('/student/upload', {
	name: 'uploadStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'uploadStudent'});
	}
});

staffRoutes.route('/student/edit/:id', {
	name: 'editStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStudent'});
	}
});

staffRoutes.route('/staff', {
	name: 'staffList',
	action(){
		BlazeLayout.render('dashboard', {content: 'staffList'});
	}
});

staffRoutes.route('/staff/new', {
	name: 'newStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'newStaff'});
	}
});

staffRoutes.route('/staff/edit/:id', {
	name: 'editStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStaff'});
	}
});


////////////////////////////////////////
////////////Profile Routes////////////////
////////////////////////////////////////
staffRoutes.route('/profile', {
	name: 'profile',
	action(){
		BlazeLayout.render('dashboard', {content: 'profile'});
	}
});
staffRoutes.route('/profile/update', {
	name: 'profileUpdate',
	action(){
		BlazeLayout.render('dashboard', {content: 'profileUpdate'});
	}
});
////////////////////////////////////////
////////////Students Routes////////////////
////////////////////////////////////////

let stRoutes = FlowRouter.group({
	prefix: '/st/dashboard',
	name: 'stDashboard',
	triggersEnter:[checkLoggedIn]
});

stRoutes.route('/',{
	name:'studentDashboard',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'studentDashboard'});
	}
});

stRoutes.route('/profile',{
	name:'stProfile',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stProfile'});
	}
});

stRoutes.route('/profile/update',{
	name:'stProfileUpdate',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stProfileUpdate'});
	}
});

stRoutes.route('/exams',{
	name:'stExams',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stExams'});
	}
});

stRoutes.route('/exams/view/:id',{
	name:'stViewExam',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stViewExam'});
	}
});

stRoutes.route('/exams/do/:id',{
	name:'stDoExam',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stDoExam'});
	}
});

stRoutes.route('/result/:id',{
	name:'stResult',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stResult'});
	}
});

stRoutes.route('/result',{
	name:'stSingleResult',
	action(){
		BlazeLayout.render('stDashboard',{stContent:'stSingleResult'});
	}
});









//error 404!, not found
FlowRouter.notFound=({
	action(){
		BlazeLayout.render('notFound');
	}
});