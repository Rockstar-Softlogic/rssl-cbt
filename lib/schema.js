import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
SimpleSchema.extendOptions(['autoform']);

//Schemas definitions
g.Schemas.Setting = new SimpleSchema({
	session:{
		type: String,
	},
	term: {
		type: Array,
		optional: true,
	},
		'term.&': {
			type: Object,
			blackbox: true,
		},
});
//Student schema
g.Schemas.Student = new SimpleSchema({
		currentClass:{
			type:String,
			allowedValues:g.classArray,
		},
		studentId:{
			type:String,
			min:5,
			max:15,
			label:"Student Id",
		},
		email:{
			type:String,
			label:"E-mail Address (optional)",
			optional:true,
			regEx:SimpleSchema.RegEx.Email,
		},
		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		otherName: {
			type: String,
			label: "Other Names (optional)",
			optional: true,
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},

		gender: {
			type: String,
			label: "Gender (optional)",
			allowedValues: ['Male', 'Female'],
			optional:true,
		},
		dob: {
			type: Date,
			label: "Date of Birth (optional)",
			min: new Date(1970, 1, 1),
			max: new Date(2012, 1, 1),
			optional:true,
			autoform: {
				type: "bootstrap-datepicker",
			}
		},
		phone:{
			type:Array,
			optional:true,
			maxCount:2,
			label:"Contact Number (optional)"
		},
			"phone.$":{
				type:String,
				min:9,
				max:15,
			},
		address:{
			type:String,
			min:8,
			label:"Address (optional)",
			optional:true,
			autoform:{
				rows:3,
			},
		}
}, {tracker: Tracker});
//Staff schema
g.Schemas.Staff = new SimpleSchema({
		staffId:{
			type:String,
			min:5,
			max:15,
			label:"Staff Id",
		},
		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		otherName: {
			type: String,
			label: "Other Names (optional)",
			optional: true,
			min: 2,
			max: 50,
			regEx: /^[a-zA-Z-]/
		},
		gender: {
			type: String,
			label: "Gender (optional)",
			optional:true,
			allowedValues: ['Male', 'Female'],
		},
		dob: {
			type: Date,
			label: "Date of Birth (optional)",
			max: new Date(2000, 1, 1),
			min: new Date(1930, 1, 1),
			optional:true,
			autoform: {
				type: "bootstrap-datepicker",
			}
		},
		subjectTaught: {
			type: Array,
			maxCount: 10,
			minCount: 1,
			optional:true,
			label: "Subject(s) Taught (optional)",
		},
			"subjectTaught.$":{
				type: String,
			},
		phone:{
			type:Array,
			optional:true,
			maxCount:2,
			label:"Contact Number (optional)",
		},
			"phone.$":{
				type:String,
				min:9,
				max:15,
			},
		address:{
			type:String,
			min:8,
			optional:true,
			label:"Address (optional)",
			autoform:{
				rows:3,
			},
		}
	}, {tracker: Tracker});

//Exams schema
g.Schemas.Exam = new SimpleSchema({
	class:{
		type: String,
		allowedValues: g.classArray,
		label: "Class",
	},
	term:{
		type: Number,
		allowedValues: g.termArray,
		optional:true,
		autoform:{
			type:"hidden",
		}
	},
	session:{
		type: String,
		max: 9,
		min: 9,
		optional:true,
		autoform:{
			type:"hidden",
		}
	},
	subject:{
		type: String,
		allowedValues: g.subjectArray,
		label: "Subject",
	},
	publish:{
		type: Boolean,
		label: "Publish now",
	},
	minute:{
		type:Number,
		min:10,
		max:180,
		label:"Minutes"
	},
	questions:Array,
		"questions.$":{
			type:Object,
			label: "Question"
		},
		"questions.$.id":{
			type: Number,
			autoform:{
				type: "hidden",
			},
			optional: true,
		},
		"questions.$.question":{
			type: String,
			autoform:{
				rows: 3,
			},
			label: "Question text"
		},
		"questions.$.a":{
			type:String,
			label: "Option A",
		},
		"questions.$.b":{
			type:String,
			label:"Option B",
		},
		"questions.$.c":{
			type: String,
			optional: true,
			label: "Option C"
		},
		"questions.$.d":{
			type: String,
			optional: true,
			label: "Option D"
		},
		"questions.$.answer":{
			type: String,
			label: "Correct answer"
		},
	answers:{
		type: Array,
		autoform:{
			type: "hidden"
		},
		optional: true,
	},
		"answers.$":Object,
		"answers.$.id":Number,
		"answers.$.answer":{
			type: String,
		},
	createdBy:{
		type:String,
		autoValue:function(){if(this.isInsert){return this.userId}},
		autoform:{
			type:"hidden",
		},
		optional:true,
	},
}, {tracker: Tracker});
g.Exams.attachSchema(g.Schemas.Exam);

g.Schemas.StAnswer = new SimpleSchema({
	examId:{
		type: String,
	},
	studentId:{
		type: String,
		autoValue: function(){
			if(this.isInsert){
				return this.userId;
			}
		},
	},
	questionsCount:{
		type:Number
	},
	answeredCount:{
		type:Number,
		optional:true,
	},
	unanswered:{
		type:Number,
		optional:true,
	},
	totalScore:{
		type: Number,
		optional: true,
	},
	attempt:{
		type:Number,
		optional:true,
		autoValue:function(){
			return 1;
		},
	},
	answers:{
		type: Array,
		optional:true,
	},
		"answers.$":{
			type: Object,
		},
		"answers.$.id":{
			type: Number,
		},
		"answers.$.selected":{
			type: String,
		},
		"answers.$.mark":{
			type: String,
			allowedValues: ["correct", "wrong"],
		},
	submittedAt:{
		type:Date,
		autoValue:function(){
			if(this.isUpsert || this.isInsert){
				return new Date();
			};
		},
	}
});

g.StAnswers.attachSchema(g.Schemas.StAnswer);