var initialData = {
  filters: ["None", "Education", "Leisure", "Restaurants", "Shopping", "Transit"],
  locations: [{
      title: '仙台駅',
      location: {
        lat: 38.260132,
        lng: 140.882438
      },
      outdoors: false,
      category: "Transit",
      toggleOn: true
    },
    {
      title: '海の森水族館',
      location: {
        lat: 38.271093,
        lng: 140.980559
      },
      outdoors: false,
      category: "Education",
      toggleOn: true
    },
    {
      title: '定禅寺通り',
      location: {
        lat: 38.26623,
        lng: 140.871353
      },
      outdoors: true,
      category: "Leisure",
      toggleOn: true
    },
    {
      title: '仙台メディアテーク',
      location: {
        lat: 38.265374,
        lng: 140.865669
      },
      outdoors: false,
      category: "Education",
      toggleOn: true
    },
    {
      title: '八木山動物園',
      location: {
        lat: 38.245597,
        lng: 140.8468
      },
      outdoors: true,
      category: "Education",
      toggleOn: true
    },
    {
      title: 'メキシコ酒場 べべドール',
      location: {
        lat: 38.263398,
        lng: 140.869354
      },
      outdoors: false,
      category: "Restaurants",
      toggleOn: true
    },
    {
      title: 'クリスロード',
      location: {
        lat: 38.262104,
        lng: 140.880674
      },
      outdoors: false,
      category: "Shopping",
      toggleOn: true
    }
  ]
};


// *****************
// Global Variables
// *****************
var polygon = null;
var mapLat = 38.25759;
var mapLng = 140.8667;
var map;
var markers = [];
var placeMarkers = [];
var locationList = ko.observableArray();
locationList.push(initialData.locations);


// *****************
// Global functions
// *****************
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}


// *************
// VM functions
// *************
var ViewModel = function(data, filts) {
  var self = this;

  var weatherAPIKey = "14e85bb557e1f71276cb8d515f7c97a7";
  var weatherURL = "http://api.openweathermap.org/data/2.5/forecast?unit=metric&lat=" + mapLat + "&lon=" + mapLng + "&APPID=" + weatherAPIKey;

  // OpenWeatherMap API call and subsequent filtering of locations
  $.getJSON(weatherURL, function(data) {
    // Now use this data to update your view models,
    // and Knockout will update your UI automatically

    // Filter locationList based on the weather and the
    // locations' outdoor status. If the weather is unpleasant, change toggleOn
    // to false.
    if (data.list[0].weather[0].main !== ("Rain" || "Snow" || "Extreme")) {
      //alert(data.list[0].weather[0].main + " today. Try these indoor places!");
      console.log(data.list[0].weather[0].main);
      locationList()[0].forEach(function(locationItem) {
        if (locationItem.outdoors == true) {
          locationItem.toggleOn = false;
        }
      });
    }
  }).fail(function() {
    alert("Unable to obtain weather data. Please refresh your browser and try again.");
  });

  self.filters = ko.observableArray(filts);
  self.filter = ko.observable('');
  self.locations = ko.observableArray(data);
  self.filteredLocations = ko.computed(function() {
    this.filter = self.filter();
    if (!filter || filter == "None") {
      return self.locations();
    } else {
      return ko.utils.arrayFilter(self.locations(), function(i) {
        return i.category == filter;
      });
    }
  });

  for (var i = 0; i < self.filteredLocations().length; i++) {
    if (self.filteredLocations()[i].toggleOn == false) {
      //self.filteredLocations()[i]
      console.log(self.filteredLocations()[i]);
    }
  }

  this.currentLocation = ko.observable(locationList()[0][0]);

  this.selectLocation = function(clickedLocation) {
    self.currentLocation(clickedLocation);
    hideMarkers();

    function showSelectedMarker() {
      this.largeInfowindow = new google.maps.InfoWindow();
      this.selected = self.currentLocation();
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].title == selected.title) {
          markers[i].setMap(map);
          markers[i].setAnimation(google.maps.Animation.BOUNCE);
          populateInfoWindow(markers[i], largeInfowindow);
        }
      }
    }
    showSelectedMarker();
  };
};

