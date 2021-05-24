var getState = function() {
	const Http = new XMLHttpRequest();
	const url='https://cdn-api.co-vin.in/api/v2/admin/location/states';
	Http.open("GET", url);
	Http.send();

	Http.onreadystatechange = (e) => {
		var select = document.getElementById("state");
		JSON.parse(Http.responseText).states.forEach(state => {
			var opt = state;
			var el = document.createElement("option");
			el.textContent = state.state_name;
			el.value = state.state_id;
			select.appendChild(el);
		});
	}

}

var getSelectedCenters = function() {
  var result = [];
  var select = document.getElementById("centers");
  var options = select && select.options;
  var opt;
  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(parseInt(opt.value));
    }
  }
  return result;
}

var getCenters = function() {
	if(document.getElementById("state").value !== 'Select' || document.getElementById("district").value !== 'Select') {
		var today = new Date();
		var select = document.getElementById("district");
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		var yyyy = today.getFullYear();
		var date = dd + '-' + mm + '-' + yyyy;
	    const Http = new XMLHttpRequest();
		const url='https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + select.value +  '&date=' + date;
		Http.open("GET", url);
		Http.send();

		Http.onreadystatechange = (e) => {
		  var centerSelect = document.getElementById("centers");
		  while (centerSelect.firstChild) {
			centerSelect.removeChild(centerSelect.lastChild);
		  }
		  if(Http.responseText.length > 2) {
		  var availableCenters = [];
			 JSON.parse(Http.responseText).centers.forEach(center => {
				var el = document.createElement("option");
				el.textContent = center.name;
				el.value = center.center_id;
				centerSelect.appendChild(el);
			 });
		   }
		}
	}
}

var getDistrict = function() {
	var e = document.getElementById("state");
	const Http = new XMLHttpRequest();
	const url='https://cdn-api.co-vin.in/api/v2/admin/location/districts/' + e.value;
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange = (e) => {
		var select = document.getElementById("district");
		var length = select.options.length;
		for (i = length-1; i > 0; i--) {
		  select.options[i] = null;
		}
		JSON.parse(Http.responseText).districts.forEach(district => {
			var opt = district;
			var el = document.createElement("option");
			el.textContent = district.district_name;
			el.value = district.district_id;
			select.appendChild(el);
		});
	}

}
var district_id = null;
var minimum_age = null;
var selectedCenters = null;
var dose = null;
var task = null;
const callAPI = function() {
	var today = new Date();
	var select = document.getElementById("district");
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;
   const Http = new XMLHttpRequest();
	const url='https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + select.value +  '&date=' + date;
	Http.open("GET", url);
	Http.send();

	Http.onreadystatechange = (e) => {
		document.getElementById("timestampdiv").style.display = "block";
	  var timestamp = new Date();
	  var timestampdate = String(timestamp.getDate()).padStart(2, '0') + '-' + String((timestamp.getMonth() + 1)).padStart(2, '0') + '-' + timestamp.getFullYear() + ' ::: ' + String(timestamp.getHours()).padStart(2, '0') + ":" + String(timestamp.getMinutes()).padStart(2, '0') + ':' + String(timestamp.getSeconds()).padStart(2, '0');
	  document.getElementById("timestamp").innerHTML = 'Last Checked On : ' + timestampdate;
	  if(Http.responseText.length > 2) {
	  var availableCenters = [];
         JSON.parse(Http.responseText).centers.forEach(center => {
             center.sessions.forEach(session => {
                 if (session.min_age_limit === parseInt(minimum_age) && selectedCenters.includes(center.center_id) && session[dose] > 0) {
                     availableCenters.push(session[dose] + " slots available in " + center.name + ", " + center.address + " on " + session.date);
                 }
             });
         });
		 if(availableCenters.length > 0) {
		 availableCenters.forEach(r => {
			var h2=document.createElement("h2");
			h2.innerHTML = r;
			document.getElementById("result").appendChild(h2);
		});
	  const node = document.getElementById("result");
	  while (node.firstChild) {
		node.removeChild(node.lastChild);
	  }
			availableCenters.forEach(r => {
				var h2=document.createElement("h2");
				h2.innerHTML = r;
				document.getElementById("result").appendChild(h2);
			});
			playSound();
			clearInterval(task);
		 }
	  }
	}
}
   function playSound() {
          var sound = document.getElementById("audio");
          sound.play();
      }
function playTestSound() {
	var sound = document.getElementById("audio");
	if (document.querySelector('#testbutton').innerHTML === 'Play') {
          sound.play();
		  document.querySelector('#testbutton').innerHTML = 'Stop';
	} else {
		sound.pause();
		sound.currentTime = 0;
		  document.querySelector('#testbutton').innerHTML = 'Play';
	}
}
function startAPI() {
	var stateName = document.getElementById("state").value;
	var districtName = document.getElementById("district").value;
	minimum_age = document.getElementById("minage").value;
	selectedCenters = getSelectedCenters();
	if (document.getElementById("dose").value === 'First') {
		dose = 'available_capacity_dose1'
	} else if (document.getElementById("dose").value === 'Second'){
		dose = 'available_capacity_dose2'
	}
	if (stateName === 'Select' || districtName === 'Select' || minimum_age === 'Select' || dose === null || selectedCenters.length === 0) {
		alert("Please select valid input !");
	} else {
		document.querySelector('#startButton').disabled = true;
		document.querySelector('#stopButton').disabled = false;
		document.querySelector('#state').disabled = true;
		document.querySelector('#district').disabled = true;
		document.querySelector('#centers').disabled = true;
		document.querySelector('#dose').disabled = true;
		document.querySelector('#minage').disabled = true;
		document.querySelector('#testbutton').disabled = true;
		document.querySelector('#startButton').innerHTML = 'Running';
		callAPI();
		task = setInterval(callAPI, 4000);
	}
}

function stopAPI() {
	clearInterval(task);
	document.getElementById("timestampdiv").style.display = "none";
	document.querySelector('#startButton').disabled = false;
	document.querySelector('#stopButton').disabled = true;
	document.querySelector('#state').disabled = false;
	document.querySelector('#district').disabled = false;
	document.querySelector('#centers').disabled = false;
	document.querySelector('#dose').disabled = false;
	document.querySelector('#minage').disabled = false;
	document.querySelector('#testbutton').disabled = false;
	document.querySelector('#startButton').innerHTML = 'Start';
	var sound = document.getElementById("audio");
	sound.pause();
	sound.currentTime = 0;
}