import { WEATHER_API_KEY, IMAGES_API_KEY } from "./keys.js";

const form = document.querySelector("form");

const geocodeData = async () => {
  try {
    const inputText = form.elements.text.value;
    const res = await axios.get(
      "http://api.openweathermap.org/geo/1.0/direct",
      {
        params: { q: inputText, limit: 1, appid: WEATHER_API_KEY },
      }
    );

    form.elements.text.value = "";
    const data = { lat: res.data[0].lat, lon: res.data[0].lon };

    return data;
  } catch (err) {
    console.log(`FAILED TO GEOCODE LOCATION - ${err}`);
  }
};

const displayData = (data) => {
  const oldDiv = document.querySelector(".weather-text");
  oldDiv.remove();

  const newDiv = document.createElement("div");

  const date = new Date(data.dt * 1000);
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const day = date.toLocaleString("en-US", { day: "numeric" });
  const month = date.toLocaleString("en-US", { month: "long" });

  const temperature = Math.floor(data.main.temp);

  const weatherDesc = data.weather[0].description;
  const weather = weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);

  const feelsLike = Math.floor(data.main.feels_like);

  const imgIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  newDiv.innerHTML += `<h1>${data.name}, ${data.sys.country}</h1><p>${weekday}, ${month} ${day}</p><p>${weather}</p><div class="temperature-wrap"><img src="${imgIcon}"><p id="temperature">${temperature}°C</p></div>`;
  newDiv.innerHTML += `<ul><li>Feels like: ${feelsLike}°C</li><li>Humidity: ${data.main.humidity}%</li><li>Wind: ${data.wind.speed} km/h</li></ul>`;

  newDiv.classList.add("weather-text");

  const main = document.querySelector("main");
  main.appendChild(newDiv);
};

const loadData = async () => {
  try {
    const { lat, lon } = await geocodeData();

    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      { params: { lat, lon, units: "metric", appid: WEATHER_API_KEY } }
    );
    displayData(res.data);
  } catch (err) {
    console.log(`FAILED TO LOAD THE DATA - ${err}`);
  }
};

const loadImage = async () => {
  try {
    const config = {
      params: {
        query: form.elements.text.value,
        orientation: "landscape",
        Authorization: IMAGES_API_KEY,
      },
      headers: {
        Authorization: IMAGES_API_KEY,
      },
    };

    const res = await axios.get("https://api.pexels.com/v1/search", config);

    const img = res.data.photos[0].src.large2x;

    const container = document.querySelector(".container");
    const author = document.querySelector("#authorSignature");

    author.href = res.data.photos[0].photographer_url;
    author.lastChild.innerHTML = res.data.photos[0].photographer;

    container.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${img})`;
  } catch (error) {
    console.log(`FAILED TO LOAD THE IMAGE - ${error}`);
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadImage();
  loadData();
});
