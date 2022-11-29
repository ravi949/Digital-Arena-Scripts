
function geoCodedGoogleMap(request, response) {
	var googleMapScript = initialize + gmCodeAddress;
	var form = nlapiCreateForm('Google Maps Lookup', true);
	var scriptLink = '<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBc7ZuXTnO_bQmwl0CUTxhlq-Gi9qVe-bs&sensor=false"></script>';
	var style = '<style type="text/css">#map-canvas { height: 400px; width: 400px; margin: 10px 0 10px 10px }\n.lookup {width: 380px; margin: 10px}\n.lookup p { border-top: 2px solid #FF0000; padding: 10px 0;}\n.bgbar{display:none;}</style>';
	
	//create HTML
	var html = scriptLink;
	html = html + '<script type="text/javascript">';
	html = html + 'var geocoder;\n var map;';
	html = html + googleMapScript;
	html = html + '</script>';
	html = html + style;
	html = html + '</head>';
	html = html + '<body>';
	html = html + '<script>google.maps.event.addDomListener(window, \'load\', initialize);</script>';
	html = html + '<div class="lookup">\n';
	html = html + '<h2>Google Maps Lookup</h2>\n';
	html = html + '<p>Type in the address that you would like to find on the Map.</p>\n';
	html = html + '<input id="address" type="textbox" value="Carlsbad, CA">\n';
	html = html + '<input type="button" value="Find" onclick="gmCodeAddress()">\n';
	html = html + '</div>\n';
	html = html + '<div id="map-canvas"/></div>';
	
	//nlapiLogExecution('debug', 'the script loaded the html code', html);
	
	var fld = form.addField('custpage_mapfield', 'inlinehtml');
	
	fld.setDefaultValue(html);
	response.writePage(form);
}

/**
 * GM function, sets up the google maps object
 * 
 * @returns
 */
function initialize() {
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(33.1412, -117.3205);
	var mapOptions = {
		zoom : 12,
		center : latlng
	}
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}
/**
 * GM function looks up the address to pinpoint the location on the map.
 * 
 * @returns
 */
function gmCodeAddress() {
	var address = document.getElementById("address").value;
	geocoder.geocode({
		'address' : address
	}, function(results, status) {
		if(status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map : map,
				position : results[0].geometry.location
			});
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}
