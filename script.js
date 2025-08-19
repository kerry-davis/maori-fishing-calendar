const lunarPhases = [
    { name: "Whiro", quality: "Poor", description: "The new moon. An unfavourable day for fishing.", biteQualities: ["poor", "poor", "poor", "poor"] },
    { name: "Tirea", quality: "Average", description: "The moon is a sliver. A reasonably good day for crayfishing.", biteQualities: ["poor", "average", "poor", "poor"] },
    { name: "Hoata", quality: "Excellent", description: "A very good day for eeling and crayfishing.", biteQualities: ["good", "excellent", "good", "average"] },
    { name: "Oue", quality: "Good", description: "A good day for planting and fishing.", biteQualities: ["average", "good", "average", "poor"] },
    { name: "Okoro", quality: "Good", description: "Another good day for planting and fishing.", biteQualities: ["average", "good", "fair", "poor"] },
    { name: "Tamatea-a-hotu", quality: "Average", description: "A day for planting. Fishing is average.", biteQualities: ["fair", "average", "fair", "poor"] },
    { name: "Tamatea-a-ngana", quality: "Good", description: "A good day for fishing, but the weather can be unpredictable.", biteQualities: ["good", "fair", "good", "fair"] },
    { name: "Tamatea-whakapau", quality: "Poor", description: "Not a good day for fishing.", biteQualities: ["poor", "fair", "poor", "fair"] },
    { name: "Huna", quality: "Poor", description: "Means 'to hide'. Not a good day for fishing.", biteQualities: ["poor", "poor", "poor", "poor"] },
    { name: "Ari", quality: "Poor", description: "A disagreeable day. Unproductive.", biteQualities: ["poor", "poor", "poor", "poor"] },
    { name: "Hotu", quality: "Excellent", description: "The moon is bright and nearing full. A very good time for night fishing.", biteQualities: ["excellent", "average", "fair", "fair"] },
    { name: "Mawharu", quality: "Good", description: "A most favourable day for planting food and a good day for fishing.", biteQualities: ["good", "good", "fair", "fair"] },
    { name: "Atua", quality: "Poor", description: "Not a good day for planting or fishing.", biteQualities: ["fair", "poor", "poor", "poor"] },
    { name: "Ohua", quality: "Excellent", description: "The moon is nearly full. One of the best nights for fishing.", biteQualities: ["excellent", "good", "good", "fair"] },
    { name: "Oanui", quality: "Good", description: "The day of the full moon. Good for fishing.", biteQualities: ["average", "excellent", "good", "fair"] },
    { name: "Oturu", quality: "Good", description: "A good day for fishing and a very good day for eeling.", biteQualities: ["fair", "good", "poor", "poor"] },
    { name: "Rakau-nui", quality: "Good", description: "A very good day for fishing.", biteQualities: ["fair", "good", "poor", "poor"] },
    { name: "Rakau-matohi", quality: "Good", description: "A fine day for fishing.", biteQualities: ["good", "fair", "poor", "poor"] },
    { name: "Takirau", quality: "Average", description: "Fine weather in the morning. Fishing is average.", biteQualities: ["excellent", "average", "fair", "fair"] },
    { name: "Oike", quality: "Average", description: "The afternoon is favourable for fishing.", biteQualities: ["average", "average", "fair", "fair"] },
    { name: "Korekore-te-whiwhia", quality: "Good", description: "A bad day for fishing.", biteQualities: ["good", "good", "average", "average"] },
    { name: "Korekore-te-rawea", quality: "Poor", description: "Another bad day for fishing.", biteQualities: ["poor", "poor", "poor", "poor"] },
    { name: "Korekore-whakapau", quality: "Poor", description: "A fairly good day.", biteQualities: ["poor", "poor", "poor", "poor"] },
    { name: "Tangaroa-a-mua", quality: "Excellent", description: "A good day for fishing.", biteQualities: ["excellent", "good", "good", "fair"] },
    { name: "Tangaroa-a-roto", quality: "Excellent", description: "Another good day for fishing.", biteQualities: ["excellent", "excellent", "good", "good"] },
    { name: "Tangaroa-kiokio", quality: "Excellent", description: "An excellent day for fishing.", biteQualities: ["excellent", "excellent", "excellent", "good"] },
    { name: "Otane", quality: "Good", description: "A good day, and a good night for eeling.", biteQualities: ["good", "fair", "fair", "poor"] },
    { name: "Orongonui", quality: "Good", description: "A desirable day for fishing.", biteQualities: ["good", "good", "fair", "fair"] },
    { name: "Mauri", quality: "Average", description: "The morning is fine. Fishing is average.", biteQualities: ["fair", "average", "poor", "poor"] },
    { name: "Mutuwhenua", quality: "Poor", description: "An exceedingly bad day for fishing.", biteQualities: ["poor", "poor", "poor", "poor"] }
];

const biteQualityColors = {
    excellent: "#10b981",
    good: "#3b82f6",
    average: "#f59e0b",
    fair: "#8b5cf6",
    poor: "#ef4444"
};

let db;
let userLocation = null;
let currentTripId = null;
let currentEditingTripId = null; // For sub-modals (weather, fish)
let currentEditingWeatherId = null;
let currentEditingFishId = null;
let tempSelectedGear = [];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let modalCurrentDay = null;
let modalCurrentMonth = null;
let modalCurrentYear = null;

let calendarDays, currentMonthElement, prevMonthButton, nextMonthButton, lunarModal, closeModal, modalTitle, modalSummary, modalDate, modalQuality, modalMoonAge, modalMoonIllumination, majorBites, minorBites, modalPrevDay, modalNextDay, currentMoonPhase, currentMoonAge, currentMoonIllumination;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMoonPhaseData(date) {
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const moonAge = moonIllumination.phase * 29.53;
    let phaseIndex = Math.floor(moonAge);
    phaseIndex = Math.min(phaseIndex, lunarPhases.length - 1);
    return {
        phaseIndex: phaseIndex,
        moonAge: moonAge,
        illumination: moonIllumination.fraction
    };
}

function minutesToTime(minutes) {
    minutes = (minutes + 1440) % 1440;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function getMoonTransitTimes(date, lat, lng) {
    var rc = { "transits": [] };
    var sign = 1, i, j;
    for (i = 0; i <= 25; i++) {
        var date2 = new Date(date.getTime());
        date2.setHours(i);
        date2.setMinutes(0);
        date2.setSeconds(0);
        date2.setMilliseconds(0);
        var moontimes = SunCalc.getMoonPosition(date2, lat, lng);
        if (i === 0) {
            sign = Math.sign(moontimes.azimuth);
        }
        if (sign != Math.sign(moontimes.azimuth)) {
            break;
        }
    }
    sign = true;
    for (j = 0; j < 60; j++) {
        var date3 = new Date(date.getTime());
        date3.setHours(i - 1);
        date3.setMinutes(j);
        date3.setSeconds(0);
        date2.setMilliseconds(0);
        var moontimes = SunCalc.getMoonPosition(date3, lat, lng);
        if (j === 0) {
            if (moontimes.azimuth < 0) {
                sign = false;
            }
        }
        if (sign != (moontimes.azimuth > 0)) {
            rc.transits.push({ 'time': date3, 'overhead': (Math.sign(moontimes.altitude) > 0) });
            break;
        }
    }
    var start = i;
    for (; i <= 25; i++) {
        var date2 = new Date(date.getTime());
        date2.setHours(i);
        date2.setMinutes(0);
        date2.setSeconds(0);
        date2.setMilliseconds(0);
        var moontimes = SunCalc.getMoonPosition(date2, lat, lng);
        if (i === start) {
            sign = Math.sign(moontimes.azimuth);
        }
        if (sign != Math.sign(moontimes.azimuth)) {
            break;
        }
    }
    if (i < 25) {
        sign = true;
        for (var j = 0; j < 60; j++) {
            var date3 = new Date(date.getTime());
            date3.setHours(i - 1);
            date3.setMinutes(j);
            date3.setSeconds(0);
            date2.setMilliseconds(0);
            var moontimes = SunCalc.getMoonPosition(date3, lat, lng);
            if (j === 0) {
                if (moontimes.azimuth < 0) {
                    sign = false;
                }
            }
            if (sign != (moontimes.azimuth > 0)) {
                rc.transits.push({ 'time': date3, 'overhead': (Math.sign(moontimes.altitude) > 0) });
                break;
            }
        }
    }
    return rc;
};

async function fetchWeatherForecast(lat, lon, date) {
    const weatherContent = document.getElementById('weather-forecast-content');
    weatherContent.innerHTML = '<p>Loading weather...</p>';

    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,winddirection_10m_dominant&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayWeatherForecast(data);
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        weatherContent.innerHTML = '<p>Could not load weather forecast.</p>';
    }
}