// ++++++++++++++++++++++++++++++
// Google Maps API implementation
// ++++++++++++++++++++++++++++++
initMap = function() {
  // Create a styles array for the map
  this.styles = [{
      "elementType": "geometry",
      "stylers": [{
        "color": "#f5f5f5"
      }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#616161"
      }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{
        "color": "#f5f5f5"
      }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#bdbdbd"
      }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#eeeeee"
      }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#757575"
      }]
    },
    {
      "featureType": "poi.business",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{
        "color": "#087a32",
        "saturation": "20"
      }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text",
      "stylers": [{
        "visibility": "simplified"
      }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#3c423e"
      }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{
        "color": "#ffffff"
      }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#757575"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{
        "color": "#dadada"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#616161"
      }]
    },
    {
      "featureType": "road.local",
      "stylers": [{
        "visibility": "simplified"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#9e9e9e"
      }]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{
        "color": "#c894fc"
      }]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{
        "color": "#6002f7"
      }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#02d5f6"
      }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#9e9e9e"
      }]
    }
  ];

  // Constructor creates a new map - only center and zoom are required
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: mapLat,
      lng: mapLng
    },
    zoom: 13,
    styles: styles,
    mapTypeControl: true
  });

  // Autocomplete for the search-within-time entry box
  this.timeAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('search-within-time-text'));
  timeAutocomplete.bindTo('bounds', map);
  // Autocomplete for the geocoder entry box
  this.zoomAutocomplete = new google.maps.places.Autocomplete(document.getElementById('zoom-to-area-text'));
  // Bias the boundaries within the map for the zoom-to-area text
  zoomAutocomplete.bindTo('bounds', map);


  this.largeInfowindow = new google.maps.InfoWindow();

  // Add styling to markers
  this.defaultIcon = makeMarkerIcon('0725ba');
  this.highlightedIcon = makeMarkerIcon('ff9900');

  // The following group uses the location array to create an array of markers on initialize
  for (var i = 0; i < locationList()[0].length; i++) {
    // Get the position from the location array.
    this.position = locationList()[0][i].location;
    this.title = locationList()[0][i].title;
    // Create a marker per location, and put into markers array.
    this.marker = new google.maps.Marker({
      position: position,
      title: title,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Push the marker to our array of markers
    markers.push(marker);

    // Create an onclick event to open an infowindow at each marker
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    // Two event listeners -- one for mouseover, one for mouseout,
    // to change the colors back and forth
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
    marker.addListener('click', toggleBounce);
  }

  showMarkers();

  document.getElementById('show-markers').addEventListener('click', showMarkers);
  document.getElementById('hide-markers').addEventListener('click', hideMarkers);

  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });

  document.getElementById('search-within-time').addEventListener('click', function() {
    searchWithinTime();
  });

  // Get more details after selecting prediction and clicking "Go"
  document.getElementById('go-places').addEventListener('click', textSearchPlaces);
};

