/*
Ioane "Tavi" Tenari
2/18/16
HW5 - weather.js

This is the javascript file linked to weather.html.
It uses ajax to make php requests to get information about
the weather of a variety of cities. It is linked to weather.html.
*/

(function(){
	"use strict";
	
	var URL = "https://webster.cs.washington.edu/cse154/weather.php?mode=";
	var tempList = []; // just stores temperature values to associate with the slider.

	window.onload = function(){
		makeReq(URL + "cities", cityList);
		document.getElementById("search").onclick = search;
		document.getElementById("slider").onchange = slide;
		document.getElementById("temp").onclick = showTemp;
		document.getElementById("precip").onclick = showPrecip;
	};
	
	/*
	cityList() generates the list of given cities into the text box.
	This runs during window.onload.
	*/
	function cityList(){
		var cities = this.responseText.split("\n");
		for (var i = 0; i < cities.length; i++){
			var opt = document.createElement("option");
			opt.innerHTML = cities[i];
			document.getElementById("cities").appendChild(opt);
		}
		document.getElementById("citiesinput").disabled = "";
		document.getElementById("loadingnames").style.display = "none";
	}
	
	/*
	search() is called upon clicking search. It generates the weather
	content and handles the existence/visibiliity of past content/loading gifs.
	*/
	function search(){
		document.getElementById("resultsarea").style.display = "";
		clear();
		var entry = document.getElementById("citiesinput").value;
		makeReq(URL + "oneday&city=" + entry, dayData);
		makeReq(URL + "week&city=" + entry, weekData);
	}
	
	/*
	makeReq(site, func) takes a URL and an onload function as parameters.
	This reduces the redundancy of constantly writing code for XML requests.
	*/
	function makeReq(site, func){
		var request = new XMLHttpRequest();
		request.onload = func;
		request.open("GET", site, true);
		request.send();
	}
	
	/*
	clear() erases the content of a previously searched city and adjusts visibility.
	*/
	function clear(){
		document.getElementById("nodata").style.display = "none";
		var clearList = ["location", "graph", "forecast", "currentTemp"];
		for (var i = 0; i < clearList.length; i++){
			document.getElementById(clearList[i]).innerHTML = "";
		}	
		var showList = ["location", "loadinglocation", "forecast", "loadingforecast", 
						"loadinggraph", "temps", "buttons"];
		for (var i = 0; i < showList.length; i++){
			document.getElementById(showList[i]).style.display = "";
		}
		document.getElementById("slider").value = 0;
		showTemp(); //sets back to default of slider showing instead of precipitation.
	}
	
	/*
	slide(list) takes the mod-global array of temperatures as a parameter
	and associates each value on the slider with each temperature.
	*/
	function slide(list){
		var value = document.getElementById("slider").value;
		document.getElementById("currentTemp").innerHTML = tempList[(value/3)] + "&#8457";
		}
	
	/*
	precipList(list) generates the table of rain probability.
	*/
	function precip(list){
		var row = document.createElement("tr");
		for (var i = 0; i < list.length; i++){
			var prec = document.createElement("td");
			var inner = document.createElement("div");
			inner.innerHTML = list[i] + "%";
			inner.style.height = "" + list[i] + "px";
			prec.appendChild(inner);
			row.appendChild(prec);
		}
		document.getElementById("graph").appendChild(row);
	}
	
	/*
	dayData() creates all of the weather content that is gathered from the 
	second query mode.
	*/
	function dayData(){
		if(errCheck(this)){
			var data = this.responseXML;
			
			//Puts temperatures into array to add to slider.
			var temps = data.getElementsByTagName("temperature");
			for (var i = 0; i < temps.length; i++){
				tempList[i] = Math.round(parseFloat(temps[i].innerHTML));
			}
			
			//Makes an array to pass into the precip. table generator.
			var precips = data.getElementsByTagName("clouds");
			var precipList = [];
			for (var i = 0; i < precips.length; i++){
				precipList[i] = parseFloat(precips[i].getAttribute("chance"));
			}
			precip(precipList);
			
			//Adds city info and description.
			var cityname = document.createElement("p");
			cityname.className = "title";
			cityname.innerHTML = data.getElementsByTagName("name")[0].innerHTML;
			document.getElementById("location").appendChild(cityname);
			var date = document.createElement("p");
			date.innerHTML = Date();
			document.getElementById("location").appendChild(date);
			var descri = document.createElement("p");
			descri.innerHTML = data.getElementsByTagName("symbol")[0].getAttribute("description");
			document.getElementById("location").appendChild(descri);
			document.getElementById("loadinglocation").style.display = "none";
			
			document.getElementById("currentTemp").innerHTML = tempList[0] + "&#8457;";
			document.getElementById("loadinggraph").style.display = "none";
		}
	}
	
	/*
	weekData() creates all of the weather content that is gathered from the
	third query mode.
	*/
	function weekData(){
		if(errCheck(this)){
			var data = JSON.parse(this.responseText);
			
			//creates table of icons and temperatures for the week.
			var row = document.createElement("tr");
			var row2 = document.createElement("tr");
			for (var i = 0; i < data.weather.length; i++){
				var day = document.createElement("td");
				var icon = document.createElement("img");
				icon.setAttribute("src", "https://openweathermap.org/img/w/" + 
								  data.weather[i].icon + ".png");
				icon.setAttribute("alt", "icon");
				day.appendChild(icon);
				row.appendChild(day);
				var day2 = document.createElement("td");
				day2.innerHTML = Math.round(parseFloat(data.weather[i].temperature)) + "&#176;";
				row2.appendChild(day2);
			}
			document.getElementById("forecast").appendChild(row);
			document.getElementById("forecast").appendChild(row2);
			document.getElementById("loadingforecast").style.display = "none";
		}
	}
	
	/*
	errCheck(request) takes an ajax onload function and checks/handles any errors.
	*/
	function errCheck(request){
		if (request.status != 200){
			var clearList = ["location", "loadinglocation", "forecast", "loadingforecast", 
							 "loadinggraph", "temps", "buttons"];
			for (var i = 0; i < clearList.length; i++){
				document.getElementById(clearList[i]).style.display = "none";
			}
			if (request.status  == 410){
				document.getElementById("nodata").style.display = "";
			}
			else{
				document.getElementById("resultsarea").style.display = "none";
				document.getElementById("errors").innerHTML = request.status + " Error: " + 
															  request.statusText + ".";
			}
			return false;
		} else{
			return true;
		}
	}
	
	/*
	showPrecip() will show the precipitation and hide the temp slider.
	*/
	function showPrecip(){
		document.getElementById("graph").style.display = "";
		document.getElementById("temps").style.display = "none";
	}
	
	/*
	showTemp() will show the temp slider and hide the precipitation.
	*/
	function showTemp(){
		document.getElementById("graph").style.display = "none";
		document.getElementById("temps").style.display = "";
	}
})();