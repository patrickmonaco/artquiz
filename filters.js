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

// Charger la liste des siècles
window.loadSiecles = async function() {
    const loadingEl = document.getElementById('siecles-loading');
    const listEl = document.getElementById('siecles-list');
    
    try {
        loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';
        
        const response = await fetch(`${window.API_BASE_URL}/lov/siecle`);
        const data = await response.json();
        
        console.log('Siècles reçus:', data);
        
        loadingEl.classList.add('d-none');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const card = createSiecleCard(item.lib, item.id);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p class="text-muted">Aucun siècle disponible</p>';
        }
    } catch (error) {
        console.error('Erreur chargement siècles:', error);
        loadingEl.classList.add('d-none');
        listEl.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
};

// Créer une card pour un siècle
function createSiecleCard(lib, id) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';  // 2 colonnes
    
    const card = document.createElement('div');
    card.className = 'filter-card';
    card.textContent = lib;
    card.title = lib;
    
    card.addEventListener('click', () => {
        selectSiecle(lib, id);
    });
    
    col.appendChild(card);
    return col;
}

// Sélectionner un siècle et charger les pays
function selectSiecle(lib, siecle) {
    console.log('Siècle sélectionné:', lib, siecle);
    
    // Sauvegarder le siècle sélectionné
    window.selectedSiecle = { lib: lib, siecle: siecle };
    
    // Masquer la section siècles et afficher la section pays
    document.getElementById('siecles-section').style.display = 'none';
    document.getElementById('pays-section').style.display = 'block';
    
    // Charger les pays pour ce siècle
    loadPays(window.appState.category, siecle);
}

// Charger la liste des pays pour un siècle
async function loadPays(category, siecle) {
    const loadingEl = document.getElementById('pays-loading');
    const listEl = document.getElementById('pays-list');
    
    try {
        loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';
        
        const response = await fetch(`${window.API_BASE_URL}/${category}/${siecle}/pays`);
        const data = await response.json();
        
        console.log('Pays reçus:', data);
        
        loadingEl.classList.add('d-none');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const card = createPaysCard(item.lib, item.code, siecle);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p class="text-muted">Aucun pays disponible pour ce siècle</p>';
        }
    } catch (error) {
        console.error('Erreur chargement pays:', error);
        loadingEl.classList.add('d-none');
        listEl.innerHTML = '<p class="text-danger">Erreur de chargement</p>';
    }
}

// Créer une card pour un pays
function createPaysCard(lib, code, siecle) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';  // 2 colonnes
    
    const card = document.createElement('div');
    card.className = 'filter-card';
    
    // Tronquer le texte à 40 caractères
    const truncatedText = lib.length > 40 
        ? lib.substring(0, 40) + '...' 
        : lib;
    
    card.textContent = truncatedText;
    card.title = lib;
    
    card.addEventListener('click', () => {
        selectPays(lib, code, siecle);
    });
    
    col.appendChild(card);
    return col;
}

// Sélectionner un pays et démarrer le quiz
function selectPays(lib, code, siecle) {
    console.log('Pays sélectionné:', lib, code, 'Siècle:', siecle);
    
    // Sauvegarder la sélection dans les filtres
    window.appState.filters.periode = {
        pays_lib: lib,
        pays_code: code,
        siecle: siecle
    };
    
    // Fermer la modale et démarrer le quiz
    window.filtersModal.hide();
    startQuizWithFilters();
}

// Bouton retour aux siècles
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('back-to-siecles');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('pays-section').style.display = 'none';
            document.getElementById('siecles-section').style.display = 'block';
            window.selectedSiecle = null;
        });
    }
});


// Créer une card de filtre
function createFilterCard(displayText, key, filterType, data) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';  // 2 colonnes au lieu de 4
    
    const card = document.createElement('div');
    card.className = 'filter-card';
    
    // Tronquer le texte à 40 caractères maximum
    const truncatedText = displayText.length > 40 
        ? displayText.substring(0, 40) + '...' 
        : displayText;
    
    // Créer le contenu de la card avec le texte et le badge
    const textSpan = document.createElement('span');
    textSpan.className = 'filter-card-text';
    textSpan.textContent = truncatedText;
    
    card.appendChild(textSpan);
    
    // Ajouter le badge avec le nombre d'œuvres si disponible
    if (data.nb !== undefined && data.nb !== null) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary filter-card-badge';
        badge.textContent = data.nb;
        card.appendChild(badge);
    }
    
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
        ecole: null,
        periode: null
    };
    window.appState.artistMode = false;
    
    // Retirer la sélection visuelle
    document.querySelectorAll('.filter-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Réinitialiser l'affichage de l'onglet Périodes
    document.getElementById('siecles-section').style.display = 'block';
    document.getElementById('pays-section').style.display = 'none';
    window.selectedSiecle = null;
    
    console.log('Filtres effacés');
}

// Démarrer le quiz avec les filtres (accessible globalement pour replay)
window.startQuizWithFilters = async function() {
    console.log('Démarrage du quiz avec filtres:', window.appState.filters);
    console.log('Mode artiste:', window.appState.artistMode);
    
    // Si on a des filtres, forcer le niveau à 1
    const hasFilters = window.appState.filters.artiste || 
                       window.appState.filters.genre || 
                       window.appState.filters.ecole ||
                       window.appState.filters.periode;
    const niveau = hasFilters ? 1 : window.appState.level;
    
    // Si un artiste est sélectionné, forcer la série à 10
    const serie = window.appState.filters.artiste ? 10 : window.appState.itemCount;
    
    // Mettre à jour itemCount dans appState pour que la barre de progression soit correcte
    if (window.appState.filters.artiste) {
        window.appState.itemCount = 10;
    }
    
    // Construire l'URL avec les filtres
    let url = `${window.API_BASE_URL}/${window.appState.category}/random_items?PSERIE=${serie}&PNIVEAU=${niveau}`;
    
    if (window.appState.filters.artiste) {
        url += `&pnom=${encodeURIComponent(window.appState.filters.artiste.nom)}`;
    }
    if (window.appState.filters.genre) {
        url += `&pgenre=${encodeURIComponent(window.appState.filters.genre.entity)}`;
    }
    if (window.appState.filters.ecole) {
        url += `&pecole=${encodeURIComponent(window.appState.filters.ecole.entity)}`;
    }
    if (window.appState.filters.periode) {
        url += `&ppays=${encodeURIComponent(window.appState.filters.periode.pays_code)}`;
        url += `&psiecle=${window.appState.filters.periode.siecle}`;
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
