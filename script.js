var SunCalc = (function() {
    'use strict';

    // shortcuts for easier to read formulas

    const PI   = Math.PI,
        sin  = Math.sin,
        cos  = Math.cos,
        tan  = Math.tan,
        asin = Math.asin,
        atan = Math.atan2,
        acos = Math.acos,
        rad  = PI / 180;

    // sun calculations are based on https://aa.quae.nl/en/reken/zonpositie.html formulas

    // date/time constants and conversions

    const dayMs = 1000 * 60 * 60 * 24,
        J1970 = 2440588,
        J2000 = 2451545;

    function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
    function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
    function toDays(date)   { return toJulian(date) - J2000; }


    // general calculations for position

    const e = rad * 23.4397; // obliquity of the Earth

    function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
    function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

    function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
    function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

    function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

    function astroRefraction(h) {
        if (h < 0) h = 0;
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }

    // general sun calculations

    function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

    function eclipticLongitude(M) {
        const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
        const P = rad * 102.9372;
        return M + C + P + PI;
    }

    function sunCoords(d) {
        const M = solarMeanAnomaly(d),
            L = eclipticLongitude(M);
        return {
            dec: declination(L, 0),
            ra: rightAscension(L, 0)
        };
    }

    var SunCalc = {};

    function getPosition(date, lat, lng) {
        const lw  = rad * -lng,
            phi = rad * lat,
            d   = toDays(date),
            c  = sunCoords(d),
            H  = siderealTime(d, lw) - c.ra;
        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: altitude(H, phi, c.dec)
        };
    };

    const times = [
        [-0.833, 'sunrise',       'sunset'      ],
        [-0.3,   'sunriseEnd',    'sunsetStart' ],
        [-6,     'dawn',          'dusk'        ],
        [-12,    'nauticalDawn',  'nauticalDusk'],
        [-18,    'nightEnd',      'night'       ],
        [6,      'goldenHourEnd', 'goldenHour'  ]
    ];

    const J0 = 0.0009;

    function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }
    function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
    function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }
    function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
    function observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }

    function getSetJ(h, lw, phi, dec, n, M, L) {
        const w = hourAngle(h, phi, dec),
            a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L);
    }

    function getTimes(date, lat, lng, height) {
        height = height || 0;
        const lw = rad * -lng,
            phi = rad * lat,
            dh = observerAngle(height),
            d = toDays(date),
            n = julianCycle(d, lw),
            ds = approxTransit(0, lw, n),
            M = solarMeanAnomaly(ds),
            L = eclipticLongitude(M),
            dec = declination(L, 0),
            Jnoon = solarTransitJ(ds, M, L);
        const result = {
            solarNoon: fromJulian(Jnoon),
            nadir: fromJulian(Jnoon - 0.5)
        };
        for (let i = 0, len = times.length; i < len; i += 1) {
            const time = times[i];
            const h0 = (time[0] + dh) * rad;
            const Jset = getSetJ(h0, lw, phi, dec, n, M, L);
            const Jrise = Jnoon - (Jset - Jnoon);
            result[time[1]] = fromJulian(Jrise);
            result[time[2]] = fromJulian(Jset);
        }
        return result;
    };

    function moonCoords(d) {
        const L = rad * (218.316 + 13.176396 * d),
            M = rad * (134.963 + 13.064993 * d),
            F = rad * (93.272 + 13.229350 * d),
            l  = L + rad * 6.289 * sin(M),
            b  = rad * 5.128 * sin(F),
            dt = 385001 - 20905 * cos(M);
        return {
            ra: rightAscension(l, b),
            dec: declination(l, b),
            dist: dt
        };
    }

    function getMoonPosition(date, lat, lng) {
        const lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),
            c = moonCoords(d),
            H = siderealTime(d, lw) - c.ra;
        let h = altitude(H, phi, c.dec);
        const pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
        h = h + astroRefraction(h);
        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: h,
            distance: c.dist,
            parallacticAngle: pa
        };
    };

    function getMoonIllumination(date) {
        const d = toDays(date || new Date()),
            s = sunCoords(d),
            m = moonCoords(d),
            sdist = 149598000,
            phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
            inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
            angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
        return {
            fraction: (1 + cos(inc)) / 2,
            phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
            angle: angle
        };
    };

    function hoursLater(date, h) {
        return new Date(date.valueOf() + h * dayMs / 24);
    }

    function getMoonTimes(date, lat, lng, inUTC) {
        const t = new Date(date);
        if (inUTC) t.setUTCHours(0, 0, 0, 0);
        else t.setHours(0, 0, 0, 0);

        const hc = 0.133 * rad;
        let h0 = getMoonPosition(t, lat, lng).altitude - hc,
            rise, set, ye;

        for (let i = 1; i <= 24; i += 2) {
            const h1 = getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
            const h2 = getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;
            const a = (h0 + h2) / 2 - h1;
            const b = (h2 - h0) / 2;
            const xe = -b / (2 * a);
            const ye = (a * xe + b) * xe + h1;
            const d = b * b - 4 * a * h1;
            let roots = 0, x1, x2;
            if (d >= 0) {
                const dx = Math.sqrt(d) / (2 * a);
                x1 = xe - dx;
                x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2;
            }
            if (roots === 1) {
                if (h0 < 0) rise = i + x1;
                else set = i + x1;
            } else if (roots === 2) {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2);
            }
            if (rise && set) break;
            h0 = h2;
        }
        const result = {};
        if (rise) result.rise = hoursLater(t, rise);
        if (set) result.set = hoursLater(t, set);
        if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;
        return result;
    };

    return {
        getPosition,
        getTimes,
        getMoonPosition,
        getMoonIllumination,
        getMoonTimes
    };
})();

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

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let modalCurrentDay = null;
let modalCurrentMonth = null;
let modalCurrentYear = null;