function displaySunMoonTimes(date, lat, lon) {
    const sunMoonContent = document.getElementById('sun-moon-content');

    const formatTime = (dateObj) => {
        if (!dateObj || isNaN(dateObj)) return 'N/A';
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const sunTimes = SunCalc.getTimes(date, lat, lon);
    const sunrise = formatTime(sunTimes.sunrise);
    const sunset = formatTime(sunTimes.sunset);

    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const rise_times = [
        SunCalc.getMoonTimes(yesterday, lat, lon).rise,
        SunCalc.getMoonTimes(today, lat, lon).rise,
        SunCalc.getMoonTimes(tomorrow, lat, lon).rise
    ].filter(Boolean);

    const set_times = [
        SunCalc.getMoonTimes(yesterday, lat, lon).set,
        SunCalc.getMoonTimes(today, lat, lon).set,
        SunCalc.getMoonTimes(tomorrow, lat, lon).set
    ].filter(Boolean);

    const moonrise_date = rise_times.find(r => r > today && r < tomorrow);
    const moonset_date = set_times.find(s => s > today && s < tomorrow);

    const moonrise = formatTime(moonrise_date);
    const moonset = formatTime(moonset_date);

    sunMoonContent.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            <div>
                <p class="font-semibold">Sunrise:</p>
                <p>${sunrise}</p>
            </div>
            <div>
                <p class="font-semibold">Sunset:</p>
                <p>${sunset}</p>
            </div>
            <div>
                <p class="font-semibold">Moonrise:</p>
                <p>${moonrise}</p>
            </div>
            <div>
                <p class="font-semibold">Moonset:</p>
                <p>${moonset}</p>
            </div>
        </div>
    `;
}

function displayWeatherForecast(data) {
    const weatherContent = document.getElementById('weather-forecast-content');
    if (!data || !data.daily || !data.daily.time || data.daily.time.length === 0) {
        weatherContent.innerHTML = '<p>Weather data is not available for this day.</p>';
        return;
    }

    const dayData = data.daily;
    const tempMax = dayData.temperature_2m_max[0];
    const tempMin = dayData.temperature_2m_min[0];
    const windSpeed = dayData.windspeed_10m_max[0];
    const windDirection = dayData.winddirection_10m_dominant[0];

    // Function to convert wind direction in degrees to cardinal direction
    const getCardinalDirection = (angle) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(angle / 45) % 8];
    };

    const cardinalWindDirection = getCardinalDirection(windDirection);

    weatherContent.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            <div>
                <p class="font-semibold">Temperature:</p>
                <p>${tempMin}°C - ${tempMax}°C</p>
            </div>
            <div>
                <p class="font-semibold">Wind:</p>
                <p>${windSpeed} km/h (${cardinalWindDirection})</p>
            </div>
        </div>
    `;
}

function calculateBiteTimes(date, lat, lon) {
    if (lat === null || lon === null) {
        return { major: [], minor: [] };
    }

    const moonTimes = SunCalc.getMoonTimes(date, lat, lon);
    const moonTransits = getMoonTransitTimes(date, lat, lon).transits;
    const lunarDay = lunarPhases[getMoonPhaseData(date).phaseIndex];
    const qualities = lunarDay.biteQualities;

    const formatBite = (start, end, quality) => ({
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        quality: quality
    });

    const majorBites = moonTransits.map((transit, index) => {
        const start = new Date(transit.time.getTime() - 1 * 60 * 60 * 1000); // 2 hour window
        const end = new Date(transit.time.getTime() + 1 * 60 * 60 * 1000);
        return formatBite(start, end, qualities[index]);
    });

    const minorBites = [];
    if (moonTimes.rise) {
        const start = new Date(moonTimes.rise.getTime() - 0.5 * 60 * 60 * 1000); // 1 hour window
        const end = new Date(moonTimes.rise.getTime() + 0.5 * 60 * 60 * 1000);
        minorBites.push(formatBite(start, end, qualities[2]));
    }
    if (moonTimes.set) {
        const start = new Date(moonTimes.set.getTime() - 0.5 * 60 * 60 * 1000); // 1 hour window
        const end = new Date(moonTimes.set.getTime() + 0.5 * 60 * 60 * 1000);
        minorBites.push(formatBite(start, end, qualities[3]));
    }

    return {
        major: majorBites,
        minor: minorBites
    };
}

function setupTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return;
    const themeToggleIcon = themeToggleBtn.querySelector('i');
    const updateIcon = (isDark) => {
        if (isDark) {
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
        } else {
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
        }
    };
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon(isDark);
    };
    themeToggleBtn.addEventListener('click', toggleTheme);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDark = false;
    if (savedTheme) {
        isDark = savedTheme === 'dark';
    } else {
        isDark = prefersDark;
    }
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
    updateIcon(isDark);
}

function loadLocation() {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
        userLocation = JSON.parse(savedLocation);
    }
}

function setLocationAndFetchBiteTimes(lat, lon, name) {
    userLocation = { lat, lon, name };
    localStorage.setItem('userLocation', JSON.stringify(userLocation));

    const date = new Date(modalCurrentYear, modalCurrentMonth, modalCurrentDay);
    const biteTimes = calculateBiteTimes(date, lat, lon);
    majorBites.innerHTML = '';
    biteTimes.major.forEach(biteTime => majorBites.appendChild(createBiteTimeElement(biteTime)));
    minorBites.innerHTML = '';
    biteTimes.minor.forEach(biteTime => minorBites.appendChild(createBiteTimeElement(biteTime)));

    // Fetch weather for the new location
    fetchWeatherForecast(lat, lon, date);
    displaySunMoonTimes(date, lat, lon);
    updateLocationDisplay();
};

function initDB(callback) {
    const request = indexedDB.open("fishingLog", 2); // Bump version to 2

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        console.log("Upgrading database schema...");

        // Delete old store if it exists
        if (db.objectStoreNames.contains('catch_logs')) {
            db.deleteObjectStore('catch_logs');
            console.log("Old 'catch_logs' object store deleted.");
        }

        // Create new stores
        if (!db.objectStoreNames.contains('trips')) {
            const tripsStore = db.createObjectStore("trips", { keyPath: "id", autoIncrement: true });
            tripsStore.createIndex("date", "date", { unique: false });
            console.log("'trips' object store created.");
        }
        if (!db.objectStoreNames.contains('weather_logs')) {
            const weatherStore = db.createObjectStore("weather_logs", { keyPath: "id", autoIncrement: true });
            weatherStore.createIndex("tripId", "tripId", { unique: false });
            console.log("'weather_logs' object store created.");
        }
        if (!db.objectStoreNames.contains('fish_caught')) {
            const fishStore = db.createObjectStore("fish_caught", { keyPath: "id", autoIncrement: true });
            fishStore.createIndex("tripId", "tripId", { unique: false });
            console.log("'fish_caught' object store created.");
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Database initialized successfully.");
        if (callback) callback();
    };

    request.onerror = function(event) {
        console.error("Database error: " + event.target.errorCode);
    };
}

function validateTripForm() {
    const tripInputs = [
        document.getElementById('trip-water'),
        document.getElementById('trip-location'),
        document.getElementById('trip-hours'),
        document.getElementById('trip-companions'),
        document.getElementById('trip-best-times')
    ];
    const saveTripBtn = document.getElementById('save-trip-btn');
    const isAnyFieldFilled = tripInputs.some(input => input.value.trim() !== '');
    saveTripBtn.disabled = !isAnyFieldFilled;
}

function clearTripForm() {
    document.getElementById('trip-water').value = '';
    document.getElementById('trip-location').value = '';
    document.getElementById('trip-hours').value = '';
    document.getElementById('trip-companions').value = '';
    document.getElementById('trip-best-times').value = '';
    currentTripId = null;
    document.getElementById('trip-form-title').textContent = 'Log a New Trip';
    document.getElementById('save-trip-btn').textContent = 'Save Trip';
    document.getElementById('cancel-edit-trip-btn').classList.add('hidden');
    validateTripForm();
}

function saveTrip() {
    const date = `${modalCurrentYear}-${(modalCurrentMonth + 1).toString().padStart(2, '0')}-${modalCurrentDay.toString().padStart(2, '0')}`;
    const tripData = {
        date: date,
        water: document.getElementById('trip-water').value,
        location: document.getElementById('trip-location').value,
        hours: document.getElementById('trip-hours').value,
        companions: document.getElementById('trip-companions').value,
        notes: document.getElementById('trip-best-times').value,
    };

    const transaction = db.transaction(["trips"], "readwrite");
    const objectStore = transaction.objectStore("trips");
    let request;

    if (currentTripId) {
        tripData.id = currentTripId;
        request = objectStore.put(tripData);
    } else {
        request = objectStore.add(tripData);
    }

    request.onsuccess = () => {
        console.log("Trip saved successfully.");
        clearTripForm();
        displayTrips(date);
        renderCalendar();
        updateOpenTripLogButton(date);
        const successMsg = document.getElementById('save-trip-success-msg');
        successMsg.classList.remove('hidden');
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 2000);
    };

    request.onerror = (event) => {
        console.error("Error saving trip:", event.target.error);
    };
}

