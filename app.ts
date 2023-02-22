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
const listElement = $("list");
const listContainer = $("list-container");
const mapContainer = $("map-container");
const input = $("location");
if (!(input instanceof HTMLInputElement)) {
    throw new Error("Not an instance of HTMLInputElement.");
}
const crosshairsIcon = $("crosshairs-icon")
const formattedLocation = $("formatted-location");
const progressBar = $("progress");
const mapElement = $("map");

crosshairsIcon.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            progressBar.style.display = "block";
            findBreweries(`${position.coords.latitude} ${position.coords.longitude}`);
        }, function (err) {
            formattedLocation.innerHTML = "Error retrieving location data.";
            throwError(err)
        });
    }
});

locate.addEventListener("click", (e) => {
    e.preventDefault();
    if (input.value) {
        findBreweries(input.value);
    }
})

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            progressBar.style.display = "block";
            findBreweries(`${position.coords.latitude} ${position.coords.longitude}`);
        }, (err) => throwError(err));
    }
})

let map: L.Map;

const findBreweriesLatLong = (lat: number, long: number) => {
    fetch(`https://api.openbrewerydb.org/breweries?by_dist=${lat},${long}&per_page=10`)
        .then((res) => res.json())
        .then((data) => {
            updateElement(data);
        })
        .catch((err) => {
            formattedLocation.innerHTML = err;
            progressBar.style.display = "none";
        });
}

const findBreweries = (location: string) => {
    fetch(`https://geocode.maps.co/search?q=${location.replaceAll(' ', '+')}`)
        .then((res) => res.json())
        .then((data) => {
            if (data[0]) {
                input.value = data[0].display_name;
                formattedLocation.innerHTML = "Showing breweries near " + data[0].display_name;
                findBreweriesLatLong(data[0].lat, data[0].lon);
            }
        })
        .catch((err) => {
            formattedLocation.innerHTML = err;
            progressBar.style.display = "none";
        });
}

const updateElement = (data: any) => {
    if (map) {
        map = map.off();
        map = map.remove();
    }
    listElement.innerHTML = "";
    let lat = data[0].latitude;
    let long = data[0].longitude;
    map = L.map('map', {
        dragging: !L.Browser.mobile,
        tap: !L.Browser.mobile
    });
    map.addEventListener("load", onMapLoad);
    map.setView([lat, long], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    for (let brewery of data) {
        let marker = L.marker([brewery.latitude, brewery.longitude])
        marker.bindPopup(brewery.name);
        marker.addTo(map);
        let li = document.createElement("li")
        let postal = brewery.postal_code.split('-')[0];
        li.innerHTML =
            `${brewery.name}<br />
            ${brewery.street}, ${postal}`;
        let heart = document.createElement("i");
        heart.className = "fa-regular fa-heart favorite";
        heart.addEventListener("click", toggleFavorite)
        heart.title = "Favorite";
        listElement.appendChild(li);
        listElement.appendChild(heart);
    }
}

const toggleFavorite = (e: MouseEvent) => {
    let element = e.target as HTMLElement;
    if (element.classList.contains("favorite")) {
        element.classList.replace("favorite", "unfavorite");
        element.classList.replace("fa-regular", "fa-solid");
        element.title = "Unfavorite";
        pop(e);
    }
    else {
        element.classList.replace("unfavorite", "favorite");
        element.classList.replace("fa-solid", "fa-regular");
        element.title = "Favorite";
    }
};

const onMapLoad = () => {
    progressBar.style.display = "none";
    mapElement.style.border = "0.15rem white solid";
    mapContainer.style.display = "flex";
    map.invalidateSize();
    listContainer.style.border = "0.15rem white solid";
}

const throwError = (err: GeolocationPositionError) => {
    console.log(err);
}

function pop(e: MouseEvent) {
    let element = e.target as HTMLElement;
    let particleAmount = 20;
    // Quick check if user clicked the button using a keyboard
    if (e.clientX === 0 && e.clientY === 0) {
        const bbox = element.getBoundingClientRect();
        const x = bbox.left + bbox.width / 2;
        const y = bbox.top + bbox.height / 2;
        for (let i = 0; i < particleAmount; i++) {
            // We call the function createParticle 30 times
            // We pass the coordinates of the button for x & y values
            createParticle(x, y);
        }
    } else {
        for (let i = 0; i < particleAmount; i++) {
            // We call the function createParticle 30 times
            // As we need the coordinates of the mouse, we pass them as arguments
            createParticle(e.clientX, e.clientY);
        }
    }
}

function createParticle(x: number, y: number) {
    const particle = document.createElement('particle');
    document.body.appendChild(particle);
    let width = Math.floor(Math.random() * 30 + 8).toString();
    let height = width;
    let destinationX = (Math.random() - 0.5) * 100;
    let destinationY = (Math.random() - 0.5) * 100;
    let rotation = Math.random() * 520;
    let delay = Math.random() * 200;

    particle.innerHTML = ['🍻', '🍺'][Math.floor(Math.random() * 2)];
    particle.style.fontSize = "1rem"
    width = height = 'auto';

    particle.style.width = `${width}px`;
    particle.style.height = `${height}px`;
    const animation = particle.animate([
        {
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(0deg)`,
            opacity: 1
        },
        {
            transform: `translate(-50%, -50%) translate(${x + destinationX / 2}px, ${y + destinationY / 2}px) rotate(${rotation / 2}deg)`,
            opacity: 0.7
        },
        {
            transform: `translate(-50%, -50%) translate(${x + destinationX}px, ${y + destinationY}px) rotate(${rotation}deg)`,
            opacity: 0
        }
    ], {
        duration: Math.random() * 1000 + 2000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: delay
    });
    animation.onfinish = () => {
        particle.remove();
    };
}