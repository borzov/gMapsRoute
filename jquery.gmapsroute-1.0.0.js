/**
 * jQuery gMapsRoute
 *
 * @url		http://maxborzov.com/gmapsroute/
 * @author	Maxim Borzov <max.borzov@gmail.com>
 * @version	1.0.0
 */
(function($) {
	
	// Main plugin function
	$.fn.gMapsRoute = function(options) {

		// Default settings
		var settings = {
			// Route button (also displays status after click)
			idRoute:	'#showroute',
			// Show balloon on load?
			showPopup:	true,
			// Google Maps settings — https://developers.google.com/maps/documentation/javascript/reference#MapOptions
			map: {
				// Default point
				coords: {
					lat:		0,
					lon:		0,
				},
				typeControl:	true,
				type:			google.maps.MapTypeId.HYBRID,
				scroll:			true,
				zoom:			15,
				zoomControl:	true
			},
			// Text labels by default
			text: {
				// Marker texts
				markerTitle:	'',
				markerText: 	'',
				// Rout button texts
				routeMake:		'Make a route',
				routeReady:		'The route is ready',
				routeError:		'Unable to make a route'
				
			}
		}

		// Iterate through each element
		return this.each(function() {
		
			// Merge settings if options exist before element iteration
			if (options) {
				$.extend(true, settings, options);
			}
		
			// Notice the ordering of latitude and longitude
			home = new google.maps.LatLng(settings.map.coords.lat, settings.map.coords.lon);
			
			// Creates a new instance of a DirectionsService that sends directions queries to Google servers
			service = new google.maps.DirectionsService();
			
			// Creates a new map inside of the given HTML container, which is typically a DIV element
			map = new google.maps.Map(this, {
				center: home,
				mapTypeControl: settings.map.typeControl,
				mapTypeId: settings.map.type,
				panControl: false,
				rotateControl: false,
				streetViewControl: false,
				scaleControl: false,
				scrollwheel: settings.map.scroll,
				zoom: settings.map.zoom,
				zoomControl: settings.map.zoomControl
			});
			
			// Creates the renderer with the given options
			direction = new google.maps.DirectionsRenderer({
				map: map
			});
			
			// Creates the InfoWindows who displays content in a floating window above the map
			popup = new google.maps.InfoWindow();
			
			// Creates identify locations on the map
			marker = new google.maps.Marker({
				position: home,
				map: map,
				title: settings.text.markerTitle
			});

			// Show InfoWindow()
			var openWindow = function (marker, text) {
				popup.disableAutoPan = false;
				popup.maxWidth = 300;
				popup.setContent(text);
				popup.open(map, marker);
			}
			
			// Set event at marker click
			google.maps.event.addListener(marker, 'click', function() {
				openWindow(marker, settings.text.markerText);
			});
			
			// Show InfoWindow() on init
			if (settings.showPopup) {
				openWindow(marker, settings.text.markerText);
			}
			
			// Is browser support HTML 5 Geolocation API?
			if (navigator.geolocation) {
				showroute = $(settings.idRoute).css('display', 'inline-block');
				// Set event at route generator button
				$(showroute).bind('click', function(event) {
					event.preventDefault();
					if (!$(showroute).hasClass('disabled')) {
						$(showroute).addClass('disabled').css('display', 'inline-block');
						navigator.geolocation.getCurrentPosition(function(position) {
							showRouteService(position);
						});
					}
				});
			}
			
			// Build route
			var showRouteService = function (position) {
				var request = {
					origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
					destination: home,
					travelMode: google.maps.DirectionsTravelMode.WALKING
				};
				service.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						direction.setDirections(response);
						var route = response.routes[0].legs[0];
						for (var i = 0, length = route.steps.length; i < length; i++) {
							var marker = new google.maps.Marker({
								position: route.steps[i].start_point,
								map: map
							});
							addInstructions(marker, route.steps[i].instructions);
						}
						map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
						setStatus(settings.text.routeReady, function() {
							$(showroute).addClass('hide');
						});
					} else {
						setStatus(settings.text.routeError, function() {
							$(showroute).html(settings.text.routeMake).removeClass('disabled');
						}, 2000);
					}
				});
			}
			
			// Add route instruction to InfoWindow()
			var addInstructions = function (marker, text) {
				google.maps.event.addListener(marker, 'click', function() {
					openWindow(marker, text);
				});
			}
			
			// Change status text on route building
			var setStatus = function (text, fn) {
				$(showroute).html(text);
				setTimeout(fn, arguments[2] || 1000);
			}
			
		});
		
	}
	
})(jQuery);