const calendarDays = document.getElementById('calendarDays');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const lunarModal = document.getElementById('lunarModal');
const closeModal = document.getElementById('closeModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalQuality = document.getElementById('modalQuality');
const modalMoonAge = document.getElementById('modalMoonAge');
const modalMoonIllumination = document.getElementById('modalMoonIllumination');
const modalDescription = document.getElementById('modalDescription');
const majorBites = document.getElementById('majorBites');
const minorBites = document.getElementById('minorBites');
const modalPrevDay = document.getElementById('modalPrevDay');
const modalNextDay = document.getElementById('modalNextDay');
const currentMoonPhase = document.getElementById('currentMoonPhase');
const currentMoonAge = document.getElementById('currentMoonAge');
const currentMoonIllumination = document.getElementById('currentMoonIllumination');

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

function clearTripForm() {
    document.getElementById('trip-water').value = '';
    document.getElementById('trip-location').value = '';
    document.getElementById('trip-hours').value = '';
    document.getElementById('trip-total-fish').value = '';
    document.getElementById('trip-companions').value = '';
    document.getElementById('trip-best-times').value = '';
    currentTripId = null;
    document.getElementById('trip-form-title').textContent = 'Log a New Trip';
    document.getElementById('save-trip-btn').textContent = 'Save Trip';
    document.getElementById('cancel-edit-trip-btn').classList.add('hidden');
}

function saveTrip() {
    const date = `${modalCurrentYear}-${(modalCurrentMonth + 1).toString().padStart(2, '0')}-${modalCurrentDay.toString().padStart(2, '0')}`;
    const tripData = {
        date: date,
        water: document.getElementById('trip-water').value,
        location: document.getElementById('trip-location').value,
        hours: document.getElementById('trip-hours').value,
        totalFish: document.getElementById('trip-total-fish').value,
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
                tripEl.innerHTML = `
                    <div class="font-bold text-base mb-2">${trip.water} - ${trip.location}</div>
                    <p><strong>Hours Fished:</strong> ${trip.hours || 'N/A'}</p>
                    <p><strong>Total Fish Caught:</strong> ${trip.totalFish || 'N/A'}</p>
                    <p><strong>Fished With:</strong> ${trip.companions || 'N/A'}</p>
                    <p><strong>Notes:</strong> ${trip.notes || 'N/A'}</p>
                    <div class="mt-3">
                        <button onclick="editTrip(${trip.id})" class="text-xs px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                        <button onclick="deleteTrip(${trip.id})" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                `;
                tripLogList.appendChild(tripEl);
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
        document.getElementById('trip-total-fish').value = trip.totalFish;
        document.getElementById('trip-companions').value = trip.companions;
        document.getElementById('trip-best-times').value = trip.notes;

        currentTripId = id;
        document.getElementById('trip-form-title').textContent = 'Editing Trip';
        document.getElementById('save-trip-btn').textContent = 'Update Trip';
        document.getElementById('cancel-edit-trip-btn').classList.remove('hidden');
    };
}

function deleteTrip(id) {
    const transaction = db.transaction(["trips"], "readwrite");
    const objectStore = transaction.objectStore("trips");

    const getRequest = objectStore.get(id);
    getRequest.onsuccess = () => {
        const dateToDelete = getRequest.result.date;
        const deleteRequest = objectStore.delete(id);
        deleteRequest.onsuccess = () => {
            console.log("Trip deleted successfully.");
            displayTrips(dateToDelete);
            renderCalendar();
        };
    };
}

function initCalendar() {
    loadLocation();
    setupEventListeners();
    setupTheme();
    initDB(() => {
        renderCalendar();
        updateCurrentMoonInfo();
    });
}

function setupEventListeners() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }

    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
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
    modalCloseBtn.addEventListener('click', hideModal);
    lunarModal.addEventListener('click', (e) => {
        if (e.target === lunarModal) hideModal();
    });
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
}

