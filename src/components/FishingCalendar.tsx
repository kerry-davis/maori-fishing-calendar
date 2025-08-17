import { signal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { DayData, MonthData } from '../lib/calendarLogic';
import { getMonthData } from '../lib/calendarLogic';
import * as db from '../lib/db';
import type { Trip } from '../lib/db';
import TripForm from './TripForm';

// --- STATE SIGNALS ---
const currentDate = new Date();
const year = signal(currentDate.getFullYear());
const month = signal(currentDate.getMonth());
const location = signal<{ lat: number; lon: number; name: string } | null>(null);
const searchQuery = signal("");
const isLoadingLocation = signal(false);
const loggedDaysInMonth = signal<Set<number>>(new Set());

// Modal & Trip Management
const selectedDay = signal<DayData | null>(null);
const tripsForDay = signal<Trip[]>([]);
const isTripFormOpen = signal(false);
const editingTrip = signal<Trip | null>(null);


// --- CONSTANTS ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


export default function FishingCalendar() {

  // --- COMPUTED DATA ---
  const calendarData = useComputed<MonthData | null>(() => {
    if (!location.value) return null;
    return getMonthData(year.value, month.value, location.value.lat, location.value.lon);
  });

  // --- DATABASE & ASYNC LOGIC ---

  const checkLoggedDays = async () => {
      const firstDay = new Date(year.value, month.value, 1);
      const lastDay = new Date(year.value, month.value + 1, 0);
      const start = firstDay.toISOString().slice(0, 10);
      const end = lastDay.toISOString().slice(0, 10);

      const newLoggedDays = new Set<number>();
      const trips = await db.getTripsForMonth(start, end);
      trips.forEach(trip => {
          newLoggedDays.add(new Date(trip.date + 'T00:00:00').getDate());
      });
      loggedDaysInMonth.value = newLoggedDays;
  };

  useEffect(() => {
    if(location.value) {
        checkLoggedDays();
    }
  }, [year.value, month.value, location.value]);


  // --- EVENT HANDLERS ---

  const handleDayClick = async (day: DayData) => {
    selectedDay.value = day;
    const dateStr = day.date.toISOString().slice(0, 10);
    tripsForDay.value = await db.getTripsForDay(dateStr);
  };

  const handleSaveTrip = async (tripData: Trip | Omit<Trip, 'id'>) => {
    if ('id' in tripData && tripData.id) {
        await db.updateTrip(tripData);
    } else {
        await db.addTrip(tripData);
    }
    isTripFormOpen.value = false;
    editingTrip.value = null;
    if (selectedDay.value) {
        const dateStr = selectedDay.value.date.toISOString().slice(0, 10);
        tripsForDay.value = await db.getTripsForDay(dateStr);
    }
    checkLoggedDays(); // Re-check logs for the month
  };

  const handleDeleteTrip = async (id: number) => {
      if (confirm('Are you sure you want to delete this trip log?')) {
          await db.deleteTrip(id);
          if (selectedDay.value) {
              const dateStr = selectedDay.value.date.toISOString().slice(0, 10);
              tripsForDay.value = await db.getTripsForDay(dateStr);
          }
          checkLoggedDays(); // Re-check logs for the month
      }
  };

  const prevMonth = () => {
    month.value--;
    if (month.value < 0) {
      month.value = 11;
      year.value--;
    }
  };

  const nextMonth = () => {
    month.value++;
    if (month.value > 11) {
      month.value = 0;
      year.value++;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.value.trim()) return;
    isLoadingLocation.value = true;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        location.value = { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name };
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      alert("Failed to search for location.");
    } finally {
      isLoadingLocation.value = false;
    }
  };

  const handleGeoLocation = () => {
    isLoadingLocation.value = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            location.value = { lat: latitude, lon: longitude, name: data.display_name || "Current Location" };
        } catch (error) {
            console.error("Error fetching location name:", error);
            location.value = { lat: latitude, lon: longitude, name: "Current Location" };
        } finally {
            isLoadingLocation.value = false;
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        // Don't alert on initial load failure, just console log.
        // alert("Could not retrieve your location. Please ensure location services are enabled.");
        isLoadingLocation.value = false;
      }
    );
  };

  useEffect(() => {
    handleGeoLocation();
  }, []);


  // --- RENDER ---

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl text-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div class="flex-grow flex items-center">
            <input type="text" placeholder="Search for a location..." value={searchQuery.value} onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value} className="bg-gray-700 border border-gray-600 rounded-l-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 w-full max-w-xs" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} disabled={isLoadingLocation.value} />
            <button className="bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded-r-md transition-colors disabled:bg-gray-600" onClick={handleSearch} disabled={isLoadingLocation.value}>{isLoadingLocation.value ? '...' : 'Search'}</button>
            <button className="ml-2 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-md transition-colors disabled:bg-gray-500" title="Use my current location" onClick={handleGeoLocation} disabled={isLoadingLocation.value}>{isLoadingLocation.value ? '...' : '📍'}</button>
        </div>
        <div className="flex items-center">
          <button onClick={prevMonth} className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-l-md transition-colors" disabled={!location.value}>&lt;</button>
          <div className="px-4 py-2 bg-gray-700 text-center w-40">
            <span className="font-bold">{monthNames[month.value]}</span>
            <span className="ml-2">{year.value}</span>
          </div>
          <button onClick={nextMonth} className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-r-md transition-colors" disabled={!location.value}>&gt;</button>
        </div>
      </div>

      {/* Calendar Grid */}
      {location.value ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dayNames.map(name => <div key={name} className="text-center font-bold text-violet-300 text-sm py-2">{name}</div>)}
          {calendarData.value?.days.map((day, index) => (
            day ? (
              <div key={index} className="p-2 h-24 sm:h-28 flex flex-col border border-gray-700 rounded bg-gray-800 hover:bg-gray-700 hover:border-violet-500 cursor-pointer transition-all duration-200 ease-in-out relative group" onClick={() => handleDayClick(day)}>
                {loggedDaysInMonth.value.has(day.day) && (
                    <div title="Trip Logged" className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-md"></div>
                )}
                <div className="font-bold text-sm text-gray-300 group-hover:text-white">{day.day}</div>
                <div className="flex-grow flex flex-col items-center justify-center">
                  <div className={`text-xs font-bold px-2 py-1 rounded-full bg-bite-${day.lunarPhase.quality} text-white opacity-90 group-hover:opacity-100`}>{day.lunarPhase.quality}</div>
                  <div className="text-xs text-gray-400 mt-1 group-hover:text-gray-200">{day.lunarPhase.name}</div>
                </div>
              </div>
            ) : <div key={index} className="p-2 h-24 sm:h-28 rounded border border-gray-800"></div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 flex flex-col items-center justify-center h-96">
            <svg class="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">Searching for location...</p>
            <p class="text-sm text-gray-400 mt-2">Please enable location services or search for a location manually.</p>
        </div>
      )}

      {/* Selected Day Modal */}
      {selectedDay.value && (
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => selectedDay.value = null}>
          <div class="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => selectedDay.value = null} class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Modal Content */}
            <div class="text-center">
                <h2 class="text-3xl font-bold text-violet-300">{selectedDay.value.lunarPhase.name}</h2>
                <p class="text-lg text-gray-300">{selectedDay.value.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div class={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold bg-bite-${selectedDay.value.lunarPhase.quality} text-white`}>{selectedDay.value.lunarPhase.quality} Fishing</div>
            </div>

            {/* Lunar Details */}
            <div class="mt-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 class="text-xl font-bold text-violet-300 mb-2">Details</h3>
                <p class="text-gray-300">{selectedDay.value.lunarPhase.description}</p>
                <div class="mt-4">
                    <p>Moon Age: {selectedDay.value.moonAge.toFixed(1)} days</p>
                    <p>Illumination: {(selectedDay.value.moonIllumination * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-violet-300 mb-2">Bite Times</h3>
                <div class="space-y-2">
                    {selectedDay.value.majorBites.map((bite, i) => <div key={i} class="flex items-center p-2 rounded bg-gray-700"><span class={`w-3 h-3 rounded-full mr-3 bg-bite-${bite.quality}`}></span><span>{bite.start} - {bite.end}</span></div>)}
                    {selectedDay.value.minorBites.map((bite, i) => <div key={i} class="flex items-center p-2 rounded bg-gray-700"><span class={`w-3 h-3 rounded-full mr-3 bg-bite-${bite.quality}`}></span><span>{bite.start} - {bite.end}</span></div>)}
                </div>
              </div>
            </div>

            {/* Trip Log Section */}
            <div class="mt-6 pt-4 border-t border-gray-700">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-xl font-bold text-violet-300">Trip Logs</h3>
                    <button onClick={() => { editingTrip.value = null; isTripFormOpen.value = true; }} class="py-1 px-3 bg-violet-500 hover:bg-violet-600 rounded transition-colors text-sm font-semibold">Add Trip</button>
                </div>
                <div class="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {tripsForDay.value.length > 0 ? tripsForDay.value.map(trip => (
                        <div key={trip.id} class="p-3 bg-gray-700/50 rounded-lg">
                            <div class="flex justify-between items-start">
                                <h4 class="font-bold text-white pr-4">{trip.water || 'Unnamed Trip'} - {trip.location || 'N/A'}</h4>
                                <div class="flex gap-2 flex-shrink-0">
                                    <button onClick={() => { editingTrip.value = trip; isTripFormOpen.value = true; }} class="text-xs py-1 px-2 bg-yellow-500/80 hover:bg-yellow-500 rounded text-white font-bold">Edit</button>
                                    <button onClick={() => handleDeleteTrip(trip.id!)} class="text-xs py-1 px-2 bg-red-500/80 hover:bg-red-500 rounded text-white font-bold">Del</button>
                                </div>
                            </div>
                            <div class="text-sm text-gray-300 mt-1 border-t border-gray-600/50 pt-2">
                                {trip.hours && <p><strong>Hours:</strong> {trip.hours}</p>}
                                {trip.totalFish && <p><strong>Total Fish:</strong> {trip.totalFish}</p>}
                                {trip.companions && <p><strong>Companions:</strong> {trip.companions}</p>}
                            </div>
                            {trip.notes && <p class="text-sm mt-2 p-2 bg-gray-600/50 rounded">{trip.notes}</p>}
                        </div>
                    )) : <p class="text-sm text-gray-400 italic">No trips logged for this day.</p>}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Form Modal */}
      {isTripFormOpen.value && selectedDay.value && (
        <TripForm
            trip={editingTrip.value}
            date={selectedDay.value.date.toISOString().slice(0, 10)}
            onSave={handleSaveTrip}
            onCancel={() => isTripFormOpen.value = false}
        />
      )}
    </div>
  )
}