function displayTrips(date) {
    const transaction = db.transaction(["trips"], "readonly");
    const objectStore = transaction.objectStore("trips");
    const index = objectStore.index("date");
    const request = index.getAll(date);

    request.onsuccess = () => {
        const tripLogList = document.getElementById('trip-log-list');
        tripLogList.innerHTML = '';
        const trips = request.result;

        if (trips.length > 0) {
            trips.forEach(trip => {
                const tripEl = document.createElement('div');
                tripEl.className = 'p-3 bg-white dark:bg-gray-800 rounded shadow text-sm';

                let title = trip.water || 'Unnamed Trip';
                if (trip.location) {
                    title += ` - ${trip.location}`;
                }
                let content = `<div class="font-bold text-base mb-2">${title}</div>`;
                if(trip.hours) content += `<p><strong>Hours Fished:</strong> ${trip.hours}</p>`;
                content += `<p><strong>Total Fish Caught:</strong> <span id="fish-count-${trip.id}">0</span></p>`;
                if(trip.companions) content += `<p><strong>Fished With:</strong> ${trip.companions}</p>`;
                if(trip.notes) content += `<p><strong>Notes:</strong> ${trip.notes}</p>`;

                content += `
                    <div class="mt-3 pt-3">
                        <button data-action="edit-trip" data-trip-id="${trip.id}" class="text-xs px-2 py-1 bg-yellow-500 text-white rounded">Edit Trip</button>
                        <button data-action="delete-trip" data-trip-id="${trip.id}" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete Trip</button>
                    </div>
                    <div class="border-t dark:border-gray-700 mt-3 pt-3">
                        <h6 class="font-semibold mb-2">Weather Conditions</h6>
                        <div id="weather-list-${trip.id}" class="space-y-2">
                            <!-- Weather logs will be displayed here -->
                        </div>
                        <button data-action="add-weather" data-trip-id="${trip.id}" class="mt-2 text-xs px-2 py-1 bg-blue-500 text-white rounded">Add Weather</button>
                    </div>
                    <div class="border-t dark:border-gray-700 mt-3 pt-3">
                        <h6 class="font-semibold mb-2">Fish Caught</h6>
                        <div id="fish-list-${trip.id}" class="space-y-2">
                            <!-- Fish logs will be displayed here -->
                        </div>
                        <button data-action="add-fish" data-trip-id="${trip.id}" class="mt-2 text-xs px-2 py-1 bg-purple-500 text-white rounded">Add Fish</button>
                    </div>
                `;
                tripEl.innerHTML = content;
                tripLogList.appendChild(tripEl);
                displayWeatherForTrip(trip.id);
                displayFishForTrip(trip.id);
                updateFishCountForTrip(trip.id);
            });
        } else {
            tripLogList.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No trips logged for this day.</p>';
        }
    };
}

function editTrip(id) {
    const transaction = db.transaction(["trips"], "readonly");
    const objectStore = transaction.objectStore("trips");
    const request = objectStore.get(id);

    request.onsuccess = () => {
        const trip = request.result;
        document.getElementById('trip-water').value = trip.water;
        document.getElementById('trip-location').value = trip.location;
        document.getElementById('trip-hours').value = trip.hours;
        document.getElementById('trip-companions').value = trip.companions;
        document.getElementById('trip-best-times').value = trip.notes;

        currentTripId = id;
        document.getElementById('trip-form-title').textContent = 'Editing Trip';
        document.getElementById('save-trip-btn').textContent = 'Update Trip';
        document.getElementById('cancel-edit-trip-btn').classList.remove('hidden');
        validateTripForm();

        const modalContent = document.getElementById('trip-log-scroll-container');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    };
}

function deleteTrip(id) {
    // Get the date of the trip before deleting, so we can refresh the UI
    const getTransaction = db.transaction(["trips"], "readonly");
    const getObjectStore = getTransaction.objectStore("trips");
    const getRequest = getObjectStore.get(id);

    getRequest.onsuccess = () => {
        const tripToDelete = getRequest.result;
        if (!tripToDelete) {
            console.error("Trip to delete not found:", id);
            return;
        }
        const dateToDelete = tripToDelete.date;

        // Start the delete transaction
        const deleteTransaction = db.transaction(["trips", "weather_logs", "fish_caught"], "readwrite");

        deleteTransaction.oncomplete = () => {
            console.log("Trip and all associated data deleted successfully.");
            displayTrips(dateToDelete);
            renderCalendar();
            updateOpenTripLogButton(dateToDelete);
        };

        deleteTransaction.onerror = (event) => {
            console.error("Error deleting trip and associated data:", event.target.error);
        };

        // 1. Delete associated weather logs
        const weatherStore = deleteTransaction.objectStore("weather_logs");
        const weatherIndex = weatherStore.index("tripId");
        const weatherRequest = weatherIndex.openCursor(IDBKeyRange.only(id));
        weatherRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // 2. Delete associated fish
        const fishStore = deleteTransaction.objectStore("fish_caught");
        const fishIndex = fishStore.index("tripId");
        const fishRequest = fishIndex.openCursor(IDBKeyRange.only(id));
        fishRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // 3. Delete the trip itself
        const tripsStore = deleteTransaction.objectStore("trips");
        tripsStore.delete(id);
    };

    getRequest.onerror = (event) => {
        console.error("Error fetching trip to delete:", event.target.error);
    };
}

function updateLocationDisplay() {
    const locationDisplay = document.getElementById('current-location-display');
    const promptBtn = document.getElementById('prompt-location-btn');

    if (userLocation && userLocation.name) {
        locationDisplay.textContent = `Location: ${userLocation.name}`;
        promptBtn.classList.add('hidden');
    } else {
        locationDisplay.textContent = 'Location not set. Bite times and weather are disabled.';
        promptBtn.classList.remove('hidden');
    }
}

function initDOMElements() {
    calendarDays = document.getElementById('calendarDays');
    currentMonthElement = document.getElementById('currentMonth');
    prevMonthButton = document.getElementById('prevMonth');
    nextMonthButton = document.getElementById('nextMonth');
    lunarModal = document.getElementById('lunarModal');
    closeModal = document.getElementById('closeModal');
    modalTitle = document.getElementById('modalTitle');
    modalSummary = document.getElementById('modalSummary');
    modalDate = document.getElementById('modalDate');
    modalQuality = document.getElementById('modalQuality');
    modalMoonAge = document.getElementById('modalMoonAge');
    modalMoonIllumination = document.getElementById('modalMoonIllumination');
    majorBites = document.getElementById('majorBites');
    minorBites = document.getElementById('minorBites');
    modalPrevDay = document.getElementById('modalPrevDay');
    modalNextDay = document.getElementById('modalNextDay');
    currentMoonPhase = document.getElementById('currentMoonPhase');
    currentMoonAge = document.getElementById('currentMoonAge');
    currentMoonIllumination = document.getElementById('currentMoonIllumination');
}

function initCalendar() {
    initDOMElements();
    loadLocation();
    setupEventListeners();
    setupTheme();
    initDB(() => {
        renderCalendar();
        updateCurrentMoonInfo();
        updateLocationDisplay();
    });
}

function handleModalClicks(e) {
    if (e.target === lunarModal) {
        hideModal();
        return;
    }

    const target = e.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    if (!action) return;

    const tripId = parseInt(target.dataset.tripId, 10);

    if (action === 'add-weather') openWeatherModal(tripId);
    if (action === 'edit-weather') openWeatherModal(tripId, parseInt(target.dataset.weatherId, 10));
    if (action === 'delete-weather') deleteWeather(parseInt(target.dataset.weatherId, 10), tripId);

    if (action === 'add-fish') openFishModal(tripId);
    if (action === 'edit-fish') openFishModal(tripId, parseInt(target.dataset.fishId, 10));
    if (action === 'delete-fish') deleteFish(parseInt(target.dataset.fishId, 10), tripId);

    if (action === 'edit-trip') editTrip(tripId);
    if (action === 'delete-trip') deleteTrip(tripId);
}

