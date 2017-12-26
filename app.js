
var map;
var image;
var geocoder;
var numChild = 0;
var allLoc = [];
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 24.397, lng: 10.644},
    	zoom: 2
    });

	map.setOptions({minZoom: 2, maxZoom: 15})

	image = {
  		url: '/Users/amychen/Desktop/side_proj/Travel_Maps/marker.png',
  		scaledSize: new google.maps.Size(20, 32),
  		origin: new google.maps.Point(0,0),
  		anchor: new google.maps.Point(12,20)
	}
	geocoder = new google.maps.Geocoder();

	//adding marker signal
		document.getElementById('addbutton').addEventListener('click', function(){
  		geocoding(geocoder, map);
  		$('#address').val('');
		});

	$('#address').keyup(function(e){
		if(e.which == 13){
			geocoding(geocoder, map);
			$('#address').val('');
		}
	});

	//removing marker signal
  	document.getElementById('rmvbutton').addEventListener('click', function(){
  		var a = document.getElementById('rmvaddress').value;
  		removing(a);
  		$('#rmvaddress').val('');
  	});

	$('#rmvaddress').keyup(function(e){
		if(e.which == 13){
			var a = document.getElementById('rmvaddress').value;
			removing(a);
			$('#rmvaddress').val('');
		}
	});
}

function addMarker(snapshot){
	var all = snapshot.val();
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(all.lat, all.lng),
		icon: image,
		map: map,
		title: snapshot.key
	})
	allLoc.push(marker);
	numChild += 1;

	$('#markerNum').text("You have " + numChild + " markers");
}	

function rmvMarker(snapshot){
	var idx;
	for (var i = 0; i < numChild; i++){
		if (allLoc[i].title == snapshot.key){
			idx = i;
			break;
		} 
	}
	if (idx != null){
		allLoc[idx].setMap(null);
	}
	//allLoc[].setMap(null);

	numChild -= 1;
	$('#markerNum').text("You have " + numChild + " markers");
}

function upperCasing(word){
	//capitalize first letter of each word
	var title = word.toString().split(' ');
	for (var i = 0; i < title.length; i++){
		title[i] = title[i].charAt(0).toUpperCase() + title[i].slice(1);
	}
	title = title.join(' ');
		return title;
}

function geocoding(geocoder, mappers){
	$('#addError').text("");
	var address = document.getElementById('address').value;
	geocoder.geocode({'address': address}, function(results, status){
		var n = upperCasing(address);
		if (status === "OK"){
			addDataMap(n, results[0].geometry.location.lat(), results[0].geometry.location.lng());
		} else {
			$('#addError').text("DOES NOT EXIST");
		}
	});
}

function removing(name){
	var uName = upperCasing(name);
	var found = false;
	myDataRef.on('value', function(snapshot){
		for (var i in snapshot.val()){
			if (i == uName){
				myDataRef.child(i).remove();
				found = true;
				break;
			}
		}
		if (!found)	$('#rmvError').text("Marker did not exist on map");
		else $('#rmvError').text("");
	});
}

///FIREBASE CODE
var configr = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    //remember to change settings for authentication****
    databaseURL: config.databaseURL,
    projectId: config.projectId
};

firebase.initializeApp(configr);
var myDataRef = firebase.database().ref();

function addDataMap(name, lati, longi){
	myDataRef.child(name).set({
		lat: lati,
		lng: longi
	})
}

myDataRef.on('child_added', function(snapshot){
	addMarker(snapshot);
});

myDataRef.on('child_removed', function(snapshot){
	rmvMarker(snapshot);
});
