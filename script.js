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
    { name: "Whiro", quality: "Poor", description: "The new moon. An unfavourable day for fishing." },
    { name: "Tirea", quality: "Average", description: "The moon is a sliver. A reasonably good day for crayfishing." },
    { name: "Hoata", quality: "Excellent", description: "A very good day for eeling and crayfishing." },
    { name: "Oue", quality: "Good", description: "A good day for planting and fishing." },
    { name: "Okoro", quality: "Good", description: "Another good day for planting and fishing." },
    { name: "Tamatea-a-hotu", quality: "Average", description: "A day for planting. Fishing is average." },
    { name: "Tamatea-a-ngana", quality: "Good", description: "A good day for fishing, but the weather can be unpredictable." },
    { name: "Tamatea-whakapau", quality: "Poor", description: "Not a good day for fishing." },
    { name: "Huna", quality: "Poor", description: "Means 'to hide'. Not a good day for fishing." },
    { name: "Ari", quality: "Poor", description: "A disagreeable day. Unproductive." },
    { name: "Hotu", quality: "Excellent", description: "The moon is bright and nearing full. A very good time for night fishing." },
    { name: "Mawharu", quality: "Good", description: "A most favourable day for planting food and a good day for fishing." },
    { name: "Atua", quality: "Poor", description: "Not a good day for planting or fishing." },
    { name: "Ohua", quality: "Excellent", description: "The moon is nearly full. One of the best nights for fishing." },
    { name: "Oanui", quality: "Good", description: "The day of the full moon. Good for fishing." },
    { name: "Oturu", quality: "Good", description: "A good day for fishing and a very good day for eeling." },
    { name: "Rakau-nui", quality: "Good", description: "A very good day for fishing." },
    { name: "Rakau-matohi", quality: "Good", description: "A fine day for fishing." },
    { name: "Takirau", quality: "Average", description: "Fine weather in the morning. Fishing is average." },
    { name: "Oike", quality: "Average", description: "The afternoon is favourable for fishing." },
    { name: "Korekore-te-whiwhia", quality: "Poor", description: "A bad day for fishing." },
    { name: "Korekore-te-rawea", quality: "Poor", description: "Another bad day for fishing." },
    { name: "Korekore-whakapau", quality: "Average", description: "A fairly good day." },
    { name: "Tangaroa-a-mua", quality: "Good", description: "A good day for fishing." },
    { name: "Tangaroa-a-roto", quality: "Good", description: "Another good day for fishing." },
    { name: "Tangaroa-kiokio", quality: "Excellent", description: "An excellent day for fishing." },
    { name: "Otane", quality: "Good", description: "A good day, and a good night for eeling." },
    { name: "Orongonui", quality: "Good", description: "A desirable day for fishing." },
    { name: "Mauri", quality: "Average", description: "The morning is fine. Fishing is average." },
    { name: "Mutuwhenua", quality: "Poor", description: "An exceedingly bad day for fishing." }
];

const biteQualityColors = {
    excellent: "#10b981",
    good: "#3b82f6",
    average: "#f59e0b",
    fair: "#8b5cf6",
    poor: "#ef4444"
};

let userLocation = null;

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
    // This is a brute-force method to find transit times.
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

    const formatBite = (start, end) => ({
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        quality: 'good'
    });

    const majorBites = moonTransits.map(transit => {
        const start = new Date(transit.time.getTime() - 1 * 60 * 60 * 1000);
        const end = new Date(transit.time.getTime() + 1 * 60 * 60 * 1000);
        return formatBite(start, end);
    });

    const minorBites = [];
    if (moonTimes.rise) {
        const start = new Date(moonTimes.rise.getTime() - 1.5 * 60 * 60 * 1000);
        const end = new Date(moonTimes.rise.getTime() + 1.5 * 60 * 60 * 1000);
        minorBites.push(formatBite(start, end));
    }
    if (moonTimes.set) {
        const start = new Date(moonTimes.set.getTime() - 1.5 * 60 * 60 * 1000);
        const end = new Date(moonTimes.set.getTime() + 1.5 * 60 * 60 * 1000);
        minorBites.push(formatBite(start, end));
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

function setLocationAndFetchBiteTimes(lat, lon) {
    userLocation = { lat, lon };
    localStorage.setItem('userLocation', JSON.stringify(userLocation));

    const date = new Date(modalCurrentYear, modalCurrentMonth, modalCurrentDay);
    const biteTimes = calculateBiteTimes(date, lat, lon);
    majorBites.innerHTML = '';
    biteTimes.major.forEach(biteTime => majorBites.appendChild(createBiteTimeElement(biteTime)));
    minorBites.innerHTML = '';
    biteTimes.minor.forEach(biteTime => minorBites.appendChild(createBiteTimeElement(biteTime)));
};

function initCalendar() {
    loadLocation();
    renderCalendar();
    updateCurrentMoonInfo();
    setupEventListeners();
    setupTheme();
}

function setupEventListeners() {
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

    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', () => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        locationInput.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                        setLocationAndFetchBiteTimes(lat, lon);
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

    if(locationInput) {
        locationInput.addEventListener('change', () => {
            // Basic lat,lon parsing
            const parts = locationInput.value.split(',');
            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lon = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lon)) {
                    setLocationAndFetchBiteTimes(lat, lon);
                }
            }
        });
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
    modalCurrentDay = day;
    modalCurrentMonth = month;
    modalCurrentYear = year;
    const dateObj = new Date(year, month, day);
    const moonData = getMoonPhaseData(dateObj);
    const lunarPhase = lunarPhases[moonData.phaseIndex];
    const dateStr = `${day} ${monthNames[month]} ${year}`;
    modalTitle.textContent = lunarPhase.name;
    modalDate.textContent = dateStr;
    modalQuality.textContent = lunarPhase.quality;
    modalQuality.className = `inline-block px-2 py-1 rounded text-white text-sm font-bold mt-1 quality-${lunarPhase.quality.toLowerCase()}`;
    modalMoonAge.textContent = `Moon age: ${moonData.moonAge.toFixed(1)} days`;
    modalMoonIllumination.textContent = `Illumination: ${(moonData.illumination * 100).toFixed(1)}%`;
    modalDescription.textContent = lunarPhase.description;

    const locationInput = document.getElementById('location-input');
    if (userLocation) {
        locationInput.value = `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
        setLocationAndFetchBiteTimes(userLocation.lat, userLocation.lon);
    } else {
        majorBites.innerHTML = 'Enter a location to see bite times.';
        minorBites.innerHTML = '';
        if (locationInput) {
            locationInput.value = '';
        }
    }

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
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const modalDate = new Date(modalCurrentYear, modalCurrentMonth, modalCurrentDay);
    modalPrevDay.disabled = modalDate <= firstDayOfMonth;
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    modalNextDay.disabled = modalDate >= lastDayOfMonth;
}

function hideModal() {
    lunarModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    modalCurrentDay = null;
    modalCurrentMonth = null;
    modalCurrentYear = null;
}

function renderCalendar() {
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    calendarDays.innerHTML = '';
    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendarDays.appendChild(emptyCell);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day border-gray-200 dark:border-gray-700 border rounded flex flex-col items-center';
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
        if (currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() && day === new Date().getDate()) {
            dayElement.classList.add('ring-2', 'ring-blue-500');
        }
        dayElement.addEventListener('click', () => showModal(day, currentMonth, currentYear));
        calendarDays.appendChild(dayElement);
    }
}

document.addEventListener('DOMContentLoaded', initCalendar);