function setupEventListeners() {
    const promptBtn = document.getElementById('prompt-location-btn');
    if (promptBtn) {
        promptBtn.addEventListener('click', () => {
            const today = new Date();
            showModal(today.getDate(), today.getMonth(), today.getFullYear());
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => openModalWithAnimation(settingsModal));
    }

    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', () => closeModalWithAnimation(settingsModal));
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                closeModalWithAnimation(settingsModal);
            }
        });
    }

    const gearSelectionModal = document.getElementById('gearSelectionModal');
    if (gearSelectionModal) {
        gearSelectionModal.addEventListener('click', (e) => {
            if (e.target === gearSelectionModal) {
                // Clicking the backdrop should not save changes, it should just close.
                // The tempSelectedGear is only updated on "Done" click.
                closeModalWithAnimation(gearSelectionModal);
            }
        });
    }

    const doneSelectGearBtn = document.getElementById('done-select-gear-btn');
    if (doneSelectGearBtn) {
        doneSelectGearBtn.addEventListener('click', () => {
            const selectedCheckboxes = document.querySelectorAll('#gear-checklist-container input[type="checkbox"]:checked');
            tempSelectedGear = [...selectedCheckboxes].map(cb => cb.value);
            updateSelectedGearDisplay();
            closeModalWithAnimation(document.getElementById('gearSelectionModal'));
        });
    }

    const gearSearchInput = document.getElementById('gear-search-input');
    if (gearSearchInput) {
        gearSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('#gear-checklist-container .gear-item').forEach(item => {
                const label = item.querySelector('label');
                if (label.textContent.toLowerCase().includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });
    closeModal.addEventListener('click', hideModal);
    lunarModal.addEventListener('click', handleModalClicks);

    modalPrevDay.addEventListener('click', showPreviousDay);
    modalNextDay.addEventListener('click', showNextDay);

    const useLocationBtn = document.getElementById('use-location-btn');
    const locationInput = document.getElementById('location-input');
    const searchLocationBtn = document.getElementById('search-location-btn');

    const saveTripBtn = document.getElementById('save-trip-btn');
    if (saveTripBtn) {
        saveTripBtn.addEventListener('click', saveTrip);
    }

    const cancelEditTripBtn = document.getElementById('cancel-edit-trip-btn');
    if (cancelEditTripBtn) {
        cancelEditTripBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearTripForm();
        });
    }

    const tripInputs = [
        'trip-water', 'trip-location', 'trip-hours',
        'trip-companions', 'trip-best-times'
    ];
    tripInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', validateTripForm);
        }
    });

    const handleManualLocationSearch = () => {
        const query = locationInput.value;
        if (query.length < 2) return;

        majorBites.innerHTML = '<li>Loading...</li>';
        minorBites.innerHTML = '';

        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const item = data[0];
                    const lat = parseFloat(item.lat);
                    const lon = parseFloat(item.lon);
                    locationInput.value = item.display_name;
                    setLocationAndFetchBiteTimes(lat, lon, item.display_name);
                } else {
                    majorBites.innerHTML = '<li>Location not found.</li>';
                }
            })
            .catch(error => {
                console.error('Error fetching location:', error);
                majorBites.innerHTML = '<li>Error finding location.</li>';
            });
    };

    if (searchLocationBtn) {
        searchLocationBtn.addEventListener('click', handleManualLocationSearch);
    }

    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', () => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                            .then(response => response.json())
                            .then(data => {
                                const name = data.display_name;
                                locationInput.value = name;
                                setLocationAndFetchBiteTimes(lat, lon, name);
                            })
                            .catch(error => {
                                console.error('Error fetching location name:', error);
                                const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                                locationInput.value = name;
                                setLocationAndFetchBiteTimes(lat, lon, name);
                            });
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("Could not retrieve your location. Please enter it manually.");
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }

    if (locationInput) {
        locationInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleManualLocationSearch();
            }
        });
    }

    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    const importInput = document.getElementById('import-file-input');
    if (importInput) {
        importInput.addEventListener('change', importData);
    }

    const saveWeatherBtn = document.getElementById('save-weather-btn');
    if (saveWeatherBtn) {
        saveWeatherBtn.addEventListener('click', saveWeather);
    }

    const closeWeatherModalBtn = document.getElementById('close-weather-modal-btn');
    if (closeWeatherModalBtn) {
        closeWeatherModalBtn.addEventListener('click', closeWeatherModal);
    }

    const saveFishBtn = document.getElementById('save-fish-btn');
    if (saveFishBtn) {
        saveFishBtn.addEventListener('click', saveFish);
    }

    const fishModal = document.getElementById('fishModal');
    if (fishModal) {
        fishModal.addEventListener('click', (e) => {
            const openBtn = e.target.closest('#open-gear-modal-btn');
            if (openBtn) {
                openGearSelectionModal();
            }
        });
    }

    const closeFishModalBtn = document.getElementById('close-fish-modal-btn');
    if (closeFishModalBtn) {
        closeFishModalBtn.addEventListener('click', closeFishModal);
    }

    // Search Modal Listeners
    const searchLogsBtn = document.getElementById('search-logs-btn');
    const searchModal = document.getElementById('searchModal');
    const closeSearchModal = document.getElementById('closeSearchModal');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    if (searchLogsBtn) {
        searchLogsBtn.addEventListener('click', () => openModalWithAnimation(searchModal));
    }

    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', () => closeModalWithAnimation(searchModal));
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeModalWithAnimation(searchModal);
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // Analytics Modal Listeners
    const analyticsBtn = document.getElementById('analytics-btn');
    const analyticsModal = document.getElementById('analyticsModal');
    const closeAnalyticsModal = document.getElementById('closeAnalyticsModal');

    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', async () => {
            try {
                const allTrips = await getAllData('trips');
                const allFish = await getAllData('fish_caught');

                if (allFish.length === 0) {
                    alert("No fish have been logged. Analytics requires catch data to be displayed.");
                    return;
                }

                const allWeather = await getAllData('weather_logs');
                openModalWithAnimation(analyticsModal);
                loadAnalytics(allTrips, allWeather, allFish);
            } catch (error) {
                console.error("Failed to load analytics:", error);
                alert("Could not load analytics data. Please check the console for errors.");
            }
        });
    }

    if (closeAnalyticsModal) {
        closeAnalyticsModal.addEventListener('click', () => closeModalWithAnimation(analyticsModal));
    }

    if (analyticsModal) {
        analyticsModal.addEventListener('click', (e) => {
            if (e.target === analyticsModal) {
                closeModalWithAnimation(analyticsModal);
            }
        });
    }

    const openTripLogBtn = document.getElementById('open-trip-log-btn');
    if (openTripLogBtn) {
        openTripLogBtn.addEventListener('click', showTripLogModal);
    }

    const tripLogModal = document.getElementById('tripLogModal');
    const closeTripLogModal = document.getElementById('closeTripLogModal');

    if (tripLogModal && closeTripLogModal) {
        closeTripLogModal.addEventListener('click', () => closeModalWithAnimation(tripLogModal));

        tripLogModal.addEventListener('click', (e) => {
            // Close if the backdrop is clicked, but not if an inner element is clicked
            if (e.target === tripLogModal) {
                closeModalWithAnimation(tripLogModal);
            }
        });

        tripLogModal.addEventListener('click', handleModalClicks);
    }
}

function updateCurrentMoonInfo() {
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const moonData = getMoonPhaseData(todayAtMidnight);
    const lunarPhase = lunarPhases[moonData.phaseIndex];
    currentMoonPhase.textContent = lunarPhase.name;
    currentMoonAge.textContent = `Moon age: ${moonData.moonAge.toFixed(1)} days`;
    currentMoonIllumination.textContent = `Illumination: ${(moonData.illumination * 100).toFixed(1)}%`;
    updateLocationDisplay();
}

function createBiteTimeElement(biteTime) {
    const biteElement = document.createElement('div');
    biteElement.className = 'bite-time-item';
    const fishIcon = document.createElement('i');
    fishIcon.className = 'fas fa-fish mr-2';
    fishIcon.style.color = biteQualityColors[biteTime.quality];
    const timeText = document.createElement('span');
    timeText.textContent = `${biteTime.start} - ${biteTime.end}`;
    biteElement.appendChild(fishIcon);
    biteElement.appendChild(timeText);
    return biteElement;
}

function checkIfTripsExist(date, callback) {
    if (!db) {
        callback(false);
        return;
    }
    const transaction = db.transaction(["trips"], "readonly");
    const objectStore = transaction.objectStore("trips");
    const index = objectStore.index("date");
    const request = index.count(date);

    request.onsuccess = () => {
        callback(request.result > 0);
    };
    request.onerror = (event) => {
        console.error("Error checking for trips:", event.target.error);
        callback(false);
    };
}

function updateOpenTripLogButton(dateStr) {
    checkIfTripsExist(dateStr, (tripsExist) => {
        const openTripLogBtn = document.getElementById('open-trip-log-btn');
        if (openTripLogBtn) {
            if (tripsExist) {
                openTripLogBtn.innerHTML = '<i class="fas fa-book-open mr-2"></i> View / Manage Trip Log';
            } else {
                openTripLogBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i> Create Trip Log';
            }
        }
    });
}

function showTripLogModal() {
    const tripLogModal = document.getElementById('tripLogModal');
    if (!tripLogModal) return;

    // Populate the trips for the currently selected day
    const dateStrForDisplay = `${modalCurrentYear}-${(modalCurrentMonth + 1).toString().padStart(2, '0')}-${modalCurrentDay.toString().padStart(2, '0')}`;
    displayTrips(dateStrForDisplay);

    openModalWithAnimation(tripLogModal);
}

// Generic modal handlers
function openModalWithAnimation(modal) {
    if (!modal) return;
    document.body.classList.add('modal-open');
    modal.classList.remove('hidden');
    setTimeout(() => { // Ensures display property is set before transition starts
        modal.classList.add('is-visible');
    }, 10);

    // Reset scroll position of the scrollable container inside the modal
    const scrollContainer = modal.querySelector('.overflow-y-auto');
    if (scrollContainer) {
        // Use setTimeout to ensure the element is visible and scrollable before resetting.
        setTimeout(() => {
            scrollContainer.scrollTop = 0;
        }, 0);
    }
}

