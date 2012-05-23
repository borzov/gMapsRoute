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
		var defaults = {
			contRoute:		'#showroute',
			latitude:		0,
			longitude:		0,
			zoom:			16,
			markerTitle:	'Title',
			markerText:		'Text...'
		}

		// Build main options before element iteration
		var options = $.extend(defaults, options);
    	
		// Iterate through each element
		this.each(function() {
			// Notice the ordering of latitude and longitude
			home = new google.maps.LatLng(options.latitude, options.longitude);
			
			// Creates a new instance of a DirectionsService that sends directions queries to Google servers
			service = new google.maps.DirectionsService();
			
			// Creates a new map inside of the given HTML container, which is typically a DIV element
			map = new google.maps.Map(this, {
				zoom: 				options.zoom,
				center: 			home,
				mapTypeId: 			google.maps.MapTypeId.HYBRID,
				streetViewControl:	false,
				scrollwheel:		true
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
				title: options.markerTitle
			});

			// Show InfoWindow()
			var openWindow = function (marker, text) {
				popup.setContent(text);
				popup.open(map, marker);
			}
			
			// Set event at marker click
			google.maps.event.addListener(marker, 'click', function() {
				openWindow(marker, options.markerText);
			});
			
			// Show InfoWindow() on init
			openWindow(marker, options.markerText);
			
			// Is browser support HTML 5 Geolocation API?
			if (navigator.geolocation) {
				showroute = $('#showroute').css('display', 'inline-block');
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
						setStatus('Маршрут готов', function() {
							$(showroute).addClass('hide');
						});
					} else {
						setStatus('Невозможно проложить маршрут', function() {
							$(showroute).html('Проложить маршрут').removeClass('disabled');
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