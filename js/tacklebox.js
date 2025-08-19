document.addEventListener('DOMContentLoaded', () => {
    // ---
    // Helper functions for localStorage
    // ---
    const getFromStorage = (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage for key "${key}":`, error);
            return defaultValue;
        }
    };

    const saveToStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving to localStorage for key "${key}":`, error);
        }
    };

    // ---
    // Global state variables
    // ---
    let tackleItems = getFromStorage('tacklebox');
    let gearTypes = getFromStorage('gearTypes', ['Lure', 'Rod', 'Reel']); // Default types
    let editingGearId = null;

    // ---
    // DOM element references
    // ---
    const tackleboxModal = document.getElementById('tackleboxModal');
    const openTackleboxBtn = document.getElementById('tacklebox-btn');
    const closeTackleboxBtn = document.getElementById('closeTackleboxModal');

    // Gear form
    const addGearForm = document.getElementById('add-gear-form');
    const gearList = document.getElementById('gear-list');
    const gearIdInput = document.getElementById('gear-id');
    const gearNameInput = document.getElementById('gear-name');
    const gearBrandInput = document.getElementById('gear-brand');
    const gearTypeSelect = document.getElementById('gear-type');
    const gearColorInput = document.getElementById('gear-color');
    const saveGearBtn = document.getElementById('save-gear-btn');
    const cancelEditGearBtn = document.getElementById('cancel-edit-gear-btn');
    const gearFormTitle = document.getElementById('tacklebox-form-title');

    // Gear type form
    const addGearTypeForm = document.getElementById('add-gear-type-form');
    const gearTypeNameInput = document.getElementById('gear-type-name');
    const gearTypeList = document.getElementById('gear-type-list');
    const editingGearTypeNameInput = document.getElementById('editing-gear-type-name');
    const addGearTypeBtn = document.getElementById('add-gear-type-btn');
    const cancelEditGearTypeBtn = document.getElementById('cancel-edit-gear-type-btn');

    // ---
    // Functions
    // ---

    const renderGearTypes = () => {
        // Populate the dropdown in the add/edit gear form
        gearTypeSelect.innerHTML = '';
        gearTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            gearTypeSelect.appendChild(option);
        });

        // Populate the list of editable gear types
        gearTypeList.innerHTML = '';
        gearTypes.forEach(type => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-600 rounded';
            li.innerHTML = `
                <span>${type}</span>
                <div class="actions">
                    <button data-type="${type}" class="edit-gear-type-btn text-xs px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button data-type="${type}" class="delete-gear-type-btn text-xs px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
            `;
            gearTypeList.appendChild(li);
        });
    };

    const renderGear = () => {
        gearList.innerHTML = '';
        tackleItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow';
            const details = [item.brand, item.type, item.color].filter(Boolean).join(' • ');
            li.innerHTML = `
                <div>
                    <p class="font-bold text-lg">${item.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${details}</p>
                </div>
                <div class="actions">
                    <button data-id="${item.id}" class="edit-gear-btn px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button data-id="${item.id}" class="delete-gear-btn px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
            `;
            gearList.appendChild(li);
        });
    };

    const openModal = () => {
        if (tackleboxModal) {
            tackleboxModal.classList.remove('hidden');
            tackleboxModal.classList.add('is-visible');
        }
    };

    const closeModal = () => {
        if (tackleboxModal) {
            tackleboxModal.classList.remove('is-visible');
            tackleboxModal.classList.add('hidden');
        }
    };

    const resetGearForm = () => {
        addGearForm.reset();
        editingGearId = null;
        gearIdInput.value = '';
        gearFormTitle.textContent = 'Add New Gear';
        saveGearBtn.textContent = 'Save Gear';
        cancelEditGearBtn.classList.add('hidden');
    };

    const editGear = (id) => {
        const gearToEdit = tackleItems.find(item => item.id === id);
        if (gearToEdit) {
            editingGearId = id;
            gearIdInput.value = gearToEdit.id;
            gearNameInput.value = gearToEdit.name;
            gearBrandInput.value = gearToEdit.brand;
            gearTypeSelect.value = gearToEdit.type;
            gearColorInput.value = gearToEdit.color;
            gearFormTitle.textContent = 'Edit Gear';
            saveGearBtn.textContent = 'Update Gear';
            cancelEditGearBtn.classList.remove('hidden');
        }
    };

    // ---
    // Event Listeners
    // ---
    if (openTackleboxBtn) {
        openTackleboxBtn.addEventListener('click', () => {
            renderGearTypes();
            renderGear();
            openModal();
        });
    }

    if (closeTackleboxBtn) {
        closeTackleboxBtn.addEventListener('click', closeModal);
    }

    if (tackleboxModal) {
        tackleboxModal.addEventListener('click', (e) => {
            if (e.target === tackleboxModal) closeModal();
        });
    }

    addGearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gearData = {
            id: editingGearId || Date.now(),
            name: gearNameInput.value.trim(),
            brand: gearBrandInput.value.trim(),
            type: gearTypeSelect.value,
            color: gearColorInput.value.trim(),
        };
        if (!gearData.name) return;

        if (editingGearId) {
            tackleItems = tackleItems.map(item => item.id === editingGearId ? gearData : item);
        } else {
            tackleItems.push(gearData);
        }
        saveToStorage('tacklebox', tackleItems);
        renderGear();
        resetGearForm();
    });

    cancelEditGearBtn.addEventListener('click', resetGearForm);

    gearList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-gear-btn')) {
            editGear(parseInt(target.dataset.id, 10));
        }
        if (target.classList.contains('delete-gear-btn')) {
            if (confirm('Are you sure you want to delete this item?')) {
                tackleItems = tackleItems.filter(item => item.id !== parseInt(target.dataset.id, 10));
                saveToStorage('tacklebox', tackleItems);
                renderGear();
            }
        }
    });

    const resetGearTypeForm = () => {
        addGearTypeForm.reset();
        editingGearTypeNameInput.value = '';
        addGearTypeBtn.textContent = 'Add Type';
        cancelEditGearTypeBtn.classList.add('hidden');
    };

    addGearTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTypeName = gearTypeNameInput.value.trim();
        const oldTypeName = editingGearTypeNameInput.value;

        if (!newTypeName) return;

        if (oldTypeName) { // We are editing
            // Update gear types array
            gearTypes = gearTypes.map(type => type === oldTypeName ? newTypeName : type);
            // Update items in tacklebox
            tackleItems = tackleItems.map(item => {
                if (item.type === oldTypeName) {
                    return { ...item, type: newTypeName };
                }
                return item;
            });
            saveToStorage('tacklebox', tackleItems);
        } else { // We are adding
            if (!gearTypes.includes(newTypeName)) {
                gearTypes.push(newTypeName);
            }
        }

        saveToStorage('gearTypes', gearTypes);
        renderGearTypes();
        renderGear(); // In case item types were updated
        resetGearTypeForm();
    });

    cancelEditGearTypeBtn.addEventListener('click', resetGearTypeForm);

    gearTypeList.addEventListener('click', (e) => {
        const target = e.target;
        const typeName = target.dataset.type;

        if (target.classList.contains('edit-gear-type-btn')) {
            gearTypeNameInput.value = typeName;
            editingGearTypeNameInput.value = typeName;
            addGearTypeBtn.textContent = 'Update Type';
            cancelEditGearTypeBtn.classList.remove('hidden');
            gearTypeNameInput.focus();
        }

        if (target.classList.contains('delete-gear-type-btn')) {
            if (confirm(`Are you sure you want to delete the "${typeName}" type? This will also remove any gear of this type.`)) {
                gearTypes = gearTypes.filter(type => type !== typeName);
                tackleItems = tackleItems.filter(item => item.type !== typeName);
                saveToStorage('gearTypes', gearTypes);
                saveToStorage('tacklebox', tackleItems);
                renderGearTypes();
                renderGear();
            }
        }
    });

    // Initial save of default types if it's the first run
    if (!localStorage.getItem('gearTypes')) {
        saveToStorage('gearTypes', gearTypes);
    }
});
