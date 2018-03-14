// get user input (city name)
// on click "search"

// get user input (date)
// datepicker or simple user entry

// MAP

// get user input (lodging name/address)
// on click map info window
// three options: add to lodging / add to activities / add to meals

// display user inputs
// three divs: info / activities / meals - added to html according to user differentiation
// info div:
// lodging name & address & $ / date
// cost: average of $ ratings from Yelp that updates as items are added (assign values 1-4 to the dollar signs, get average)
// maintain this info so user can then pick a new day to plan
// display new user inputs, same as above
// auto fill hotel info

// ability to remove individual items
// button [X] - on click, remove div
// update avg $

// totals div
// avg $ for lodging / meals / activities & total avg

// text to accompany cost averages (just for fun)


$(document).ready(function () {
  var map, infoWindow;

  function initMap() {
    map = new google.maps.Map(document.getElementById('responsive-gmap'), {
      center: {
        lat: 33.645076,
        lng: -117.834766
      },
      zoom: 12
    });


    infoWindow = new google.maps.InfoWindow;
    // how to handle errors in geolocations
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);

      $('#responsive-gmap').html('<h2>Please allow geolocation</h2>')

    }
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        infoWindow.setPosition(pos);
        infoWindow.setContent('You are here!!');
        infoWindow.open(map);
        map.setCenter(pos);
        map.setZoom(15)
      }, function () {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  var geocoder = new google.maps.Geocoder();

  function geocodeAddress(geocoder, resultsMap) {
    var address = $('#location').val()
    geocoder.geocode({
      'address': address
    }, function (results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location,
          icon: 'assets/img/blue-dot-sm.png'
        });
        map.setZoom(14)

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }



  function makeMarker(eventFromAPI, index) {
    // get lat and lng from event venues locaiton and assign to local vars
    var venueLatLng = {
      lat: Number(eventFromAPI.venue.latitude),
      lng: Number(eventFromAPI.venue.longitude)
    }
    var m = new google.maps.Marker({
      position: venueLatLng,
      map: map,
      venueIdFromAPI: eventFromAPI.venue_id
    })
    var imgSrc = eventFromAPI.logo.original.url;
    var first100Chars = eventFromAPI.description.text;
    first100Chars = first100Chars.substr(0, first100Chars.lastIndexOf(' ', 250)) + '...';

    var addressFromAPI = eventFromAPI.venue.address.localized_multi_line_address_display
    console.log('addressFromAPI ========', addressFromAPI)
    var infoWindowContent = '<h6 class="eventTitle">' + eventFromAPI.name.text + '</h6>' +
      '<img  class="eventImg-thumb" src="' + imgSrc + '">' +
      '<p>' +
      '<a target="_blank" href="' + eventFromAPI.url + '" role="button" class="btn btn-secondary btn-sm btn-visit">Visit Event Page</a>' +
      '<a data-addr="' + addressFromAPI+'" data-descr="' + first100Chars + '" type="button" class="btn btn-primary  btn-sm btn-addToQue">Add </a>' +
      '</p>';
    // create infowindow for marker clicked
    var infowindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });
    // trying to figure out how to close any open infowindows except the one clicked
    // infowindow.checkIfOpen = function () {
    //   console.log('$(this) inside infowindow.checkIfOpen ===', $(this))
    //   var map = this.getMap();
    //   return (map !== null && typeof map !== "undefined");
    // };
    m.addListener('click', function () {
      console.log('event attached to maker ===========================', event)
      infowindow.open(map, m);
    });
    return m
  }

  function plotToGMap(obj) {
    var events = obj.events
    // loop through each event from city searched
    for (var i = 0; i < events.length; i++) {
      var eventBriteMarker = makeMarker(events[i], i)
      eventBriteMarker.setMap(map);
    }
  }

  function getEvents(city, miles, start, end) {
    // ------------------------------- EVENT BRITE API ----------------------- //
    var token = 'DCPCQE6ZICHZYLNHXZNI'
    var eventBriteEndPoint = 'https://www.eventbriteapi.com/v3/events/search/'
    var query = '?location.address=' + city + '&location.within=' + miles + 'mi&start_date.range_start=' + start + '&start_date.range_end=' + end + '&expand=venue&token=' + token
    $.ajax({
      'url': eventBriteEndPoint + query
    }).done(function (results) {
      console.log(results)
      var searchResults = JSON.stringify(results)
      localStorage.setItem('searchResults', searchResults)
      plotToGMap(results)
    })

  }






  // init date picker ui from jquery ui
  $("#startdate").datepicker({
    format: 'yyyy-mm-dd'
  })
  $("#enddate").datepicker({
    format: 'yyyy-mm-dd'
  })
  // attaching click event to submission button
  $('#submitForm').on('click', function (e) {
    //select the startdate element and initialize datepicker function
    e.preventDefault()
    console.log('submitting form')
    var startUtcDate = moment.utc($('#startdate').datepicker('getDate')).format()
    console.log('startUtcDate ==== \n', startUtcDate)
    var endUtcDate = moment.utc($('#enddate').datepicker('getDate')).format()
    console.log('endUtcDate ====== \n', endUtcDate)
    var location = $('#location').val()
    console.log('location =====', location)
    var radius = $('#radius').val()
    console.log('radius =====', radius)
    getEvents(location, radius, startUtcDate, endUtcDate)
    geocodeAddress(geocoder, map)
  });




  function createDivForQue(imgSrc, title, d, a) {
    // function buildAddress(arrayFromApi) {
    //   return '<p>' + text + '</p>'
    // }
    // var address = '';


    // if (d.length === 0) {
    //   address = a
    //   // for (let i = 0; i < d.length; i++) {
    //   //   var addressLine = buildAddress(d[i]);
    //   // }
    // }


    return '<div class="row">' +
      '<div class="col-sm-12 col-md-8" style="background: url(' + imgSrc + '); background-repeat: no-repeat;background-size: cover;background-position: center;min-height:460px;"></div>' +
      '<div class="col-sm-12 col-md-4" id="right">' +
      ' <h4 class="eventName">' + title + '</h4>' +
      '<p class="organizer">by Organizer</p>' +
      '<p class="dateTime">Date and Time</p>' +
      '<p class="location">' + a+'</p>' +
      '<p class="cost">$Cost</p>' +
      '<p class="description">' + d + '</p>'+
    '<button type="button" class="btn btn-danger">Remove</button>' +
    '</div>' +
    '</div>' +
    '<hr class="app-hr">'

  }


  // attach click handles for all event event buttons
  $(document).on('click', '.btn-addToQue', function (event) {
    event.preventDefault()
    var containerDiv = $(this).parent().parent();
    var infoWindowImg = containerDiv.find('.eventImg-thumb').attr('src'),
      eventName = containerDiv.find('.eventTitle').text(),
      description = $(this).attr('data-descr'),
      addressFromInfoWindow = $(this).attr('data-addr')
    console.log('addressFromInfoWindow =========== ', addressFromInfoWindow)

    $('#events-que').append(createDivForQue(infoWindowImg, eventName, description, addressFromInfoWindow))

  });



  // load google maps and plot geolocation of enduser's device (if available)
  initMap()
});