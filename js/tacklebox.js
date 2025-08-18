document.addEventListener('DOMContentLoaded', () => {
    // ---
    // Helper functions for localStorage
    // ---
    const getData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading from localStorage for key "${key}":`, error);
            return [];
        }
    };

    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving to localStorage for key "${key}":`, error);
        }
    };

    // ---
    // Global state variables
    // ---
    let tackleItems = getData('tacklebox');
    let loggedCatches = getData('catches');

    // ---
    // DOM element references
    // ---
    const addGearForm = document.getElementById('add-gear-form');
    const gearList = document.getElementById('gear-list');
    const gearNameInput = document.getElementById('gear-name');
    const gearBrandInput = document.getElementById('gear-brand');
    const gearTypeInput = document.getElementById('gear-type');
    const gearColorInput = document.getElementById('gear-color');

    const logCatchForm = document.getElementById('log-catch-form');
    const catchList = document.getElementById('catch-list');
    const catchSpeciesInput = document.getElementById('catch-species');
    const catchLengthInput = document.getElementById('catch-length');
    const gearSelectDropdown = document.getElementById('gear-select-dropdown');

    // ---
    // Rendering functions
    // ---
    const renderGear = () => {
        gearList.innerHTML = '';
        tackleItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded';
            li.innerHTML = `
                <div>
                    <span class="font-bold">${item.name}</span> (${item.brand}, ${item.type}, ${item.color})
                </div>
                <button data-id="${item.id}" class="delete-gear-btn text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            `;
            gearList.appendChild(li);
        });
    };

    const renderCatches = () => {
        catchList.innerHTML = '';
        loggedCatches.forEach(item => {
            const gearUsed = tackleItems.find(gear => gear.id === item.gearId);
            const gearName = gearUsed ? gearUsed.name : 'Unknown Gear';
            const li = document.createElement('li');
            li.className = 'p-2 bg-gray-100 dark:bg-gray-700 rounded';
            li.innerHTML = `
                <span class="font-bold">${item.species}</span> - ${item.length}, caught with ${gearName}
            `;
            catchList.appendChild(li);
        });
    };

    const populateGearDropdown = () => {
        gearSelectDropdown.innerHTML = '<option value="">Select Gear...</option>';
        tackleItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            gearSelectDropdown.appendChild(option);
        });
    };

    // ---
    // Event Listeners
    // ---

    // Add Gear
    addGearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newGear = {
            id: Date.now(),
            name: gearNameInput.value,
            brand: gearBrandInput.value,
            type: gearTypeInput.value,
            color: gearColorInput.value,
        };
        tackleItems.push(newGear);
        saveData('tacklebox', tackleItems);
        renderGear();
        populateGearDropdown();
        addGearForm.reset();
    });

    // Log Catch
    logCatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCatch = {
            id: Date.now(),
            species: catchSpeciesInput.value,
            length: catchLengthInput.value,
            gearId: parseInt(gearSelectDropdown.value, 10),
        };
        loggedCatches.push(newCatch);
        saveData('catches', loggedCatches);
        renderCatches();
        logCatchForm.reset();
    });

    // Delete Gear (using event delegation)
    gearList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-gear-btn')) {
            const gearId = parseInt(e.target.dataset.id, 10);
            tackleItems = tackleItems.filter(item => item.id !== gearId);
            saveData('tacklebox', tackleItems);
            renderGear();
            populateGearDropdown();
            // Also need to re-render catches in case the deleted gear was used
            renderCatches();
        }
    });

    // ---
    // Initial Render
    // ---
    renderGear();
    renderCatches();
    populateGearDropdown();
});