function toggleBounce() {
  markers.forEach(function(marker) {
    marker.setAnimation(null);
  });
  this.setAnimation(google.maps.Animation.BOUNCE);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that marker's position
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('');
    // Make sure the marker property is cleared if the infowindow is closed
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    var client_id = "FCMDAF50VKSVJDAIKBE23CYPGK3P12CFJDBEB03P0K2DYINR";
    var client_secret = "MLMJVRNV4OG2UAEDIPQ232M41T5YNOSBPCIWV23BBQZLNANJ";
    var url = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20180323&query=' + marker.title + '&v=20180323' + '&m=foursquare';

    $.getJSON(url)
      .done(function(marker) {
        // Code for handling API response
        var response = marker.response.venues[0];
        this.category = response.categories[0].shortName;
        console.log('cat' + this.category);
        this.street = response.location.formattedAddress[0];
        console.log('str' + this.street);
        this.city = response.location.formattedAddress[1];
        console.log('city' + this.city);
        this.zip = response.location.formattedAddress[2];
        console.log('zip' + this.zip);
        this.country = response.location.formattedAddress[3];
        console.log('count' + this.country);

        if (this.category !== 'undefined') {
          this.fsContent = '<h5 class="win-title">' + this.category + '</h5>';
        }
        this.fsContent += '<div>';
        this.fsContent += '<h6 class="win-subtitle"> Address: </h6>';
        if (this.street !== 'undefined') {
          this.fsContent += '<p class="win-data">' + this.street + '</p>';
        }
        if (this.city !== 'undefined') {
          this.fsContent += '<p class="win-data">' + this.city + '</p>';
        }
        if (this.zip !== 'undefined') {
          this.fsContent += '<p class="win-data">' + this.zip + '</p>';
        }
        if (this.country !== 'undefined') {
          this.fsContent += '<p class="win-data">' + this.country + '</p>';
        }
        this.fsContent += '<img src="img/powered-by-foursquare-blue.svg">';
        this.fsContent += '</div>';

        infowindow.setContent(this.htmlContent + this.fsContent);
      })
      .fail(function() {
        // Code for handling errors
        alert('Sorry Bro, no results');
      });
    this.streetViewService = new google.maps.StreetViewService();
    this.radius = 50;
    // If the status is OK, meaning the panorama was found, compute the
    // position of the streetview image, then calculate the
    // heading, get a panarama from that, and set the options
    var getStreetView = function(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        this.nearStreetViewLocation = data.location.latLng;
        this.heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        this.panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        this.panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>Not Street View Found</div>');
      }
    };
    // Use Streetview to get the closest streetview image within
    // 50 meters of the marker's loction
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the appropriate marker
    infowindow.open(map, marker);
  }
}

// This function will loop through the markers array and display them all
function showMarkers() {
  this.bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}


// Loop through the markers and hide them all
function hideMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// Take in a COLOR and then create a new marker icon with the color
function makeMarkerIcon(markerColor) {
  this.markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

// Locate the input value, then zoom to it
function zoomToArea() {
  // Initialize the geocoder
  this.geocoder = new google.maps.Geocoder();
  // Get the address or place from the input
  this.address = document.getElementById('zoom-to-area-text').value;
  // Confirm the address isn't blank
  if (address == '') {
    window.alert('You must enter an area or address.');
  } else {
    // Geocode the address/area entered to get the center, and center the map on it, then zoom in
    geocoder.geocode({
      address: address,
      componentRestrictions: {
        locality: 'New York'
      }
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(15);
      } else {
        window.alert('We could not find that location = try entering a more' +
          ' specific location.');
      }
    });
  }
}

// Take in a desired travel time, in minutes, and travel mode,
// and a location -- and only show the listings that are within that
// travel time of the location
function searchWithinTime() {
  // Initialize the distance matrix service
  this.distanceMatrixService = new google.maps.DistanceMatrixService();
  this.address = document.getElementById('search-within-time-text').value;
  // Ensure that the input isn't left blank
  if (address == '') {
    window.alert('You must enter an address.');
  } else {
    hideMarkers();
    // Calculate the duration of the routes between all of the markers and the destination address. Then, put all the origins into and origin matrix
    this.origins = [];
    for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
    }
    this.destination = address;
    this.mode = document.getElementById('mode').value;
    // Get all info for distances between the origins and destination
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert('Error was: ' + status);
      } else {
        displayMarkersWithinTime(response);
      }
    });
  }
}

