const $ = (id: string): HTMLElement => {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error("Not an instance of HTMLElement.");
    }
    return element;
};

const locationElement = $("location");
const button = $("locate");

button.addEventListener("click", () => {
    if (navigator.geolocation) {
        console.log("ok");
        navigator.geolocation.getCurrentPosition((position) => {
            updateElement(position.coords.latitude, position.coords.longitude);
        }, (err) => throwError(err));
    }
    else {
        console.log("no");
    }
});

const updateElement = (lat: number, long: number) => {
    console.log("ok!!");
    fetch(`https://api.openbrewerydb.org/breweries?by_dist=${lat},${long}&per_page=10`)
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        for (let brewery of data) {
            locationElement.innerText += brewery.name + "\n"
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

const throwError = (err: GeolocationPositionError) => {
    console.log(err);
}