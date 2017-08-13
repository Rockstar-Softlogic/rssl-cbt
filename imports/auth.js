
import "./auth.html";
import "./student/client/main.js";
import "./admin/client/main.js";

Template.header.events({
    'click #header-logout': function(e){
        e.preventDefault();
         g.logout();
    }
});


Template.stHeader.events({
    'click #header-logout': function(e){
        e.preventDefault();
        g.logout();
    }
});