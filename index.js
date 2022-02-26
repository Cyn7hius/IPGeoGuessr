let targetPosition = { lat: 0, lng: 0 };
let map = undefined;
let guessMarker = undefined;

// starts loading of map
function init() {
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    else
        initMap({ lat: 0, lng: 0 });

    initInfoWindow();
    setInfoWindowPos();
}

// success callback for geolocator
function geoSuccess(position) {
    initMap({ lat: position.coords.latitude, lng: position.coords.longitude });
}

// error callback for geolocator
function geoError(err) {
    console.error(err);
    initMap({ lat: 0, lng: 0 });
}

// loads map div with google maps
function initMap(position) {
    map = new google.maps.Map(document.querySelector("#map"), {
        zoom: 3,
        center: position,
        streetViewControl: false,
    });

    // place a guess marker on map click
    google.maps.event.addListener(map, "click", (e) => placeMarker(e));
}

// adds the guess marker onto the map
function placeMarker(e) {
    // clears previous marker if exists
    if (guessMarker != undefined)
        guessMarker.setMap(undefined);

    // puts new guess marker on the map
    guessMarker = new google.maps.Marker({
        position: e.latLng,
        map: map
    });

    var lat = guessMarker.getPosition().lat();
    var lng = guessMarker.getPosition().lng();

    console.log(lat);
    console.log(lng);



    // const userAction = async () => {
    //     const response = await fetch('https://api.positionstack.com/v1/reverse', {
    //         access_key: '9950b9dcf36ee5b4b546ae68d2534c2e',
    //         query: lat, lng,
    //         output: 'xml',
    //         limit: 1
    //     });
    //     const myJson = await response.json(); //extract JSON from the http response
    //     console.log(myJson);
    // }

    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    postData('https://api.positionstack.com/v1/reverse', {
        access_key: 'YOUR_ACCESS_KEY',
        query: '51.507822,-0.076702',
        output: 'xml',
        limit: 1
    })
        .then(data => {
            console.log(data); // JSON data parsed by `data.json()` call
        });

    // const userAction = async () => {
    //     const response = await fetch('https://api.positionstack.com/v1/reverse', data = {
    //         access_key: 'YOUR_ACCESS_KEY',
    //         query: '51.507822,-0.076702',
    //         output: 'xml',
    //         limit: 1
    //     }, {
    //         method: 'POST',
    //         body: myBody, // string or object
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     const myJson = await response.json(); //extract JSON from the http response
    //     // do something with myJson
    // }


    guessMarker.setMap(map);
}

// populates info window with values
function initInfoWindow() {
    let ip = generatePublicIP();
    document.querySelector("#ipValue").innerText = ip;

    let url = `https://api.ipgeolocation.io/ipgeo?ip=${ip}&apiKey=4380280dd62a46dab4914573d171bbaa`;
    fetch(url)
        .then(res => res.json())
        .then((data) => {
            console.log(data);

            document.querySelector("#hintCurrency").innerText = data.currency.code;
            document.querySelector("#hintContinent").innerText = data.continent_name;
            document.querySelector("#hintISP").innerText = data.isp;

            targetPosition.lat = parseFloat(data.latitude);
            targetPosition.lng = parseFloat(data.longitude);
        })
        .catch(error => console.error);
}

// sets info window to bottom left of map
function setInfoWindowPos() {
    let infoWindow = document.querySelector("#infoWindow"),
        map = document.querySelector("#map");

    infoWindow.style.left = map.offsetLeft + 5;
    infoWindow.style.top = map.offsetTop + map.clientHeight - infoWindow.clientHeight - 3;
}

// handles guessing location
document.querySelector("#btnGuess").onclick = () => {
    if (guessMarker == undefined) {
        alert("No marker has been placed yet!");
        return;
    }

    let guessPosition = { lat: guessMarker.position.lat(), lng: guessMarker.position.lng() };

    let targetMarker = new google.maps.Marker({
        position: targetPosition,
        map: map,
        icon: "https://i.imgur.com/TjOKoeA.png"
    });

    targetMarker.setMap(map);

    let line = new google.maps.Polyline({
        path: [guessPosition, targetPosition],
        strokeOpacity: 0,
        icons: [{
            icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                scale: 2
            },
            offset: "1",
            repeat: "10px"
        }]
    })

    line.setMap(map);

    let distance = calculateDistance(guessPosition, targetPosition);
    alert(`Distance from actual location is ${distance} km`);
};

// resets info window position on resize
window.addEventListener("resize", setInfoWindowPos);