function updateCurrentMoonInfo() {
    const moonData = getMoonPhaseData(new Date());
    const lunarPhase = lunarPhases[moonData.phaseIndex];
    currentMoonPhase.textContent = lunarPhase.name;
    currentMoonAge.textContent = `Moon age: ${moonData.moonAge.toFixed(1)} days`;
    currentMoonIllumination.textContent = `Illumination: ${(moonData.illumination * 100).toFixed(1)}%`;
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

function showModal(day, month, year) {
    clearTripForm(); // Reset the form every time the modal is shown or day is changed
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
    modalDate.textContent = dateStr;
    modalQuality.textContent = lunarPhase.quality;
    modalQuality.className = `inline-block px-2 py-1 rounded text-white text-sm font-bold mt-1 quality-${lunarPhase.quality.toLowerCase()}`;
    modalMoonAge.textContent = `Moon age: ${moonData.moonAge.toFixed(1)} days`;
    modalMoonIllumination.textContent = `Illumination: ${(moonData.illumination * 100).toFixed(1)}%`;
    modalDescription.textContent = lunarPhase.description;

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
    }

    const dateStrForDisplay = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    displayTrips(dateStrForDisplay);
    updateNavigationButtons();
    lunarModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
    lunarModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    modalCurrentDay = null;
    modalCurrentMonth = null;
    modalCurrentYear = null;
}

async function renderCalendar() {
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
}

function exportData() {
    console.log("Exporting data...");
    const transaction = db.transaction(["trips"], "readonly");
    const objectStore = transaction.objectStore("trips");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const data = request.result;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "fishing_log_export.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        console.log("Data exported successfully.");
    };

    request.onerror = (event) => {
        console.error("Error exporting data:", event.target.error);
        alert("Could not export data. See console for details.");
    };
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const filename = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) {
                throw new Error("Invalid data format: not an array.");
            }

            const confirmed = confirm(`Are you sure you want to import data from "${filename}"? This will overwrite all existing catch log data.`);
            if (confirmed) {
                console.log("Import confirmed. Clearing old data...");
                const transaction = db.transaction(["trips"], "readwrite");
                const objectStore = transaction.objectStore("trips");
                const clearRequest = objectStore.clear();

                clearRequest.onsuccess = () => {
                    console.log("Old data cleared. Starting import...");
                    let importCount = 0;
                    data.forEach(item => {
                        // Ensure 'id' is not carried over if it exists in the JSON
                        delete item.id;
                        const addRequest = objectStore.add(item);
                        addRequest.onsuccess = () => {
                            importCount++;
                        };
                    });

                    transaction.oncomplete = () => {
                        const message = `Successfully imported ${importCount} items from "${filename}".`;
                        console.log(message);
                        alert(message);
                        renderCalendar(); // Re-render calendar to show new log indicators
                        // Since many dates could be affected, just close the modal
                        if (!lunarModal.classList.contains('hidden')) {
                            hideModal();
                        }
                        document.getElementById('settingsModal').classList.add('hidden');
                    };
                };

                clearRequest.onerror = (event) => {
                    console.error("Error clearing object store:", event.target.error);
                    alert("Error clearing old data. Import aborted.");
                };
            }
        } catch (error) {
            console.error("Error parsing or processing import file:", error);
            alert(`Could not import data from "${filename}". The file may be corrupt or in the wrong format.`);
        } finally {
            // Reset file input so the same file can be chosen again
            event.target.value = '';
        }
    };
    reader.readAsText(file);
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