// Iterate through the results, and if the distance is less than the value
// selected in the menu, display it on the map
function displayMarkersWithinTime(response) {
  var maxDuration = document.getElementById('max-duration').value;
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;
  // Parse through the results, getting the distance and duration of each.
  // Since there may be multiple origins and destinations we use a
  // nested loop. Confirm at least one result was found
  var atLeastOne = false;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === "OK") {
        // The distance is returned in feet, but the text is in miles
        var distanceText = element.distance.text;
        // The duration value is given in seconds so we convert it to minutes
        var duration = element.duration.value / 60;
        var durationText = element.duration.text;
        if (duration <= maxDuration) {
          // The origin[i] should equal the markers[i]
          markers[i].setMap(map);
          atLeastOne = true;
          // Create a mini infowindow displaying the distance and
          // duration
          var infowindow = new google.maps.InfoWindow({
            content: durationText + ' away,' + distanceText +
              '<div><input type=\"button\" value=\"View Route\" onclick=' +
              '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
          });
          infowindow.open(map, markers[i]);
          // Close the mini window if the usre clicks the
          // marker and opens the big infowindow
          markers[i].infowindow = infowindow;
          google.maps.event.addListener(markers[i], 'click', function() {
            this.infowindow.close();
          });
        }
      }
    }
  }
  if (!atLeastOne) {
    window.alert('We could not find any locations within the specified distance. Try a larger search radius.');
  }
}

// Display the route to the marker on the map when the user
// clicks the "Show Route" button on the marker
function displayDirections(origin) {
  hideMarkers(placeMarkers);
  this.directionsService = new google.maps.DirectionsService();
  // Get the destination address from the user-entered value
  this.destinationAddress = document.getElementById('search-within-time-text').value;
  // Get the mode of transit from the user-entered value
  this.mode = document.getElementById('mode').value;
  directionsService.route({
    // The origin is the passed in marker's position
    origin: origin,
    // The desitination is the user-entered address
    destination: destinationAddress,
    travelMode: google.maps.TravelMode[mode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        draggable: true,
        polylineOptions: {
          strokeColor: 'green'
        }
      });
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

// Conduct a search of the surrounding area using the provided query string
// which is triggered by selecting a recommendation
function searchBoxPlaces(searchBox) {
  hideMarkers(placeMarkers);
  this.places = searchBox.getPlaces();
  if (places.length == 0) {
    window.alert('We did not find any places matching that search!');
  } else {
    // For each place, get the icon, name and location
    createMarkersForPlaces(places);
  }
}

// Conduct a search of the surrounding area using the provided query string
// which is triggered by hitting the "Go" button
function textSearchPlaces() {
  this.bounds = map.getBounds();
  hideMarkers(placeMarkers);
  this.placesService = new google.maps.places.PlacesService(map);
  this.placesService.textSearch({
    query: document.getElementById('places-search').value,
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

// This function creates markers for each place found in either places search
function createMarkersForPlaces(places) {
  this.bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    this.place = places[i];
    this.icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place
    this.marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infowindow to be used with the place details information
    // so that only one is open at once
    this.placeInfoWindow = new google.maps.InfoWindow();

    this.marker.addListener('click', toggleBounce);
    // If a marker is clicked, do a place details search on it in the next function
    this.marker.addListener('click', function() {
      if (placeInfoWindow.marker == self) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

// Search for place details. This is only triggered on a single marker
// when that marker's details button is clicked
function getPlacesDetails(marker, infowindow) {
  this.service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infowindow so it isn't created again
      infowindow.marker = marker;
      var innerHTML = '<div class="details">';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
          place.opening_hours.weekday_text[0] + '<br>' +
          place.opening_hours.weekday_text[1] + '<br>' +
          place.opening_hours.weekday_text[2] + '<br>' +
          place.opening_hours.weekday_text[3] + '<br>' +
          place.opening_hours.weekday_text[4] + '<br>' +
          place.opening_hours.weekday_text[5] + '<br>' +
          place.opening_hours.weekday_text[6];
      }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl({
          maxHeight: 100,
          maxWidth: 200
        }) + '">';
      }
      innerHTML += '</div>';
      infowindow.setContent(innerHTML);
      infowindow.open(map, marker);
      // Ensure the marker property is cleared if the infowindow is closed
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  });
}

ko.applyBindings(new ViewModel(locationList()[0], initialData.filters));
