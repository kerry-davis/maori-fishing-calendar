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
    // State
    // ---
    let tackleItems = getFromStorage('tacklebox');
    let gearTypes = getFromStorage('gearTypes', ['Lure', 'Rod', 'Reel']);

    // ---
    // DOM Elements
    // ---
    const tackleboxModal = document.getElementById('tackleboxModal');
    const openTackleboxBtn = document.getElementById('tacklebox-btn');
    const closeTackleboxBtn = document.getElementById('closeTackleboxModal');

    const gearItemSelect = document.getElementById('gear-item-select');
    const gearTypeSelect = document.getElementById('gear-type-select');
    const addNewGearBtn = document.getElementById('add-new-gear-btn');
    const addNewTypeBtn = document.getElementById('add-new-type-btn');

    const detailsFormsContainer = document.getElementById('tacklebox-details-forms');
    const placeholder = document.getElementById('tacklebox-placeholder');

    // Gear Form
    const gearForm = document.getElementById('gear-form');
    const gearFormTitle = document.getElementById('gear-form-title');
    const gearIdInput = document.getElementById('gear-id');
    const gearNameInput = document.getElementById('gear-name');
    const gearBrandInput = document.getElementById('gear-brand');
    const gearFormTypeSelect = document.getElementById('gear-form-type-select');
    const gearColourInput = document.getElementById('gear-colour');
    const deleteGearBtn = document.getElementById('delete-gear-btn');

    // Gear Type Form
    const gearTypeForm = document.getElementById('gear-type-form');
    const gearTypeFormTitle = document.getElementById('gear-type-form-title');
    const gearTypeNameInput = document.getElementById('gear-type-name');
    const editingGearTypeNameInput = document.getElementById('editing-gear-type-name');
    const deleteGearTypeBtn = document.getElementById('delete-gear-type-btn');

    // ---
    // Functions
    // ---

    const populateDropdowns = () => {
        // Populate gear items dropdown
        gearItemSelect.innerHTML = '<option value="">Select Gear...</option>';
        tackleItems.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
            gearItemSelect.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });

        // Populate gear types dropdown
        gearTypeSelect.innerHTML = '<option value="">Select Type...</option>';
        gearTypes.sort().forEach(type => {
            gearTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });
    };

    const showForm = (formElement) => {
        placeholder.style.display = 'none';
        document.querySelectorAll('#tacklebox-details-forms > form').forEach(form => form.classList.remove('active'));
        formElement.classList.add('active');
    };

    const resetAndShowPlaceholder = () => {
        placeholder.style.display = 'block';
        document.querySelectorAll('#tacklebox-details-forms > form').forEach(form => form.classList.remove('active'));
        gearItemSelect.value = '';
        gearTypeSelect.value = '';
    };

    // ---
    // Event Listeners
    // ---

    openTackleboxBtn.addEventListener('click', () => {
        tackleItems = getFromStorage('tacklebox');
        gearTypes = getFromStorage('gearTypes', ['Lure', 'Rod', 'Reel']);
        populateDropdowns();
        resetAndShowPlaceholder();
        openModalWithAnimation(tackleboxModal);
    });

    closeTackleboxBtn.addEventListener('click', () => closeModalWithAnimation(tackleboxModal));

    addNewGearBtn.addEventListener('click', () => {
        gearForm.reset();
        gearIdInput.value = '';
        gearFormTitle.textContent = 'Add New Gear';
        deleteGearBtn.classList.add('hidden');

        // Populate the type dropdown inside the form
        gearFormTypeSelect.innerHTML = '';
        gearTypes.forEach(type => {
            gearFormTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });

        showForm(gearForm);
    });

    addNewTypeBtn.addEventListener('click', () => {
        gearTypeForm.reset();
        editingGearTypeNameInput.value = '';
        gearTypeFormTitle.textContent = 'Add New Type';
        deleteGearTypeBtn.classList.add('hidden');
        showForm(gearTypeForm);
    });

    gearItemSelect.addEventListener('change', () => {
        const selectedId = parseInt(gearItemSelect.value, 10);
        if (!selectedId) {
            resetAndShowPlaceholder();
            return;
        }
        const item = tackleItems.find(i => i.id === selectedId);
        if (item) {
            gearForm.reset();
            gearFormTitle.textContent = 'Edit Gear';
            gearIdInput.value = item.id;
            gearNameInput.value = item.name;
            gearBrandInput.value = item.brand;
            gearColourInput.value = item.colour;

            gearFormTypeSelect.innerHTML = '';
            gearTypes.forEach(type => {
                gearFormTypeSelect.innerHTML += `<option value="${type}" ${type === item.type ? 'selected' : ''}>${type}</option>`;
            });

            deleteGearBtn.classList.remove('hidden');
            showForm(gearForm);
        }
    });

    gearTypeSelect.addEventListener('change', () => {
        const selectedType = gearTypeSelect.value;
        if (!selectedType) {
            resetAndShowPlaceholder();
            return;
        }
        gearTypeForm.reset();
        gearTypeFormTitle.textContent = 'Edit Gear Type';
        editingGearTypeNameInput.value = selectedType;
        gearTypeNameInput.value = selectedType;
        deleteGearTypeBtn.classList.remove('hidden');
        showForm(gearTypeForm);
    });

    gearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = gearIdInput.value ? parseInt(gearIdInput.value, 10) : Date.now();
        const gearData = {
            id: id,
            name: gearNameInput.value.trim(),
            brand: gearBrandInput.value.trim(),
            type: gearFormTypeSelect.value,
            colour: gearColourInput.value.trim(),
        };

        if (!gearData.name) return;

        const existingIndex = tackleItems.findIndex(i => i.id === id);
        if (existingIndex > -1) {
            tackleItems[existingIndex] = gearData;
        } else {
            tackleItems.push(gearData);
        }

        saveToStorage('tacklebox', tackleItems);
        populateDropdowns();
        resetAndShowPlaceholder();
    });

    deleteGearBtn.addEventListener('click', () => {
        const id = parseInt(gearIdInput.value, 10);
        if (id && confirm('Are you sure you want to delete this gear item?')) {
            tackleItems = tackleItems.filter(i => i.id !== id);
            saveToStorage('tacklebox', tackleItems);
            populateDropdowns();
            resetAndShowPlaceholder();
        }
    });

    gearTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTypeName = gearTypeNameInput.value.trim();
        const oldTypeName = editingGearTypeNameInput.value;

        if (!newTypeName) return;

        if (oldTypeName) { // Editing
            if (newTypeName !== oldTypeName) {
                gearTypes = gearTypes.map(t => t === oldTypeName ? newTypeName : t);
                tackleItems = tackleItems.map(item => {
                    if (item.type === oldTypeName) item.type = newTypeName;
                    return item;
                });
                saveToStorage('tacklebox', tackleItems);
            }
        } else { // Adding
            if (!gearTypes.includes(newTypeName)) {
                gearTypes.push(newTypeName);
            }
        }

        saveToStorage('gearTypes', gearTypes);
        populateDropdowns();
        resetAndShowPlaceholder();
    });

    deleteGearTypeBtn.addEventListener('click', () => {
        const typeToDelete = editingGearTypeNameInput.value;
        if (typeToDelete && confirm(`Are you sure you want to delete the "${typeToDelete}" type? This will also remove any gear of this type.`)) {
            gearTypes = gearTypes.filter(t => t !== typeToDelete);
            tackleItems = tackleItems.filter(i => i.type !== typeToDelete);
            saveToStorage('gearTypes', gearTypes);
            saveToStorage('tacklebox', tackleItems);
            populateDropdowns();
            resetAndShowPlaceholder();
        }
    });

    // Initial save of default types if it's the first run
    if (!localStorage.getItem('gearTypes')) {
        saveToStorage('gearTypes', gearTypes);
    }
});
