const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const errorContainer = document.querySelector(".error-container"); 

// API Key
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

// Track the active tab
let currentTab = userTab;
currentTab.classList.add("ok");

// Initialize
getFromSessionStorage();

// Tab Switching Functionality
function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("ok");
        currentTab = clickedTab;
        currentTab.classList.add("ok");

        // Toggle forms and containers based on the tab
        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

// Display Error with Image
function displayError(message) {
    loadingScreen.style.display = "none";
    userInfoContainer.style.display = "none";
    errorContainer.classList.add("active"); // Activate the error container

    errorContainer.innerHTML = `
        <img src="./assets/not-found.png" alt="Error" class="error-image">
        <p class="error-message">${message}</p>
    `;
}

// Event Listeners for Tabs
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Retrieve Coordinates from Session Storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// Fetch Weather Info by Coordinates
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    // Update UI
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    //ERROR HANDLING

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (response.ok) {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            throw new Error(data.message || "Failed to fetch weather information.");
        }
    } catch (err) {
        displayError("Unable to fetch your location's weather information.");
        console.error("Error fetching weather info:", err);
    }
}

// Render Weather Info
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windsspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name || "N/A";
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country?.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description || "N/A";
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp || "N/A"}°C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed || "N/A"} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity || "N/A"}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all || "N/A"}%`;
}

// Get User Location via Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, (err) => {
            alert("Failed to fetch location. Please provide manual access.");
            console.error("Geolocation error: ", err);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Event Listener for Grant Access Button
grantAccessButton.addEventListener("click", getLocation);

// Fetch Weather Info by City Name
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (response.ok) {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            throw new Error(data.message || "City not found.");
        }
    } catch (err) {
        displayError("City not found. Please try again with a valid city name.");
        console.error("Error fetching city weather info:", err);
    }
}

// Event Listener for Search Form Submission
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityName = searchInput.value.trim();

    if (cityName === "") return;
    fetchSearchWeatherInfo(cityName);
});
