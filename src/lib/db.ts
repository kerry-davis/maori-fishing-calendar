import { openDB, type DBSchema } from 'idb';

// --- TYPE DEFINITIONS ---

export interface Trip {
    id?: number;
    date: string; // YYYY-MM-DD
    water: string;
    location: string;
    hours: string;
    totalFish: string;
    companions: string;
    notes: string;
}

// --- DATABASE SCHEMA ---

interface FishingLogDB extends DBSchema {
    trips: {
        key: number;
        value: Trip;
        indexes: { 'date': string };
    };
}

// --- DATABASE INITIALIZATION ---

const dbPromise = openDB<FishingLogDB>('fishing-log-db', 1, {
    upgrade(db) {
        const tripsStore = db.createObjectStore('trips', {
            keyPath: 'id',
            autoIncrement: true,
        });
        tripsStore.createIndex('date', 'date');
    },
});


// --- DATABASE OPERATIONS ---

export async function getTripsForDay(date: string): Promise<Trip[]> {
    const db = await dbPromise;
    return db.getAllFromIndex('trips', 'date', date);
}

export async function getTripsForMonth(startDate: string, endDate: string): Promise<Trip[]> {
    const db = await dbPromise;
    const range = IDBKeyRange.bound(startDate, endDate);
    return db.getAllFromIndex('trips', 'date', range);
}

export async function addTrip(trip: Omit<Trip, 'id'>): Promise<void> {
    const db = await dbPromise;
    await db.add('trips', trip as Trip);
}

export async function updateTrip(trip: Trip): Promise<void> {
    const db = await dbPromise;
    await db.put('trips', trip);
}

export async function deleteTrip(id: number): Promise<void> {
    const db = await dbPromise;
    await db.delete('trips', id);
}

export async function doesDayHaveLog(date: string): Promise<boolean> {
    const db = await dbPromise;
    const count = await db.countFromIndex('trips', 'date', date);
    return count > 0;
}