function closeModalWithAnimation(modal) {
    if (!modal) return;
    document.body.classList.remove('modal-open');
    modal.classList.remove('is-visible');
    const onTransitionEnd = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.removeEventListener('transitionend', onTransitionEnd);
        }
    };
    modal.addEventListener('transitionend', onTransitionEnd);
}

function showModal(day, month, year) {
    clearTripForm(); // Reset the form every time the modal is shown or day is changed
    validateTripForm(); // Ensure button state is correct on modal open
    modalCurrentDay = day;
    modalCurrentMonth = month;
    modalCurrentYear = year;
    const dateObj = new Date(year, month, day);
    const moonData = getMoonPhaseData(dateObj);
    const lunarPhase = lunarPhases[moonData.phaseIndex];
    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[month].substring(0, 3);
    const dateStr = `${dayName} ${day} ${monthName}`;
    modalTitle.textContent = lunarPhase.name;
    modalSummary.textContent = lunarPhase.description;
    modalDate.textContent = dateStr;
    modalQuality.textContent = lunarPhase.quality;
    modalQuality.className = `inline-block px-2 py-1 rounded text-white text-sm font-bold mt-1 quality-${lunarPhase.quality.toLowerCase()}`;
    modalMoonAge.textContent = `Moon age: ${moonData.moonAge.toFixed(1)} days`;
    modalMoonIllumination.textContent = `Illumination: ${(moonData.illumination * 100).toFixed(1)}%`;

    const locationInput = document.getElementById('location-input');
    if (userLocation && userLocation.name) {
        locationInput.value = userLocation.name;
        setLocationAndFetchBiteTimes(userLocation.lat, userLocation.lon, userLocation.name);
    } else {
        majorBites.innerHTML = 'Enter a location to see bite times.';
        minorBites.innerHTML = '';
        if (locationInput) {
            locationInput.value = '';
        }
        // Clear weather forecast if no location is set
        const weatherContent = document.getElementById('weather-forecast-content');
        weatherContent.innerHTML = '<p>Enter a location to see the weather forecast.</p>';
        const sunMoonContent = document.getElementById('sun-moon-content');
        sunMoonContent.innerHTML = '<p>Enter a location to see sun and moon times.</p>';
    }

    const dateStrForDisplay = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    updateOpenTripLogButton(dateStrForDisplay);

    updateNavigationButtons();
    openModalWithAnimation(lunarModal);
}

function showPreviousDay() {
    const newDate = new Date(modalCurrentYear, modalCurrentMonth, modalCurrentDay - 1);
    showModal(newDate.getDate(), newDate.getMonth(), newDate.getFullYear());
}

function showNextDay() {
    const newDate = new Date(modalCurrentYear, modalCurrentMonth, modalCurrentDay + 1);
    showModal(newDate.getDate(), newDate.getMonth(), newDate.getFullYear());
}

function updateNavigationButtons() {
    // No longer disabling buttons to allow infinite scroll
    modalPrevDay.disabled = false;
    modalNextDay.disabled = false;
}

function hideModal() {
    closeModalWithAnimation(lunarModal);
    modalCurrentDay = null;
    modalCurrentMonth = null;
    modalCurrentYear = null;
}

async function renderCalendar() {
    const render = async () => {
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        calendarDays.innerHTML = '';

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const loggedDays = await getLoggedDaysForMonth(firstDayOfMonth, lastDayOfMonth);

        let firstDay = firstDayOfMonth.getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1; // Adjust to Monday start
        const daysInMonth = lastDayOfMonth.getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day';
            calendarDays.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day border-gray-200 dark:border-gray-700 border rounded flex flex-col items-center relative'; // Added relative positioning

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            const dateObj = new Date(currentYear, currentMonth, day);
            const moonData = getMoonPhaseData(dateObj);
            const lunarPhase = lunarPhases[moonData.phaseIndex];

            const qualityIndicator = document.createElement('div');
            qualityIndicator.className = `quality-indicator quality-${lunarPhase.quality.toLowerCase()}`;
            dayElement.appendChild(qualityIndicator);

            const qualityText = document.createElement('div');
            qualityText.className = 'quality-text';
            qualityText.textContent = lunarPhase.quality;
            dayElement.appendChild(qualityText);

            if (loggedDays.has(day)) {
                const logIndicator = document.createElement('span');
                logIndicator.className = 'log-indicator';
                logIndicator.innerHTML = '<i class="fas fa-fish"></i>';
                dayElement.appendChild(logIndicator);
            }

            if (currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() && day === new Date().getDate()) {
                dayElement.classList.add('ring-2', 'ring-blue-500');
            }

            dayElement.addEventListener('click', () => showModal(day, currentMonth, currentYear));
            calendarDays.appendChild(dayElement);
        }

        // Apply fade-in and clean up min-height
        calendarDays.classList.add('fade-in');
        calendarDays.addEventListener('animationend', () => {
            calendarDays.classList.remove('fade-in');
            calendarDays.style.minHeight = ''; // Clean up inline style
        }, { once: true });
    };

    // If the calendar already has children, fade out before re-rendering
    if (calendarDays.children.length > 0) {
        const currentHeight = calendarDays.offsetHeight;
        calendarDays.style.minHeight = `${currentHeight}px`; // Set fixed height
        calendarDays.classList.add('fade-out');

        calendarDays.addEventListener('animationend', async () => {
            calendarDays.classList.remove('fade-out');
            await render();
        }, { once: true });
    } else {
        // Initial render, just fade in
        await render();
    }
}

