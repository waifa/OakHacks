"use strict";
const log = console.log

var clinics = []
var tableDiv = "body"
var postalCode
var click = false;
var sliderValue = 50;


function clinicFind(){

    const self = {
        
        addSearchBar: (selector,placeholder)=>{
            var searchbar = "<input type='text' id='searchInput' placeholder='"+placeholder+"' name='search'>" +
                            "<button class='searchButton' type='submit' onclick='clinicFind().sortClinics()'><img width='10px' height='10px' src='images/searchIcon.png'></button>"
            $(selector).append(searchbar)
            // slider is not my work and is borrowed straight from w3schools
            var slider  = '<input type="range" min="1" max="100" value="50" class="slider" id="myRange"><p>Search Within: <span id="demo"></span> km</p>'
            $(selector).append(slider)
            var slider = document.getElementById("myRange");
            var output = document.getElementById("demo");
            output.innerHTML = slider.value;
            slider.oninput = function() {
                output.innerHTML = this.value;
                sliderValue = this.value
            }
        },


        addClinic: (clinicName,location,postalCode) =>{
            var clinic ={
                name: clinicName,
                location: location,
                postalCode: postalCode,
                distance: 0
            }
            clinics.push(clinic)
        },
        

        sortClinics: ()=>{
            if (!click){
            click = true
            async function getLatLng(){
                let notValid = false;
                let lat
                let lng
                postalCode = $("#searchInput").val()
                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + postalCode + "&key=AIzaSyBK3xl-Ka-_jpix6-mELuFnyKVRHPbMxFQ"
                let response = await fetch(url)
                let data = await response.json()
                if(data.results[0]){
                    lat = data.results[0].geometry.location.lat
                    lng = data.results[0].geometry.location.lng
                }else{
                    notValid = true;
                    alert("Not a Valid Postal Code")
                }
                if (!notValid){
                let lat2
                let lng2
                let url2
                for(var i = 0; i<clinics.length; i++){
                    url2 = "https://maps.googleapis.com/maps/api/geocode/json?address=" + clinics[i].postalCode + "&key=AIzaSyBK3xl-Ka-_jpix6-mELuFnyKVRHPbMxFQ"
                    let response2 = await fetch(url2)
                    let data2 = await response2.json()
                    if(data2.results[0]){
                        lat2 = data2.results[0].geometry.location.lat
                        lng2 = data2.results[0].geometry.location.lng
                    }else{
                        alert("Not a Valid Postal Code")
                    }
                    clinics[i].distance = self.distance(lat, lng, lat2, lng2, "K")
                }
                clinics.sort(function(clinic, otherClinic){
                    if(clinic.distance > otherClinic.distance){
                        return 1
                    }else if (clinic.distance < otherClinic.distance){
                        return -1
                    }
                    return 0
                })
                for(var i = 0; i<clinics.length; i++){
                    if (clinics[i].distance > sliderValue){
                        clinics.splice(i)
                    }
                }

                self.createTable(tableDiv)
            }
        }
                getLatLng()
            }
        },

        setDivForTable: (div)=>{
            tableDiv = div
        },

        createTable: (selector)=>{
            if (clinics.length>0){
                var table ="<table><tr><th><h3>Clinic</h3></th><th><h3>Location</h3></th><th><h3>Distance From You</h3></th><th><h3>Directions</h3></th></tr>"
                for(var i = 0; i<clinics.length; i++){
                    var link = "onclick=\"window.open('https://www.google.com/maps/search/"+clinics[i].location+"');\""
                    table = table + "<tr> <td><b>" +clinics[i].name+ "</b></td>" + 
                    "<td>"+clinics[i].location+"</td><td>"+ Math.round(clinics[i].distance * 10) / 10 +" Km</td>" +
                    "<td><button class='directionButton'" +  link + ">Directions</button></td></tr>"
                }
                table = table + "</table>"
                $(selector).append("<h2>Clinics Close to You:</h2>").hide().show(300)
                $(selector).append(table).hide().show(300)
                var searchAgain = "<button class='directionButton' onclick='window.location.reload()'>Search Again</button>"
                $(selector).append(searchAgain).hide().show(300)
                $("#round-container").hide(300)
            }else{
                var error = "<h2>Sorry, no clinics were found with your search criteria :("
                $(selector).append(error).hide().show(300)
                var searchAgain = "<button class='directionButton' onclick='window.location.reload()'>Search Again</button>"
                $(selector).append(searchAgain).hide().show(300)
                $("#round-container").hide(300)
            }
            
        },

        //distance function from https://www.geodatasource.com/developers/javascript
        distance: (lat1, lon1, lat2, lon2, unit)=>{
            if ((lat1 == lat2) && (lon1 == lon2)) {
                return 0;
            }
            else {
                var radlat1 = Math.PI * lat1/180;
                var radlat2 = Math.PI * lat2/180;
                var theta = lon1-lon2;
                var radtheta = Math.PI * theta/180;
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                if (dist > 1) {
                    dist = 1;
                }
                dist = Math.acos(dist);
                dist = dist * 180/Math.PI;
                dist = dist * 60 * 1.1515;
                if (unit=="K") { dist = dist * 1.609344 }
                if (unit=="N") { dist = dist * 0.8684 }
                return dist;
            }
        }


    }


    return self
}
