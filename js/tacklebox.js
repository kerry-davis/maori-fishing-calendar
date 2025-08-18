document.addEventListener('DOMContentLoaded', () => {
    // ---
    // Helper functions for localStorage
    // ---
    const getTackleData = () => {
        try {
            const data = localStorage.getItem('tacklebox');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage for tacklebox:', error);
            return [];
        }
    };

    const saveTackleData = (data) => {
        try {
            localStorage.setItem('tacklebox', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage for tacklebox:', error);
        }
    };

    // ---
    // Global state variables
    // ---
    let tackleItems = getTackleData();
    let editingGearId = null;

    // ---
    // DOM element references
    // ---
    const tackleboxModal = document.getElementById('tackleboxModal');
    const openTackleboxBtn = document.getElementById('tacklebox-btn');
    const closeTackleboxBtn = document.getElementById('closeTackleboxModal');

    const addGearForm = document.getElementById('add-gear-form');
    const gearList = document.getElementById('gear-list');
    const gearIdInput = document.getElementById('gear-id');
    const gearNameInput = document.getElementById('gear-name');
    const gearBrandInput = document.getElementById('gear-brand');
    const gearTypeInput = document.getElementById('gear-type');
    const gearColorInput = document.getElementById('gear-color');
    const saveGearBtn = document.getElementById('save-gear-btn');
    const cancelEditGearBtn = document.getElementById('cancel-edit-gear-btn');
    const formTitle = document.getElementById('tacklebox-form-title');


    // ---
    // Functions
    // ---

    const renderGear = () => {
        gearList.innerHTML = '';
        tackleItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow';
            li.innerHTML = `
                <div>
                    <p class="font-bold text-lg">${item.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        ${item.brand || 'N/A'} • ${item.type} • ${item.color || 'N/A'}
                    </p>
                </div>
                <div class="actions">
                    <button data-id="${item.id}" class="edit-gear-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                    <button data-id="${item.id}" class="delete-gear-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
            `;
            gearList.appendChild(li);
        });
    };

    const openModal = () => {
        if (tackleboxModal) {
            tackleboxModal.classList.remove('hidden');
            // This is a simplified version of the main script's modal animation
            tackleboxModal.classList.add('is-visible');
        }
    };

    const closeModal = () => {
        if (tackleboxModal) {
            tackleboxModal.classList.remove('is-visible');
            tackleboxModal.classList.add('hidden');
        }
    };

    const resetForm = () => {
        addGearForm.reset();
        editingGearId = null;
        gearIdInput.value = '';
        formTitle.textContent = 'Add New Gear';
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
            gearTypeInput.value = gearToEdit.type;
            gearColorInput.value = gearToEdit.color;

            formTitle.textContent = 'Edit Gear';
            saveGearBtn.textContent = 'Update Gear';
            cancelEditGearBtn.classList.remove('hidden');
        }
    };

    // ---
    // Event Listeners
    // ---
    if (openTackleboxBtn) {
        openTackleboxBtn.addEventListener('click', () => {
            renderGear();
            openModal();
        });
    }

    if (closeTackleboxBtn) {
        closeTackleboxBtn.addEventListener('click', closeModal);
    }

    // Also close modal if clicking on the backdrop
    if (tackleboxModal) {
        tackleboxModal.addEventListener('click', (e) => {
            if (e.target === tackleboxModal) {
                closeModal();
            }
        });
    }

    addGearForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gearData = {
            // Use existing ID for updates, or create new one for new items
            id: editingGearId || Date.now(),
            name: gearNameInput.value,
            brand: gearBrandInput.value,
            type: gearTypeInput.value,
            color: gearColorInput.value,
        };

        if (editingGearId) {
            // Update existing item
            tackleItems = tackleItems.map(item => item.id === editingGearId ? gearData : item);
        } else {
            // Add new item
            tackleItems.push(gearData);
        }

        saveTackleData(tackleItems);
        renderGear();
        resetForm();
    });

    cancelEditGearBtn.addEventListener('click', resetForm);

    gearList.addEventListener('click', (e) => {
        const target = e.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-gear-btn')) {
            editGear(id);
        }

        if (target.classList.contains('delete-gear-btn')) {
            if (confirm('Are you sure you want to delete this item?')) {
                tackleItems = tackleItems.filter(item => item.id !== id);
                saveTackleData(tackleItems);
                renderGear();
            }
        }
    });

});
