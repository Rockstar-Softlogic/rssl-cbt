
//User rules
Meteor.users.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

Meteor.users.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});
//Ca rules
g.Ca.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Ca.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});
//exams rules
g.Exams.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});
g.Exams.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});
//st answers
g.StAnswers.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});
g.StAnswers.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//feedback
g.Feedbacks.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Feedbacks.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});


//settings rules
g.Settings.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Settings.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});