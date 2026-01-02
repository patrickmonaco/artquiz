// Fonctions pour gérer les filtres (Artistes, Genres, Écoles)

// Charger les filtres selon la catégorie
window.loadFilters = async function(category) {
    console.log('Chargement des filtres pour:', category);
    
    // Afficher/cacher l'onglet Écoles selon la catégorie
    const ecolesTab = document.getElementById('ecoles-tab');
    const ecolesTabParent = ecolesTab.parentElement;
    
    if (category === 'Sculptures') {
        ecolesTabParent.style.display = 'none';
        // Si l'onglet Écoles est actif, basculer sur Artistes
        if (ecolesTab.classList.contains('active')) {
            document.getElementById('artistes-tab').click();
        }
    } else {
        ecolesTabParent.style.display = '';
    }
    
    // Charger les artistes par défaut
    await window.loadArtistes(category);
};

// Charger la liste des artistes
window.loadArtistes = async function(category) {
    const loadingEl = document.getElementById('artistes-loading');
    const listEl = document.getElementById('artistes-list');
    
    try {
        loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';
        
        const response = await fetch(`${window.API_BASE_URL}/${category}/artistes`);
        const data = await response.json();
        
        console.log('Artistes reçus:', data);
        
        loadingEl.classList.add('d-none');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const card = createFilterCard(item.nom, item.nom, 'artiste', item);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p class="text-muted">Aucun artiste disponible</p>';
        }
    } catch (error) {
        console.error('Erreur chargement artistes:', error);
        loadingEl.classList.add('d-none');
        listEl.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
}

// Charger la liste des genres
window.loadGenres = async function(category) {
    const loadingEl = document.getElementById('genres-loading');
    const listEl = document.getElementById('genres-list');
    
    try {
        loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';
        
        const response = await fetch(`${window.API_BASE_URL}/${category}/genres`);
        const data = await response.json();
        
        console.log('Genres reçus:', data);
        
        loadingEl.classList.add('d-none');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const card = createFilterCard(item.lib_fr, item.entity, 'genre', item);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p class="text-muted">Aucun genre disponible</p>';
        }
    } catch (error) {
        console.error('Erreur chargement genres:', error);
        loadingEl.classList.add('d-none');
        listEl.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
}

// Charger la liste des écoles
window.loadEcoles = async function(category) {
    const loadingEl = document.getElementById('ecoles-loading');
    const listEl = document.getElementById('ecoles-list');
    
    try {
        loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';
        
        const response = await fetch(`${window.API_BASE_URL}/${category}/ecoles`);
        const data = await response.json();
        
        console.log('Écoles reçues:', data);
        
        loadingEl.classList.add('d-none');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const card = createFilterCard(item.lib_fr, item.entity, 'ecole', item);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p class="text-muted">Aucune école disponible</p>';
        }
    } catch (error) {
        console.error('Erreur chargement écoles:', error);
        loadingEl.classList.add('d-none');
        listEl.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
}

// Créer une card de filtre
function createFilterCard(displayText, key, filterType, data) {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    
    const card = document.createElement('div');
    card.className = 'filter-card';
    
    // Tronquer le texte à 40 caractères maximum
    const truncatedText = displayText.length > 40 
        ? displayText.substring(0, 40) + '...' 
        : displayText;
    
    card.textContent = truncatedText;
    card.title = displayText; // Afficher le texte complet au survol
    card.dataset.filterType = filterType;
    card.dataset.key = key;
    
    // Vérifier si ce filtre est déjà sélectionné
    if (window.appState.filters[filterType] && window.appState.filters[filterType][key] === data[key]) {
        card.classList.add('selected');
    }
    
    card.addEventListener('click', () => {
        selectFilter(filterType, data, card);
    });
    
    col.appendChild(card);
    return col;
}

// Sélectionner un filtre
function selectFilter(filterType, data, cardElement) {
    console.log('Filtre sélectionné:', filterType, data);
    
    // Retirer la sélection des autres cards du même type
    const allCards = document.querySelectorAll(`[data-filter-type="${filterType}"]`);
    allCards.forEach(c => c.classList.remove('selected'));
    
    // Si on clique sur une card déjà sélectionnée, on la désélectionne
    if (window.appState.filters[filterType] && JSON.stringify(window.appState.filters[filterType]) === JSON.stringify(data)) {
        window.appState.filters[filterType] = null;
        window.appState.artistMode = false;
        console.log('Filtre désélectionné');
    } else {
        // Sinon on la sélectionne
        cardElement.classList.add('selected');
        window.appState.filters[filterType] = data;
        
        // Si c'est un artiste, activer le mode artiste
        if (filterType === 'artiste') {
            window.appState.artistMode = true;
        }
        
        // Fermer la modale et démarrer le quiz
        window.filtersModal.hide();
        startQuizWithFilters();
    }
}

// Effacer tous les filtres
function clearAllFilters() {
    window.appState.filters = {
        artiste: null,
        genre: null,
        ecole: null
    };
    window.appState.artistMode = false;
    
    // Retirer la sélection visuelle
    document.querySelectorAll('.filter-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    console.log('Filtres effacés');
}

// Démarrer le quiz avec les filtres
async function startQuizWithFilters() {
    console.log('Démarrage du quiz avec filtres:', window.appState.filters);
    console.log('Mode artiste:', window.appState.artistMode);
    
    // Si on a des filtres, forcer le niveau à 1
    const hasFilters = window.appState.filters.artiste || window.appState.filters.genre || window.appState.filters.ecole;
    const niveau = hasFilters ? 1 : window.appState.level;
    
    // Construire l'URL avec les filtres
    let url = `${window.API_BASE_URL}/${window.appState.category}/random_items?PSERIE=${window.appState.itemCount}&PNIVEAU=${niveau}`;
    
    if (window.appState.filters.artiste) {
        url += `&pnom=${encodeURIComponent(window.appState.filters.artiste.nom)}`;
    }
    if (window.appState.filters.genre) {
        url += `&pgenre=${encodeURIComponent(window.appState.filters.genre.entity)}`;
    }
    if (window.appState.filters.ecole) {
        url += `&pecole=${encodeURIComponent(window.appState.filters.ecole.entity)}`;
    }
    
    console.log('URL API:', url);
    
    try {
        window.startBtn.disabled = true;
        window.startBtn.textContent = 'Chargement...';
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Données reçues:', data);
        
        if (!data.items || data.items.length === 0) {
            alert('Aucune œuvre trouvée avec ces filtres. Veuillez modifier vos critères.');
            window.startBtn.disabled = false;
            window.startBtn.textContent = 'Commencer le quiz';
            return;
        }
        
        window.appState.artworks = data.items;
        window.appState.currentIndex = 0;
        window.appState.answers = [];
        window.totalQuestionsEl.textContent = window.appState.artworks.length;
        
        window.showScreen(window.quizScreen);
        console.log('Écran de quiz affiché, chargement de la question...');
        window.loadCurrentQuestion();
        
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(`Erreur lors du chargement du quiz: ${error.message}`);
        window.startBtn.disabled = false;
        window.startBtn.textContent = 'Commencer le quiz';
    }
}