function exportData() {
    console.log("Exporting data...");
    const storesToExport = ["trips", "weather_logs", "fish_caught"];
    const exportData = {
        indexedDB: {},
        localStorage: {}
    };
    const transaction = db.transaction(storesToExport, "readonly");
    let promises = [];

    storesToExport.forEach(storeName => {
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        const promise = new Promise((resolve, reject) => {
            request.onsuccess = () => {
                exportData[storeName] = request.result;
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Error exporting from ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        });
        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        // Get data from localStorage
        exportData.localStorage.tacklebox = JSON.parse(localStorage.getItem('tacklebox') || '[]');
        exportData.localStorage.gearTypes = JSON.parse(localStorage.getItem('gearTypes') || '[]');

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "fishing_log_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        console.log("Data exported successfully.");
        alert("Data exported successfully.");
    }).catch(error => {
        console.error("Error during export:", error);
        alert("Could not export data. See console for details.");
    });
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const filename = file.name;
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const storesToImport = ["trips", "weather_logs", "fish_caught"];

            // Basic validation for the new structure
            if (typeof data !== 'object' || data === null || !data.indexedDB || !data.localStorage) {
                 throw new Error("Invalid data format: must contain 'indexedDB' and 'localStorage' properties.");
            }

            const confirmed = confirm(`Are you sure you want to import data from "${filename}"? This will overwrite ALL existing log data, including your tackle box.`);
            if (confirmed) {
                // Clear localStorage
                localStorage.removeItem('tacklebox');
                localStorage.removeItem('gearTypes');

                // Import localStorage data
                if (data.localStorage.tacklebox) {
                    localStorage.setItem('tacklebox', JSON.stringify(data.localStorage.tacklebox));
                }
                if (data.localStorage.gearTypes) {
                    localStorage.setItem('gearTypes', JSON.stringify(data.localStorage.gearTypes));
                }

                // Clear and import IndexedDB data
                console.log("Import confirmed. Clearing old IndexedDB data...");
                const transaction = db.transaction(storesToImport, "readwrite");
                let clearPromises = [];
                let totalImportCount = 0;

                storesToImport.forEach(storeName => {
                    const objectStore = transaction.objectStore(storeName);
                    const clearRequest = objectStore.clear();
                    const promise = new Promise((resolve, reject) => {
                        clearRequest.onsuccess = resolve;
                        clearRequest.onerror = reject;
                    });
                    clearPromises.push(promise);
                });

                Promise.all(clearPromises).then(() => {
                    console.log("Old IndexedDB data cleared. Starting import...");
                    const importTransaction = db.transaction(storesToImport, "readwrite");
                    const dbData = data.indexedDB;

                    storesToImport.forEach(storeName => {
                        const storeData = dbData[storeName];
                        if (storeData && Array.isArray(storeData)) {
                            const objectStore = importTransaction.objectStore(storeName);
                            storeData.forEach(item => {
                                objectStore.put(item);
                                totalImportCount++;
                            });
                        }
                    });

                    importTransaction.oncomplete = () => {
                        const message = `Successfully imported ${totalImportCount} log items and your tackle box from "${filename}".`;
                        console.log(message);
                        alert(message);
                        renderCalendar();
                        // Force reload to ensure all components are aware of the new data
                        window.location.reload();
                    };

                    importTransaction.onerror = (event) => {
                        console.error("Error during IndexedDB data import:", event.target.error);
                        alert("An error occurred during import. Data may be partially imported.");
                    };

                }).catch(error => {
                    console.error("Error clearing object stores:", error);
                    alert("Error clearing old data. Import aborted.");
                });
            }
        } catch (error) {
            console.error("Error parsing or processing import file:", error);
            alert(`Could not import data from "${filename}". The file may be corrupt or in the wrong format. Error: ${error.message}`);
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function openWeatherModal(tripId, weatherId = null) {
    const weatherModal = document.getElementById('weatherModal');
    const modalTitle = document.getElementById('weather-modal-title');
    currentEditingTripId = tripId;
    currentEditingWeatherId = weatherId;

    if (weatherId) {
        modalTitle.textContent = 'Edit Weather Log';
        const transaction = db.transaction(['weather_logs'], 'readonly');
        const store = transaction.objectStore('weather_logs');
        const request = store.get(weatherId);
        request.onsuccess = () => {
            const data = request.result;
            document.getElementById('weather-time-of-day').value = data.timeOfDay;
            document.getElementById('weather-sky').value = data.sky;
            document.getElementById('weather-wind-condition').value = data.windCondition;
            document.getElementById('weather-wind-direction').value = data.windDirection;
            document.getElementById('weather-water-temp').value = data.waterTemp;
            document.getElementById('weather-air-temp').value = data.airTemp;
        };
    } else {
        modalTitle.textContent = 'Add Weather Log';
        // Clear form fields
        document.getElementById('weather-time-of-day').value = '';
        document.getElementById('weather-sky').value = '';
        document.getElementById('weather-wind-condition').value = '';
        document.getElementById('weather-wind-direction').value = '';
        document.getElementById('weather-water-temp').value = '';
        document.getElementById('weather-air-temp').value = '';
    }

    openModalWithAnimation(weatherModal);
}

function closeWeatherModal() {
    closeModalWithAnimation(document.getElementById('weatherModal'));
    currentEditingTripId = null;
    currentEditingWeatherId = null;
}

function saveWeather() {
    if (!currentEditingTripId) return;

    const weatherData = {
        tripId: currentEditingTripId,
        timeOfDay: document.getElementById('weather-time-of-day').value,
        sky: document.getElementById('weather-sky').value,
        windCondition: document.getElementById('weather-wind-condition').value,
        windDirection: document.getElementById('weather-wind-direction').value,
        waterTemp: document.getElementById('weather-water-temp').value,
        airTemp: document.getElementById('weather-air-temp').value,
    };

    // Validation: Check if at least one field is filled
    const isDataPresent = weatherData.timeOfDay || weatherData.sky || weatherData.windCondition || weatherData.windDirection.trim() || weatherData.waterTemp.trim() || weatherData.airTemp.trim();
    if (!isDataPresent) {
        alert("Please fill in at least one weather detail to save the log.");
        return;
    }

    const transaction = db.transaction(['weather_logs'], 'readwrite');
    const store = transaction.objectStore('weather_logs');
    let request;

    if (currentEditingWeatherId) {
        weatherData.id = currentEditingWeatherId;
        request = store.put(weatherData);
    } else {
        request = store.add(weatherData);
    }

    request.onsuccess = () => {
        displayWeatherForTrip(currentEditingTripId);
        closeWeatherModal();
    };
    request.onerror = (event) => {
        console.error('Error saving weather data:', event.target.error);
    };
}

function displayWeatherForTrip(tripId) {
    const listEl = document.getElementById(`weather-list-${tripId}`);
    if (!listEl) {
        return;
    }

    const transaction = db.transaction(['weather_logs'], 'readonly');
    const store = transaction.objectStore('weather_logs');
    const index = store.index('tripId');
    const request = index.getAll(tripId);

    request.onsuccess = () => {
        const weatherLogs = request.result;
        listEl.innerHTML = ''; // Clear previous entries
        const addWeatherBtn = listEl.nextElementSibling; // The button is the next sibling

        if (weatherLogs.length > 0) {
            if(addWeatherBtn) addWeatherBtn.classList.add('hidden'); // Hide "Add Weather" button
            weatherLogs.forEach(log => {
                const weatherEl = document.createElement('div');
                weatherEl.className = 'text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded';
                let content = `<div class="font-semibold">${log.timeOfDay}</div>`;
                if(log.sky) content += `<div>Sky: ${log.sky}</div>`;
                if(log.windCondition) content += `<div>Wind: ${log.windCondition} ${log.windDirection || ''}</div>`;
                if(log.waterTemp) content += `<div>Water Temp: ${log.waterTemp}</div>`;
                if(log.airTemp) content += `<div>Air Temp: ${log.airTemp}</div>`;

                content += `
                    <div class="mt-2">
                        <button data-action="edit-weather" data-trip-id="${tripId}" data-weather-id="${log.id}" class="text-xs px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                        <button data-action="delete-weather" data-weather-id="${log.id}" data-trip-id="${tripId}" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                `;
                weatherEl.innerHTML = content;
                listEl.appendChild(weatherEl);
            });
        } else {
            if(addWeatherBtn) addWeatherBtn.classList.remove('hidden'); // Show "Add Weather" button
            listEl.innerHTML = '<p class="text-xs text-gray-500">No weather logs for this trip yet.</p>';
        }
    };
}

function deleteWeather(weatherId, tripId) {
    const transaction = db.transaction(['weather_logs'], 'readwrite');
    const store = transaction.objectStore('weather_logs');
    const request = store.delete(weatherId);
    request.onsuccess = () => {
        displayWeatherForTrip(tripId);
    };
    request.onerror = (event) => {
        console.error('Error deleting weather log:', event.target.error);
    };
}

function updateSelectedGearDisplay() {
    const displayEl = document.getElementById('selected-gear-display');
    if (displayEl) {
        if (tempSelectedGear && tempSelectedGear.length > 0) {
            displayEl.textContent = tempSelectedGear.join(', ');
        } else {
            displayEl.textContent = 'None selected';
        }
    }
}

function openFishModal(tripId, fishId = null) {
    const fishModal = document.getElementById('fishModal');
    const modalTitle = document.getElementById('fish-modal-title');
    const gearContainer = document.getElementById('fish-gear-container');
    gearContainer.innerHTML = ''; // Clear previous content

    currentEditingTripId = tripId;
    currentEditingFishId = fishId;
    tempSelectedGear = []; // Reset on open

    // --- New UI for gear selection ---
    const gearLabel = document.createElement('label');
    gearLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
    gearLabel.textContent = 'Gear / Lure Used';
    gearContainer.appendChild(gearLabel);

    const gearDisplayWrapper = document.createElement('div');
    gearDisplayWrapper.className = 'flex items-center space-x-2';

    const selectedGearDisplay = document.createElement('div');
    selectedGearDisplay.id = 'selected-gear-display';
    selectedGearDisplay.className = 'w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-sm min-h-[38px]';
    gearDisplayWrapper.appendChild(selectedGearDisplay);

    const openGearModalBtn = document.createElement('button');
    openGearModalBtn.type = 'button';
    openGearModalBtn.id = 'open-gear-modal-btn';
    openGearModalBtn.textContent = 'Select...';
    openGearModalBtn.className = 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition';
    gearDisplayWrapper.appendChild(openGearModalBtn);

    gearContainer.appendChild(gearDisplayWrapper);
    // --- End of new UI ---

    // Add a text input for bait/lure not in tacklebox
    const baitInput = document.createElement('input');
    baitInput.type = 'text';
    baitInput.id = 'fish-bait';
    baitInput.placeholder = 'Other Bait/Lure (e.g., live bait)';
    baitInput.className = 'w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 mt-2';
    gearContainer.appendChild(baitInput);

    if (fishId) {
        modalTitle.textContent = 'Edit Fish';
        const transaction = db.transaction(['fish_caught'], 'readonly');
        const store = transaction.objectStore('fish_caught');
        const request = store.get(fishId);
        request.onsuccess = () => {
            const data = request.result;
            if (!data) return;

            document.getElementById('fish-species').value = data.species || '';
            document.getElementById('fish-length').value = data.length || '';
            document.getElementById('fish-weight').value = data.weight || '';
            document.getElementById('fish-time').value = data.time || '';
            document.getElementById('fish-details').value = data.details || '';

            const gearUsed = data.gear || (data.bait ? [data.bait] : []);
            const tacklebox = JSON.parse(localStorage.getItem('tacklebox') || '[]');
            const tackleboxGearNames = new Set(tacklebox.map(g => g.name));
            const customBaits = [];

            gearUsed.forEach(gearName => {
                if (tackleboxGearNames.has(gearName)) {
                    tempSelectedGear.push(gearName);
                } else {
                    customBaits.push(gearName);
                }
            });

            updateSelectedGearDisplay();

            const otherBaitInput = document.getElementById('fish-bait');
            if (otherBaitInput) {
                otherBaitInput.value = customBaits.join(', ');
            }
        };
    } else {
        modalTitle.textContent = 'Add Fish';
        document.getElementById('fish-species').value = '';
        document.getElementById('fish-length').value = '';
        document.getElementById('fish-weight').value = '';
        document.getElementById('fish-time').value = '';
        document.getElementById('fish-details').value = '';
        updateSelectedGearDisplay();
    }

    openModalWithAnimation(fishModal);
}

function closeFishModal() {
    closeModalWithAnimation(document.getElementById('fishModal'));
    currentEditingTripId = null;
    currentEditingFishId = null;
}

function openGearSelectionModal() {
    const gearModal = document.getElementById('gearSelectionModal');
    const checklistContainer = document.getElementById('gear-checklist-container');
    checklistContainer.innerHTML = ''; // Clear old content

    const tacklebox = JSON.parse(localStorage.getItem('tacklebox') || '[]');
    tacklebox.sort((a, b) => a.name.localeCompare(b.name));

    const gearUsedSet = new Set(tempSelectedGear);

    if (tacklebox.length > 0) {
        tacklebox.forEach(gear => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center gear-item'; // Add a class for searching

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `gear-select-${gear.id}`;
            checkbox.name = 'gear-selection';
            checkbox.value = gear.name;
            checkbox.className = 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600';
            if (gearUsedSet.has(gear.name)) {
                checkbox.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `gear-select-${gear.id}`;
            label.className = 'ml-2 block text-sm text-gray-900 dark:text-gray-300';

            const details = [];
            if (gear.brand) details.push(gear.brand);
            if (gear.type) details.push(gear.type);
            if (gear.color) details.push(gear.color);
            let displayText = gear.name;
            if (details.length > 0) {
                displayText += ` (${details.join(', ')})`;
            }
            label.textContent = displayText;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            checklistContainer.appendChild(itemDiv);
        });
    } else {
        checklistContainer.innerHTML = '<p class="text-sm text-gray-500">Your tackle box is empty. Add items in the Tackle Box section.</p>';
    }

    openModalWithAnimation(gearModal);
}

function saveFish() {
    if (!currentEditingTripId) return;

    // The tacklebox gear is already in `tempSelectedGear` from the modal selection
    const finalGear = [...tempSelectedGear];

    // Get value from the "other bait" text input and add it
    const otherBaitInput = document.getElementById('fish-bait');
    const otherBaitValue = otherBaitInput ? otherBaitInput.value.trim() : '';
    if (otherBaitValue) {
        finalGear.push(otherBaitValue);
    }

    const fishData = {
        tripId: currentEditingTripId,
        species: document.getElementById('fish-species').value,
        gear: finalGear,
        length: document.getElementById('fish-length').value,
        weight: document.getElementById('fish-weight').value,
        time: document.getElementById('fish-time').value,
        details: document.getElementById('fish-details').value,
    };

    if (!fishData.species) {
        alert("Please enter a species for the fish.");
        return;
    }

    const transaction = db.transaction(['fish_caught'], 'readwrite');
    const store = transaction.objectStore('fish_caught');
    let request;

    if (currentEditingFishId) {
        fishData.id = currentEditingFishId;
        request = store.put(fishData);
    } else {
        request = store.add(fishData);
    }

    request.onsuccess = () => {
        displayFishForTrip(currentEditingTripId);
        closeFishModal();
    };
    request.onerror = (event) => {
        console.error('Error saving fish data:', event.target.error);
    };
}

function updateFishCountForTrip(tripId) {
    const countEl = document.getElementById(`fish-count-${tripId}`);
    if (!countEl) return;

    const transaction = db.transaction(['fish_caught'], 'readonly');
    const store = transaction.objectStore('fish_caught');
    const index = store.index('tripId');
    const request = index.count(tripId);

    request.onsuccess = () => {
        countEl.textContent = request.result;
    };
    request.onerror = (event) => {
        console.error('Error counting fish:', event.target.error);
        countEl.textContent = 'N/A';
    };
}

function displayFishForTrip(tripId) {
    const listEl = document.getElementById(`fish-list-${tripId}`);
    if (!listEl) return;

    const transaction = db.transaction(['fish_caught'], 'readonly');
    const store = transaction.objectStore('fish_caught');
    const index = store.index('tripId');
    const request = index.getAll(tripId);

    request.onsuccess = () => {
        const fishLogs = request.result;
        listEl.innerHTML = '';
        if (fishLogs.length > 0) {
            fishLogs.forEach(log => {
                const fishEl = document.createElement('div');
                fishEl.className = 'text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded';
                let content = `<div class="font-semibold">${log.species}</div>`;
                let sizeParts = [];
                if (log.length) sizeParts.push(log.length);
                if (log.weight) sizeParts.push(log.weight);
                if (sizeParts.length > 0) {
                    content += `<div>${sizeParts.join(' / ')}</div>`;
                }
                if (log.gear && Array.isArray(log.gear) && log.gear.length > 0) {
                    content += `<div>Bait/Lure: ${log.gear.join(', ')}</div>`;
                } else if (log.bait) { // Backward compatibility
                    content += `<div>Bait/Lure: ${log.bait}</div>`;
                }
                if(log.time) content += `<div>Time: ${log.time}</div>`;
                if(log.details) content += `<div>Details: ${log.details}</div>`;

                content += `
                    <div class="mt-2">
                        <button data-action="edit-fish" data-trip-id="${tripId}" data-fish-id="${log.id}" class="text-xs px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                        <button data-action="delete-fish" data-fish-id="${log.id}" data-trip-id="${tripId}" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                `;
                fishEl.innerHTML = content;
                listEl.appendChild(fishEl);
            });
        } else {
            listEl.innerHTML = '<p class="text-xs text-gray-500">No fish logged for this trip yet.</p>';
        }
        updateFishCountForTrip(tripId);
    };
}

function deleteFish(fishId, tripId) {
    const transaction = db.transaction(['fish_caught'], 'readwrite');
    const store = transaction.objectStore('fish_caught');
    const request = store.delete(fishId);
    request.onsuccess = () => {
        displayFishForTrip(tripId);
    };
    request.onerror = (event) => {
        console.error('Error deleting fish log:', event.target.error);
    };
}

function getLoggedDaysForMonth(startDate, endDate) {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.warn("DB not initialized, resolving with empty set.");
            resolve(new Set());
            return;
        }
        const transaction = db.transaction(["trips"], "readonly");
        const objectStore = transaction.objectStore("trips");
        const index = objectStore.index("date");

        const start = startDate.toISOString().slice(0, 10);
        const end = endDate.toISOString().slice(0, 10);
        const range = IDBKeyRange.bound(start, end);

        const request = index.getAll(range);
        const loggedDays = new Set();

        request.onsuccess = () => {
            request.result.forEach(log => {
                // Manually parse the date string to avoid timezone issues.
                // log.date is 'YYYY-MM-DD'. We want the DD part.
                const day = parseInt(log.date.split('-')[2], 10);
                loggedDays.add(day);
            });
            resolve(loggedDays);
        };

        request.onerror = (event) => {
            console.error("Error fetching logged days for month:", event.target.error);
            reject(event.target.error);
        };
    });
}

