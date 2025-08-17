import { signal } from "@preact/signals";
import type { Trip } from "../lib/db";
import { useEffect } from "preact/hooks";

interface TripFormProps {
    trip: Trip | null;
    date: string;
    onSave: (trip: Trip | Omit<Trip, 'id'>) => void;
    onCancel: () => void;
}

export default function TripForm({ trip, date, onSave, onCancel }: TripFormProps) {
    const formData = signal<Omit<Trip, 'id' | 'date'>>({
        water: '',
        location: '',
        hours: '',
        totalFish: '',
        companions: '',
        notes: '',
    });

    useEffect(() => {
        if (trip) {
            formData.value = { ...trip };
        } else {
            formData.value = { water: '', location: '', hours: '', totalFish: '', companions: '', notes: '' };
        }
    }, [trip]);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        const finalTrip = trip ? { ...formData.value, id: trip.id, date } : { ...formData.value, date };
        onSave(finalTrip);
    };

    const fieldClass = "w-full bg-gray-600 border border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500";
    const labelClass = "block text-sm font-bold mb-1 text-gray-300";

    return (
        <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60]">
            <div class="bg-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h2 class="text-2xl font-bold text-violet-300 mb-4">{trip ? 'Edit Trip' : 'Add New Trip'}</h2>
                <form onSubmit={handleSubmit} class="space-y-4">
                    <div>
                        <label class={labelClass} for="water">Water Body</label>
                        <input class={fieldClass} type="text" id="water" value={formData.value.water} onInput={e => formData.value = {...formData.value, water: (e.target as HTMLInputElement).value}} />
                    </div>
                    <div>
                        <label class={labelClass} for="location">Specific Location</label>
                        <input class={fieldClass} type="text" id="location" value={formData.value.location} onInput={e => formData.value = {...formData.value, location: (e.target as HTMLInputElement).value}} />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class={labelClass} for="hours">Hours Fished</label>
                            <input class={fieldClass} type="text" id="hours" value={formData.value.hours} onInput={e => formData.value = {...formData.value, hours: (e.target as HTMLInputElement).value}} />
                        </div>
                        <div>
                            <label class={labelClass} for="totalFish">Total Fish Caught</label>
                            <input class={fieldClass} type="text" id="totalFish" value={formData.value.totalFish} onInput={e => formData.value = {...formData.value, totalFish: (e.target as HTMLInputElement).value}} />
                        </div>
                    </div>
                     <div>
                        <label class={labelClass} for="companions">Fished With</label>
                        <input class_={fieldClass} type="text" id="companions" value={formData.value.companions} onInput={e => formData.value = {...formData.value, companions: (e.target as HTMLInputElement).value}} />
                    </div>
                    <div>
                        <label class={labelClass} for="notes">Notes</label>
                        <textarea class={fieldClass} id="notes" value={formData.value.notes} onInput={e => formData.value = {...formData.value, notes: (e.target as HTMLInputElement).value}}></textarea>
                    </div>
                    <div class="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} class="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded transition-colors">Cancel</button>
                        <button type="submit" class="py-2 px-4 bg-violet-500 hover:bg-violet-600 rounded transition-colors">Save Trip</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
