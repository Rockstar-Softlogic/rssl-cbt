
g = this;

//student, payment, result, assignment, message, feedback collections

g.Exams = new Mongo.Collection('exams');
g.Ca = new Mongo.Collection('ca');
g.StAnswers = new Mongo.Collection('stanswers');
g.Feedbacks = new Mongo.Collection('feeback');
g.Settings = new Mongo.Collection('settings');
g.Temp = new Mongo.Collection('temp');
g.Schemas = {};