function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("DB not initialized");
            return;
        }
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

let activeCharts = {};

function destroyActiveCharts() {
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};
}

function loadAnalytics(allTrips, allWeather, allFish) {
    destroyActiveCharts(); // Clear previous charts

    // 1. Performance by Moon Phase
    const fishCountByTrip = allFish.reduce((acc, fish) => {
        acc[fish.tripId] = (acc[fish.tripId] || 0) + 1;
        return acc;
    }, {});

    const totalFish = Object.values(fishCountByTrip).reduce((sum, count) => sum + count, 0);
    const moonPhaseChartEl = document.getElementById('moon-phase-chart');
    const moonPhaseSection = moonPhaseChartEl.parentElement;

    if (totalFish > 0) {
        moonPhaseSection.style.display = '';
    } else {
        moonPhaseSection.style.display = 'none';
    }

    const moonPhaseData = {};
    allTrips.forEach(trip => {
        const dateParts = trip.date.split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const moonPhase = lunarPhases[getMoonPhaseData(date).phaseIndex].name;
        const fishCount = fishCountByTrip[trip.id] || 0;
        if (moonPhaseData[moonPhase]) {
            moonPhaseData[moonPhase].trips++;
            moonPhaseData[moonPhase].fish += fishCount;
        } else {
            moonPhaseData[moonPhase] = { trips: 1, fish: fishCount };
        }
    });

    const moonLabels = Object.keys(moonPhaseData);
    const avgFishPerTrip = moonLabels.map(phase => {
        const data = moonPhaseData[phase];
        return data.trips > 0 ? (data.fish / data.trips).toFixed(2) : 0;
    });

    const moonPhaseCtx = document.getElementById('moon-phase-chart').getContext('2d');
    activeCharts.moonPhase = new Chart(moonPhaseCtx, {
        type: 'bar',
        data: {
            labels: moonLabels,
            datasets: [{
                label: 'Average Fish Per Trip',
                data: avgFishPerTrip,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    // 2. Catch Breakdown
    const speciesData = {};
    const locationData = {};
    allFish.forEach(fish => {
        // Species
        const species = fish.species || 'Unknown';
        speciesData[species] = (speciesData[species] || 0) + 1;
        // Location
        const trip = allTrips.find(t => t.id === fish.tripId);
        if (trip) {
            const location = trip.location || 'Unknown';
            locationData[location] = (locationData[location] || 0) + 1;
        }
    });

    const speciesChartEl = document.getElementById('species-chart');
    const speciesChartParent = speciesChartEl.parentElement;
    const speciesKeys = Object.keys(speciesData);
    let isSpeciesDataAvailable = true;

    if (speciesKeys.length === 0 || (speciesKeys.length === 1 && speciesKeys[0] === 'Unknown')) {
        speciesChartParent.style.display = 'none';
        isSpeciesDataAvailable = false;
    } else {
        speciesChartParent.style.display = '';
        const speciesCtx = speciesChartEl.getContext('2d');
        activeCharts.species = new Chart(speciesCtx, {
            type: 'pie',
            data: {
                labels: speciesKeys,
                datasets: [{
                    data: Object.values(speciesData),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            }
        });
    }

    const locationChartEl = document.getElementById('location-chart');
    const locationChartParent = locationChartEl.parentElement;
    const locationKeys = Object.keys(locationData);
    let isLocationDataAvailable = true;

    if (locationKeys.length === 0 || (locationKeys.length === 1 && locationKeys[0] === 'Unknown')) {
        locationChartParent.style.display = 'none';
        isLocationDataAvailable = false;
    } else {
        locationChartParent.style.display = '';
        const locationCtx = locationChartEl.getContext('2d');
        activeCharts.location = new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: locationKeys,
                datasets: [{
                    label: 'Fish Caught',
                    data: Object.values(locationData),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }


    // Weather Breakdown
    const weatherData = {};
    allWeather.forEach(weather => {
        const condition = weather.sky || 'Unknown';
        const tripFish = allFish.filter(f => f.tripId === weather.tripId).length;
        if(tripFish > 0) { // Only count conditions where fish were caught
             weatherData[condition] = (weatherData[condition] || 0) + tripFish;
        }
    });

    const weatherChartEl = document.getElementById('weather-chart');
    const weatherChartParent = weatherChartEl.parentElement;
    const weatherKeys = Object.keys(weatherData);
    let isWeatherDataAvailable = true;

    if (weatherKeys.length === 0 || (weatherKeys.length === 1 && weatherKeys[0] === 'Unknown')) {
        weatherChartParent.style.display = 'none';
        isWeatherDataAvailable = false;
    } else {
        weatherChartParent.style.display = '';
        const weatherCtx = weatherChartEl.getContext('2d');
        activeCharts.weather = new Chart(weatherCtx, {
            type: 'bar',
            data: {
                labels: weatherKeys,
                datasets: [{
                    label: 'Total Fish Caught',
                    data: Object.values(weatherData),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    // Gear Breakdown
    const gearData = {};
    allFish.forEach(fish => {
        if (fish.gear && fish.gear.length > 0) {
            fish.gear.forEach(gearName => {
                const name = gearName || 'Unknown';
                gearData[name] = (gearData[name] || 0) + 1;
            });
        }
    });

    const gearChartEl = document.getElementById('gear-chart');
    const gearChartParent = gearChartEl.parentElement;
    const gearKeys = Object.keys(gearData);
    let isGearDataAvailable = true;

    if (gearKeys.length === 0 || (gearKeys.length === 1 && gearKeys[0] === 'Unknown')) {
        gearChartParent.style.display = 'none';
        isGearDataAvailable = false;
    } else {
        gearChartParent.style.display = '';
        const gearCtx = gearChartEl.getContext('2d');
        activeCharts.gear = new Chart(gearCtx, {
            type: 'pie',
            data: {
                labels: gearKeys,
                datasets: [{
                    data: Object.values(gearData),
                    backgroundColor: ['#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#FF6384'],
                }]
            }
        });
    }

    // Hide the entire "Catch Breakdown" section if no data is available for any chart
    const catchBreakdownSection = document.getElementById('catch-breakdown-section');
    if (!isSpeciesDataAvailable && !isLocationDataAvailable && !isWeatherDataAvailable && !isGearDataAvailable) {
        catchBreakdownSection.style.display = 'none';
    } else {
        catchBreakdownSection.style.display = '';
    }


    // 3. Personal Bests
    const bestFishEl = document.getElementById('personal-best-fish');
    const bestTripEl = document.getElementById('personal-best-trip');
    const personalBestsSection = bestFishEl.parentElement.parentElement;

    let largestFish = null;
    allFish.forEach(fish => {
        const weight = parseFloat(fish.weight) || 0;
        const length = parseFloat(fish.length) || 0;
        if (weight > 0 || length > 0) {
            if (!largestFish || weight > (parseFloat(largestFish.weight) || 0) || (weight === (parseFloat(largestFish.weight) || 0) && length > (parseFloat(largestFish.length) || 0))) {
                largestFish = fish;
            }
        }
    });

    let mostFishTrip = null;
    let maxFish = 0;
    allTrips.forEach(trip => {
        const total = fishCountByTrip[trip.id] || 0;
        if (total > 0 && total > maxFish) {
            maxFish = total;
            mostFishTrip = trip;
        }
    });

    if (largestFish) {
        bestFishEl.innerHTML = `
            <p class="font-bold text-lg">Largest Fish</p>
            <p>${largestFish.species} (${largestFish.weight || 'N/A'}, ${largestFish.length || 'N/A'})</p>
        `;
        bestFishEl.style.display = '';
    } else {
        bestFishEl.style.display = 'none';
    }

    if (mostFishTrip) {
        const fishCount = fishCountByTrip[mostFishTrip.id] || 0;
        bestTripEl.innerHTML = `
            <p class="font-bold text-lg">Most Fish in a Trip</p>
            <p>${fishCount} fish on ${mostFishTrip.date}</p>
        `;
        bestTripEl.style.display = '';
    } else {
        bestTripEl.style.display = 'none';
    }

    if (largestFish || mostFishTrip) {
        personalBestsSection.style.display = '';
    } else {
        personalBestsSection.style.display = 'none';
    }
}

async function performSearch(query) {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    const lowerCaseQuery = query.toLowerCase().trim();

    if (!lowerCaseQuery) {
        resultsContainer.innerHTML = '<p>Enter a search term to find your catches.</p>';
        return;
    }

    try {
        const allTrips = await getAllData('trips');
        const allFish = await getAllData('fish_caught');

        const tripsMap = new Map(allTrips.map(trip => [trip.id, trip]));

        const monthNames = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];

        const searchMonthIndex = monthNames.indexOf(lowerCaseQuery);

        const results = allFish.map(fish => {
            const trip = tripsMap.get(fish.tripId);
            return { ...fish, trip };
        }).filter(({ trip, species, bait, details }) => {
            if (!trip) return false;

            // Check for month match
            if (searchMonthIndex > -1) {
                const tripMonth = parseInt(trip.date.split('-')[1], 10) - 1;
                return tripMonth === searchMonthIndex;
            }

            // Check other text fields
            const searchableText = [
                species,
                bait,
                details,
                trip.water,
                trip.location,
                trip.notes
            ].join(' ').toLowerCase();

            return searchableText.includes(lowerCaseQuery);
        });

        displaySearchResults(results);

    } catch (error) {
        console.error("Error during search:", error);
        resultsContainer.innerHTML = '<p class="text-red-500">Error performing search. See console for details.</p>';
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results-container');
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No matching catches found.</p>';
        return;
    }

    resultsContainer.innerHTML = ''; // Clear previous results

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    results.forEach(fish => {
        const trip = fish.trip;
        if (!trip) return;

        const resultEl = document.createElement('div');
        resultEl.className = 'p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow';

        // Dates are stored as YYYY-MM-DD, need to parse carefully to avoid timezone issues
        const dateParts = trip.date.split('-');
        const tripDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const formattedDate = `${tripDate.getDate()} ${monthNames[tripDate.getMonth()]} ${tripDate.getFullYear()}`;

        let content = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-lg">${fish.species}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${trip.water || 'N/A'} - ${trip.location || 'N/A'}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Caught on: ${formattedDate}</p>
                </div>
                <div class="text-right">
                    ${fish.length ? `<span class="text-sm">Length: ${fish.length}</span>` : ''}
                    ${fish.weight ? `<span class="text-sm ml-2">Weight: ${fish.weight}</span>` : ''}
                </div>
            </div>
            <div class="mt-2 text-sm">
                ${fish.bait ? `<p><strong>Bait/Lure:</strong> ${fish.bait}</p>` : ''}
                ${fish.time ? `<p><strong>Time:</strong> ${fish.time}</p>` : ''}
                ${fish.details ? `<p><strong>Details:</strong> ${fish.details}</p>` : ''}
            </div>
        `;
        resultEl.innerHTML = content;
        resultsContainer.appendChild(resultEl);
    });
}

document.addEventListener('DOMContentLoaded', initCalendar);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
