import SunCalc from 'suncalc';

// --- TYPE DEFINITIONS ---

export type BiteQuality = "excellent" | "good" | "average" | "fair" | "poor";

export interface LunarPhase {
  name: string;
  quality: BiteQuality;
  description: string;
  biteQualities: BiteQuality[];
}

export interface BiteTime {
    start: string;
    end: string;
    quality: BiteQuality;
}

export interface DayData {
    day: number;
    date: Date;
    lunarPhase: LunarPhase;
    moonIllumination: number;
    moonAge: number;
    majorBites: BiteTime[];
    minorBites: BiteTime[];
}

export interface MonthData {
    year: number;
    month: number;
    days: (DayData | null)[]; // Use null for empty cells in the grid
}


// --- CORE DATA ---

export const lunarPhases: LunarPhase[] = [
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

export const biteQualityColors: Record<BiteQuality, string> = {
    excellent: "#10b981", // green-500
    good: "#3b82f6",      // blue-500
    average: "#f59e0b",   // amber-500
    fair: "#8b5cf6",      // violet-500
    poor: "#ef4444"       // red-500
};

// --- LOGIC FUNCTIONS ---

function getMoonPhaseData(date: Date): { phaseIndex: number; moonAge: number; illumination: number } {
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

// This function is complex and directly translated. It calculates the moon's transit times.
function getMoonTransitTimes(date: Date, lat: number, lng: number): { transits: { time: Date; overhead: boolean }[] } {
    const rc: { transits: { time: Date; overhead: boolean }[] } = { transits: [] };
    let sign: number | boolean = 1;
    let i: number, j: number;

    for (i = 0; i <= 25; i++) {
        const date2 = new Date(date);
        date2.setHours(i, 0, 0, 0);
        const moontimes = SunCalc.getMoonPosition(date2, lat, lng);
        if (i === 0) {
            sign = Math.sign(moontimes.azimuth);
        }
        if (sign !== Math.sign(moontimes.azimuth)) {
            break;
        }
    }

    sign = true;
    for (j = 0; j < 60; j++) {
        const date3 = new Date(date);
        date3.setHours(i - 1, j, 0, 0);
        const moontimes = SunCalc.getMoonPosition(date3, lat, lng);
        if (j === 0) {
            if (moontimes.azimuth < 0) {
                sign = false;
            }
        }
        if (sign !== (moontimes.azimuth > 0)) {
            rc.transits.push({ 'time': date3, 'overhead': (Math.sign(moontimes.altitude) > 0) });
            break;
        }
    }

    const start = i;
    for (; i <= 25; i++) {
        const date2 = new Date(date);
        date2.setHours(i, 0, 0, 0);
        const moontimes = SunCalc.getMoonPosition(date2, lat, lng);
        if (i === start) {
            sign = Math.sign(moontimes.azimuth);
        }
        if (sign !== Math.sign(moontimes.azimuth)) {
            break;
        }
    }

    if (i < 25) {
        sign = true;
        for (j = 0; j < 60; j++) {
            const date3 = new Date(date);
            date3.setHours(i - 1, j, 0, 0);
            const moontimes = SunCalc.getMoonPosition(date3, lat, lng);
            if (j === 0) {
                if (moontimes.azimuth < 0) {
                    sign = false;
                }
            }
            if (sign !== (moontimes.azimuth > 0)) {
                rc.transits.push({ 'time': date3, 'overhead': (Math.sign(moontimes.altitude) > 0) });
                break;
            }
        }
    }
    return rc;
}


function calculateBiteTimes(date: Date, lat: number, lon: number): { major: BiteTime[]; minor: BiteTime[] } {
    const moonTimes = SunCalc.getMoonTimes(date, lat, lon);
    const moonTransits = getMoonTransitTimes(date, lat, lon).transits;
    const lunarDay = lunarPhases[getMoonPhaseData(date).phaseIndex];
    const qualities = lunarDay.biteQualities;

    const formatBite = (start: Date, end: Date, quality: BiteQuality): BiteTime => ({
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        quality: quality
    });

    const majorBites = moonTransits.map((transit, index) => {
        const start = new Date(transit.time.getTime() - 1 * 60 * 60 * 1000); // 2 hour window
        const end = new Date(transit.time.getTime() + 1 * 60 * 60 * 1000);
        return formatBite(start, end, qualities[index]);
    });

    const minorBites: BiteTime[] = [];
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


// --- MAIN EXPORTED FUNCTION ---

export function getMonthData(year: number, month: number, lat: number, lon: number): MonthData {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday

    const days: (DayData | null)[] = Array(startingDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const moonData = getMoonPhaseData(date);
        const lunarPhase = lunarPhases[moonData.phaseIndex];
        const biteTimes = calculateBiteTimes(date, lat, lon);

        days.push({
            day: day,
            date: date,
            lunarPhase: lunarPhase,
            moonIllumination: moonData.illumination,
            moonAge: moonData.moonAge,
            majorBites: biteTimes.major,
            minorBites: biteTimes.minor,
        });
    }

    return {
        year,
        month,
        days,
    };
}

export async function fetchWeatherForecast(lat: number, lon: number, date: Date) {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,winddirection_10m_dominant&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        return null;
    }
}
