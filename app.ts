const $ = (id: string): HTMLElement => {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error("Not an instance of HTMLElement.");
    }
    return element;
};

import L from "leaflet";

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (str, newStr) {

        // If a regex pattern
        if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
            return this.replace(str, newStr.toString());
        }
        // If a string
        return this.replace(new RegExp(str, 'g'), newStr.toString());

    };
}

const locate = $("locate");
const input = $("location");
if (!(input instanceof HTMLInputElement)) {
    throw new Error("Not an instance of HTMLInputElement.");
}
const crosshairsIcon = $("crosshairs-icon")
const breweryList = $("brewery-list");
const formattedLocation = $("formatted-location");

crosshairsIcon.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            findBreweries(`${position.coords.latitude} ${position.coords.longitude}`);
        }, (err) => throwError(err));
    }
});

locate.addEventListener("click", (e) => {
    e.preventDefault();
    findBreweries(input.value);
})

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            findBreweries(`${position.coords.latitude} ${position.coords.longitude}`);
        }, (err) => throwError(err));
    }
})

let map: L.Map;

const findBreweriesLatLong = (lat: number, long: number) => {
    console.log("ok!!");
    fetch(`https://api.openbrewerydb.org/breweries?by_dist=${lat},${long}&per_page=10`)
        .then((res) => res.json())
        .then((data) => {
            updateElement(data);
        })
        .catch((err) => {
            console.log(err);
        })
}

const findBreweries = (location: string) => {
    console.log("ok!!");
    fetch(`https://geocode.maps.co/search?q=${location.replaceAll(' ', '+')}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            input.value = data[0].display_name;
            formattedLocation.innerHTML = "Showing breweries near " + data[0].display_name;
            findBreweriesLatLong(data[0].lat, data[0].lon);
        })
        .catch((err) => {
            console.log(err);
        })
}

const updateElement = (data: any) => {
    if (map) {
        map = map.off();
        map = map.remove();
    }
    let lat = data[0].latitude;
    let long = data[0].longitude;
    map = L.map('map').setView([lat, long], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    breweryList.innerHTML = "";
    for (let brewery of data) {
        let marker = L.marker([brewery.latitude, brewery.longitude])
        marker.bindPopup(brewery.name);
        marker.addTo(map);
    }
}

const throwError = (err: GeolocationPositionError) => {
    console.log(err);
}