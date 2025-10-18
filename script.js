// PERBAIKI SELECTOR INI:
const currentDateTxt = document.querySelector('.current-date-txt');
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');

// ✅ TAMBAHKAN SELECTOR UNTUK FORECAST
const forecastContainer = document.querySelector('.forecast-items-container');

const apiKey = 'fa295ce97a8f6b32b6f63fd00f859a2e';

// Event listener untuk tombol search
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Event listener untuk input keyboard
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Fungsi untuk fetch data dari API
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric&lang=id`;
    const response = await fetch(apiUrl);
    return response.json();
}

// Fungsi untuk mendapatkan icon cuaca berdasarkan weather ID
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id <= 800) return 'clear.svg';
    else return 'clouds.svg';
}

// Fungsi untuk mendapatkan tanggal terkini
function getCurrentDate() {
    const currentDate = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return currentDate.toLocaleDateString('id-ID', options);
}

// ✅ FUNGSI UNTUK FORMAT TANGGAL FORECAST
function formatForecastDate(dt_txt) {
    const date = new Date(dt_txt);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long' 
    });
}

// ✅ FUNGSI UNTUK UPDATE FORECAST
async function updateForecastsInfo(city) {
    try {
        const forecastsData = await getFetchData('forecast', city);
        console.log('Forecast data:', forecastsData);
        
        if (forecastsData.cod != '200') {
            console.error('Forecast data not available');
            return;
        }
        
        // Bersihkan container forecast
        forecastContainer.innerHTML = '';
        
        // Ambil data forecast untuk 4 hari ke depan (setiap 24 jam)
        const dailyForecasts = [];
        for (let i = 0; i < forecastsData.list.length; i++) {
            const forecast = forecastsData.list[i];
            const forecastTime = new Date(forecast.dt_txt).getHours();
            
            // Ambil data untuk jam 12:00 siang setiap hari
            if (forecastTime === 12 && dailyForecasts.length < 4) {
                dailyForecasts.push(forecast);
            }
        }
        
        // Buat elemen forecast untuk setiap hari
        dailyForecasts.forEach(forecast => {
            const { dt_txt, main: { temp }, weather: [{ id }] } = forecast;
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <h5 class="forecast-item-date regular-txt">${formatForecastDate(dt_txt)}</h5>
                <img src="assets/weather/${getWeatherIcon(id)}" alt="Forecast" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
        
    } catch (error) {
        console.error('Error in updateForecastsInfo:', error);
    }
}

// Fungsi utama untuk update info cuaca dengan error handling
async function updateWeatherInfo(city) {
    try {
        const weatherData = await getFetchData('weather', city);

        if (weatherData.cod != 200) {
            showDisplaySection(notFoundSection);
            return;
        }

        console.log('Weather data:', weatherData);

        const { 
            name: country,
            main: { temp, humidity },
            weather: [{ id, main, description }],
            wind: { speed }
        } = weatherData;
        
        // Mapping kondisi cuaca ke Bahasa Indonesia
        const kondisiMap = {
            Clear: "Cerah",
            Clouds: "Berawan",
            Rain: "Hujan",
            Snow: "Salju",
            Thunderstorm: "Badai Petir",
            Drizzle: "Gerimis",
            Mist: "Berkabut",
            Smoke: "Berkabut Asap",
            Haze: "Berkabut Tipis",
            Dust: "Debu",
            Fog: "Kabut",
            Sand: "Badai Pasir",
            Ash: "Abu Vulkanik",
            Squall: "Angin Kencang",
            Tornado: "Tornado"
        };
        
        const deskripsiMap = {
            "clear sky": "Langit Cerah",
            "few clouds": "Sedikit Berawan",
            "scattered clouds": "Awan Tersebar",
            "broken clouds": "Awan Terputus",
            "overcast clouds": "Mendung",
            "light rain": "Hujan Ringan",
            "moderate rain": "Hujan Sedang",
            "heavy intensity rain": "Hujan Lebat",
            "thunderstorm": "Badai Petir",
            "snow": "Salju",
            "mist": "Berkabut"
        };
        
        // Update teks pada elemen DOM
        countryTxt.textContent = country || 'N/A';
        tempTxt.textContent = Math.round(temp) + ' °C';
        conditionTxt.textContent = deskripsiMap[description] || kondisiMap[main] || main || 'N/A';
        humidityValueTxt.textContent = humidity + '%';
        windValueTxt.textContent = speed + ' km/h';

        // ✅ SET TANGGAL - SEKARANG SUDAH BENAR
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
        weatherSummaryImg.alt = main || 'Weather icon';
        
        // ✅ PERBAIKI: Panggil fungsi forecast secara terpisah
        await updateForecastsInfo(city);
        
        showDisplaySection(weatherInfoSection);
    } catch (error) {
        console.error('Error in updateWeatherInfo:', error);
        showDisplaySection(notFoundSection);
    }
}

// Fungsi untuk menampilkan section yang aktif
function showDisplaySection(activeSection) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => {
            if (sec) sec.style.display = 'none';
        });

    if (activeSection) {
        activeSection.style.display = 'flex';
    }
}

// Validasi elemen saat DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Validasi semua elemen
    const elements = {
        'cityInput': cityInput,
        'searchBtn': searchBtn,
        'weatherInfoSection': weatherInfoSection,
        'notFoundSection': notFoundSection,
        'searchCitySection': searchCitySection,
        'countryTxt': countryTxt,
        'tempTxt': tempTxt,
        'conditionTxt': conditionTxt,
        'humidityValueTxt': humidityValueTxt,
        'windValueTxt': windValueTxt,
        'weatherSummaryImg': weatherSummaryImg,
        'currentDateTxt': currentDateTxt,
        'forecastContainer': forecastContainer // ✅ TAMBAHKAN
    };
    
    console.log('=== Validasi Elemen ===');
    let allElementsFound = true;
    
    Object.entries(elements).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ ${name}: Found`);
        } else {
            console.log(`❌ ${name}: NOT FOUND`);
            allElementsFound = false;
        }
    });
    
    if (!allElementsFound) {
        console.error('Beberapa elemen tidak ditemukan. Pastikan HTML memiliki class yang sesuai!');
    }
    
    // Tampilkan section pencarian kota pertama kali
    showDisplaySection(searchCitySection);
});