
// Define and create the reactive search
var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: false
};
var fields = ['name', 'description'];

CheckinEventsSearch = new SearchSource('eventsSearch', fields, options);

var getEventsData = function() {
  return CheckinEventsSearch.getData({
    // transform: function(matchText, regExp) {
    //   return matchText.replace(regExp, "<span style='color:red'>$&</span>");
    // },
    sort: {eventDate: 1}
  });
};
// -----------------------------------------------------------------

Template.checkIntoEvent.created = function () {
  gmaps.initialize();
};

Template.checkIntoEvent.rendered = function() {
  
  // Populate the list on load
  CheckinEventsSearch.search('');

  // Session.set('longitude', null);
  // Session.set('latitude', null);

  //using pathFor, you can only pass in query strings (i.e. not a true null)
  //this means that we have to convert the null to a real null here
  // if(this.data === "null") {
  //   this.data = null;
  // }

  // if(this.data) {
  //   $('#eventSelector').val(this.data);
  //   Session.set('eventId', this.data);
  // } else {
  //   Session.set('eventId', null);
  // }
};

Template.checkIntoEvent.helpers({
  
  'getEvents': function() {
    return getEventsData();
  },

  'getTime': function() {
    
  }

  

  // 'geolocationSuccessful': function() {
  //   return Session.get('longitude') && Session.get('eventId');
  // },
  // //TODO: make sure this is actually only active events
  // 'currentEvents': function() {
  //   return Events.currentEvents();
  // },
  // //TODO: have a graceful "please wait" screen while geolocating
  // 'eventSelected': function() {
  //   return Session.get('eventId');
  // }
});

Template.checkIntoEvent.events({

  // Automatically populates the search list on keyup
  'keyup #eventSearchBox': _.throttle(function(e) {
    CheckinEventsSearch.search($('#eventSearchBox').val().trim());
  }, 200),


  //--------------
  'change #eventSelector': function(e) {
    e.preventDefault();
    Session.set('eventId', $('#eventSelector option:selected').val());
  },
  'click #checkInByPhoto': function(e) {
    e.preventDefault();

    Router.go('takePicture', {_id: Session.get('eventId')});
  },
  'click #cancel': function(e) {
    Session.set('eventId', null);
    Session.set('longitude', null);
    Session.set('latitude', null);
  },
  'click #submit': function(e) {
    e.preventDefault();

    var attributes = {
      userId: Meteor.userId(),
      eventId: Session.get('eventId'),
      userLong: Session.get('longitude'),
      userLat: Session.get('latitude'),
      hoursSpent: parseInt($('#hours').val(),10),
      minutesSpent: parseInt($('#minutes').val(),10),
    };

    Meteor.call('geolocateUser', attributes,
      function(error, result) {
        if(error) {
          addErrorMessage(error.reason);
          Session.set('longitude', null);
          Session.set('latitude', null);
          Session.set('eventId', null);
        } else {
          addSuccessMessage(result);
          Router.go('checkPoints');
        }

    });
  }         
});
