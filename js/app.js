const characterForm = document.getElementById('character-form');
const containerCards = document.getElementById('characters-container');
const btnClearAll = document.getElementById('btn-clear-all');

const inputName = document.getElementById('char-name');
const selectRace = document.getElementById('char-race');
const selectClass = document.getElementById('char-class');
const inputLevel = document.getElementById('char-level');
const textareaBio = document.getElementById('char-bio');

let characters = [];

document.addEventListener('DOMContentLoaded', () => {
    const storedCharacters = localStorage.getItem('dnd_characters');
    if (storedCharacters) {
        characters = JSON.parse(storedCharacters);
    }
    renderCharacters();
});

characterForm.addEventListener('submit', handleFormSubmit);

inputName.addEventListener('input', () => validateField(inputName, validateName));
inputLevel.addEventListener('input', () => validateField(inputLevel, validateLevel));
selectRace.addEventListener('change', () => validateField(selectRace, () => selectRace.value !== ""));
selectClass.addEventListener('change', () => validateField(selectClass, () => selectClass.value !== ""));
textareaBio.addEventListener('input', () => validateField(textareaBio, validateBio));

btnClearAll.addEventListener('click', clearAllCharacters);

function validateName() {
    const val = inputName.value.trim();
    if (val === '') return 'El nombre es obligatorio.';
    if (val.length < 3) return 'Debe tener al menos 3 caracteres.';
    return true;
}

function validateLevel() {
    const val = inputLevel.value;
    if (val === '') return 'El nivel es obligatorio.';
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 20) return 'El nivel debe estar entre 1 y 20.';
    return true;
}

function validateBio() {
    const val = textareaBio.value.trim();
    if (val.length > 200) return 'La descripción no puede superar los 200 caracteres.';
    return true;
}

function validateSelects() {
    let isValid = true;
    if (selectRace.value === "") {
        showError(selectRace, 'Debes seleccionar una raza ancestral.');
        isValid = false;
    } else {
        clearError(selectRace);
    }
    
    if (selectClass.value === "") {
        showError(selectClass, 'Debes elegir una clase de combate.');
        isValid = false;
    } else {
        clearError(selectClass);
    }
    return isValid;
}

function validateField(element, validationFn) {
    const result = validationFn();
    if (result !== true && typeof result === 'string') {
        showError(element, result);
        return false;
    } else if (result === false) {
        showError(element, 'Este campo es inválido.');
        return false;
    } else {
        clearError(element);
        return true;
    }
}

function showError(element, message) {
    element.classList.remove('valid');
    element.classList.add('invalid');
    const errorSpan = element.parentElement.querySelector('.error-message');
    if (errorSpan) errorSpan.textContent = message;
}

function clearError(element) {
    element.classList.remove('invalid');
    element.classList.add('valid');
    const errorSpan = element.parentElement.querySelector('.error-message');
    if (errorSpan) errorSpan.textContent = '';
}

function handleFormSubmit(e) {
    e.preventDefault();

    const isNameValid = validateField(inputName, validateName);
    const isLevelValid = validateField(inputLevel, validateLevel);
    const isBioValid = validateField(textareaBio, validateBio);
    const isSelectsValid = validateSelects();

    if (!isNameValid || !isLevelValid || !isBioValid || !isSelectsValid) {
        return;
    }

    const newCharacter = {
        id: Date.now(),
        name: inputName.value.trim(),
        race: selectRace.value,
        class: selectClass.value,
        level: parseInt(inputLevel.value, 10),
        bio: textareaBio.value.trim() || 'Sin trasfondo definido.'
    };

    characters.push(newCharacter);
    saveToLocalStorage();
    renderCharacters();

    characterForm.reset();
    [inputName, selectRace, selectClass, inputLevel, textareaBio].forEach(el => el.classList.remove('valid'));
}

function saveToLocalStorage() {
    localStorage.setItem('dnd_characters', JSON.stringify(characters));
}

function renderCharacters() {
    containerCards.innerHTML = '';

    if (characters.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `<p>No hay aventureros descansando en la taberna actualmente. ¡Crea uno!</p>`;
        containerCards.appendChild(emptyState);
        return;
    }

    characters.forEach(char => {
        const card = document.createElement('article');
        card.className = 'character-card';
        
        card.innerHTML = `
            <div>
                <div class="card-header">
                    <h3>${escapeHTML(char.name)}</h3>
                    <span class="badge">Nivel ${char.level}</span>
                </div>
                <div class="card-body">
                    <p><strong>Raza:</strong> ${char.race}</p>
                    <p><strong>Clase:</strong> ${char.class}</p>
                    <p class="bio-text">"${escapeHTML(char.bio)}"</p>
                </div>
            </div>
        `;

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.textContent = 'Desterrar';
        btnDelete.addEventListener('click', () => deleteCharacter(char.id));

        card.appendChild(btnDelete);
        containerCards.appendChild(card);
    });
}

function deleteCharacter(id) {
    characters = characters.filter(char => char.id !== id);
    saveToLocalStorage();
    renderCharacters();
}

function clearAllCharacters() {
    if (confirm('¿Seguro que deseas eliminar a todos los héroes del panel?')) {
        characters = [];
        saveToLocalStorage();
        renderCharacters();
    }
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}