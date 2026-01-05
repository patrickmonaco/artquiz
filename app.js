// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {

// Configuration de l'API (accessible globalement pour filters.js)
window.API_BASE_URL = 'https://zwgpvlahytdg6cg-db202002021813.adb.eu-frankfurt-1.oraclecloudapps.com/ords/demo/artquiz_api';
const API_BASE_URL = window.API_BASE_URL;

// État de l'application (accessible globalement)
window.appState = {
    category: 'Peintures', // Valeur par défaut
    itemCount: 5, // Valeur par défaut
    level: 3, // Niveau par défaut (1, 2 ou 3)
    artworks: [],
    currentIndex: 0,
    answers: [],
    currentArtists: [],
    // Nouveaux filtres
    filters: {
        artiste: null,  // {nom: "...", nom: "..."}
        genre: null,    // {entity: "...", lib_fr: "..."}
        ecole: null,    // {entity: "...", lib_fr: "..."}
        periode: null   // {pays_lib: "...", pays_code: "...", siecle: ...}
    },
    artistMode: false  // Mode quiz artiste spécifique (Oui/Non)
};
const appState = window.appState;

// Éléments DOM
window.selectionScreen = document.getElementById('selection-screen'); // Global pour artist-mode.js
const selectionScreen = window.selectionScreen;
window.quizScreen = document.getElementById('quiz-screen'); // Global pour filters.js
const quizScreen = window.quizScreen;
const resultsScreen = document.getElementById('results-screen');
window.startBtn = document.getElementById('start-btn'); // Global pour filters.js
const startBtn = window.startBtn;
const categoryBtns = document.querySelectorAll('.category-btn');
window.artistBtns = document.querySelectorAll('.artist-btn'); // Global pour artist-mode.js
const artistBtns = window.artistBtns;
window.artworkImage = document.getElementById('artwork-image'); // Global pour artist-mode.js
const artworkImage = window.artworkImage;
window.artworkLoading = document.getElementById('artwork-loading'); // Global pour artist-mode.js
const artworkLoading = window.artworkLoading;
window.loadingArtists = document.getElementById('loading-artists'); // Global pour artist-mode.js
const loadingArtists = window.loadingArtists;
window.artistsContainer = document.getElementById('artists-container'); // Global pour artist-mode.js
const artistsContainer = window.artistsContainer;
window.currentQuestionEl = document.getElementById('current-question'); // Global pour artist-mode.js
const currentQuestionEl = window.currentQuestionEl;
window.totalQuestionsEl = document.getElementById('total-questions'); // Global pour filters.js
const totalQuestionsEl = window.totalQuestionsEl;
window.progressBar = document.getElementById('progress-bar'); // Global pour artist-mode.js
const progressBar = window.progressBar;
const scoreEl = document.getElementById('score');
const scoreMessage = document.getElementById('score-message');
const resultsList = document.getElementById('results-list');
const replayBtn = document.getElementById('replay-btn');

// Éléments de réglages et aide
const settingsBtn = document.getElementById('settings-btn');
const helpBtn = document.getElementById('help-btn');
const filtersBtn = document.getElementById('filters-btn');
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
window.filtersModal = new bootstrap.Modal(document.getElementById('filtersModal')); // Global pour filters.js
const filtersModal = window.filtersModal;
const seriesSizeBtns = document.querySelectorAll('.series-size-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

console.log('DOM chargé, initialisation...');
console.log('quizScreen:', quizScreen);
console.log('selectionScreen:', selectionScreen);

// Initialisation
function init() {
    // Sélectionner Peintures par défaut
    categoryBtns[0].classList.add('active');
    
    // Initialiser les réglages dans la modale
    updateSettingsUI();
    
    // Gestion des modales
    settingsBtn.addEventListener('click', () => {
        settingsModal.show();
    });
    
    helpBtn.addEventListener('click', () => {
        helpModal.show();
    });
    
    // Gestion du clic sur le titre pour retourner à l'accueil
    document.getElementById('app-title-link').addEventListener('click', () => {
        resetApp();
        showScreen(selectionScreen);
    });
    
    // Gestion du clic sur l'image pour l'agrandir (lightbox)
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.getElementById('modal-image');
    
    artworkImage.addEventListener('click', () => {
        // Copier l'image dans la modale
        modalImage.src = artworkImage.src;
        imageModal.show();
    });
    
    // Gestion de la modale des filtres
    filtersBtn.addEventListener('click', () => {
        window.loadFilters(appState.category);
        filtersModal.show();
    });
    
    // Gestion du bouton effacer les filtres
    clearFiltersBtn.addEventListener('click', () => {
        clearAllFilters();
    });
    
    // Charger les filtres lors du changement d'onglet
    document.getElementById('artistes-tab').addEventListener('shown.bs.tab', () => {
        window.loadArtistes(appState.category);
    });
    document.getElementById('genres-tab').addEventListener('shown.bs.tab', () => {
        window.loadGenres(appState.category);
    });
    document.getElementById('ecoles-tab').addEventListener('shown.bs.tab', () => {
        window.loadEcoles(appState.category);
    });
    document.getElementById('periodes-tab').addEventListener('shown.bs.tab', () => {
        // Réinitialiser l'affichage à la sélection des siècles
        document.getElementById('siecles-section').style.display = 'block';
        document.getElementById('pays-section').style.display = 'none';
        window.loadSiecles();
    });
    
    // Gestion des boutons de taille de série
    seriesSizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            seriesSizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.itemCount = parseInt(btn.dataset.size);
        });
    });
    
    // Gestion des boutons de niveau
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.level = parseInt(btn.dataset.level);
        });
    });
    
    // Gestion de la sélection de catégorie
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.category = btn.dataset.category;
        });
    });

    // Démarrage du quiz
    startBtn.addEventListener('click', startQuiz);

    // Gestion des réponses
    artistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            if (appState.artistMode) {
                handleAnswerArtistMode(index);
            } else {
                handleAnswer(index);
            }
        });
    });

    // Rejouer
    replayBtn.addEventListener('click', () => {
        // Sauvegarder les filtres actuels
        const savedFilters = { ...appState.filters };
        const savedArtistMode = appState.artistMode;
        
        // Réinitialiser seulement les réponses et l'index
        appState.artworks = [];
        appState.currentIndex = 0;
        appState.answers = [];
        appState.currentArtists = [];
        
        // Restaurer les filtres
        appState.filters = savedFilters;
        appState.artistMode = savedArtistMode;
        
        // Relancer le quiz avec les mêmes paramètres
        if (savedFilters.artiste || savedFilters.genre || savedFilters.ecole || savedFilters.periode) {
            // Si on a des filtres, utiliser startQuizWithFilters
            startQuizWithFilters();
        } else {
            // Sinon, utiliser startQuiz normal
            startQuiz();
        }
    });
}

function updateSettingsUI() {
    // Mettre à jour l'UI des réglages selon l'état actuel
    seriesSizeBtns.forEach(btn => {
        if (parseInt(btn.dataset.size) === appState.itemCount) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    levelBtns.forEach(btn => {
        if (parseInt(btn.dataset.level) === appState.level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Fonction pour afficher un écran (accessible globalement pour filters.js)
window.showScreen = function(screen) {
    console.log('showScreen appelé avec:', screen);
    document.querySelectorAll('.screen').forEach(s => {
        console.log('Écran:', s.id, 'classList:', s.classList.value);
        s.classList.remove('active');
    });
    screen.classList.add('active');
    console.log('Écran activé:', screen.id, 'classList:', screen.classList.value);
};
const showScreen = window.showScreen;

// Fonction pour démarrer le quiz (accessible globalement pour replay)
window.startQuiz = async function() {
    try {
        // Validation
        if (!appState.category) {
            alert('Veuillez sélectionner une catégorie (Peintures ou Sculptures)');
            return;
        }
        
        if (!appState.itemCount) {
            alert('Veuillez sélectionner un nombre d\'œuvres (5 ou 10)');
            return;
        }
        
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Chargement...';

        console.log('État de l\'app:', appState);
        console.log('Catégorie:', appState.category);
        console.log('Nombre d\'items:', appState.itemCount);

        // Récupérer les œuvres
        const url = `${API_BASE_URL}/${appState.category}/random_items?PSERIE=${appState.itemCount}&PNIVEAU=${appState.level}`;
        console.log('URL complète:', url);
        
        const response = await fetch(url);
        
        console.log('Réponse status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur API:', errorText);
            throw new Error('Erreur lors du chargement des œuvres');
        }

        const data = await response.json();
        console.log('Données reçues:', data);
        
        appState.artworks = data.items || data;
        console.log('Nombre d\'œuvres:', appState.artworks.length);
        
        appState.currentIndex = 0;
        appState.answers = [];

        // Initialiser l'interface
        totalQuestionsEl.textContent = appState.itemCount;
        
        // Passer à l'écran de quiz
        console.log('Passage à l\'écran de quiz...');
        showScreen(quizScreen);
        console.log('Écran de quiz affiché, chargement de la question...');
        loadCurrentQuestion();

    } catch (error) {
        console.error('Erreur complète:', error);
        console.error('Stack:', error.stack);
        alert(`Erreur lors du chargement du quiz: ${error.message}\n\nVérifiez la console pour plus de détails.`);
        startBtn.disabled = false;
        startBtn.textContent = 'Commencer le quiz';
    }
}

// Fonction pour charger la question actuelle (accessible globalement pour filters.js)
window.loadCurrentQuestion = async function() {
    // Si on est en mode artiste, utiliser la fonction dédiée
    if (appState.artistMode) {
        return loadCurrentQuestionArtistMode();
    }
    
    const artwork = appState.artworks[appState.currentIndex];
    
    // Mettre à jour la progression
    currentQuestionEl.textContent = appState.currentIndex + 1;
    const progressPercent = ((appState.currentIndex + 1) / appState.artworks.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Réinitialiser l'interface
    artistsContainer.classList.add('d-none');
    loadingArtists.classList.remove('d-none');
    artworkImage.classList.add('d-none');
    artworkLoading.classList.remove('d-none');

    // Réactiver et réinitialiser les boutons
    artistBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'not-selected', 'active');
        btn.textContent = '';
        btn.blur(); // Forcer le retrait du focus
    });
    
    // Double sécurité : retirer active après un court délai
    setTimeout(() => {
        artistBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.blur();
        });
    }, 50);

    try {
        // Charger l'image
        const img = new Image();
        img.onload = () => {
            artworkImage.src = artwork.img_url;
            artworkImage.classList.remove('d-none');
            artworkLoading.classList.add('d-none');
        };
        img.onerror = () => {
            artworkImage.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
            artworkImage.classList.remove('d-none');
            artworkLoading.classList.add('d-none');
        };
        img.src = artwork.img_url;

        // Charger les artistes
        // On utilise le nom de l'artiste de l'œuvre (artwork.nom)
        const artistName = artwork.nom || '';
        let artistUrl = `${API_BASE_URL}/${appState.category}/random_artistes?pnom=${encodeURIComponent(artistName)}`;
        
        // Déterminer le niveau : forcer à 1 si filtres actifs (ecole, genre ou periode)
        const hasFilters = appState.filters.ecole || appState.filters.genre || appState.filters.periode;
        const niveau = hasFilters ? 1 : appState.level;
        artistUrl += `&pniveau=${niveau}`;
        
        // Ajouter le filtre pays si une période est sélectionnée
        if (appState.filters.periode && appState.filters.periode.pays_code) {
            artistUrl += `&ppays=${encodeURIComponent(appState.filters.periode.pays_code)}`;
        }
        
        console.log('Appel artistes:', artistUrl);
        
        const response = await fetch(artistUrl);
        
        console.log('Réponse artistes status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur artistes:', errorText);
            throw new Error('Erreur lors du chargement des artistes');
        }

        const artistsData = await response.json();
        console.log('Artistes reçus:', artistsData);
        
        appState.currentArtists = artistsData.items || artistsData;
        console.log('currentArtists:', appState.currentArtists);
        console.log('Nombre d\'artistes:', appState.currentArtists.length);

        // Mélanger les artistes pour qu'ils ne soient pas toujours dans le même ordre
        const shuffledArtists = [...appState.currentArtists].sort(() => Math.random() - 0.5);
        console.log('Artistes mélangés:', shuffledArtists);

        // Afficher les artistes
        shuffledArtists.forEach((artist, index) => {
            const artistName = artist.column_value || artist.nom; // Supporter les deux formats
            console.log(`Bouton ${index}: ${artistName}`);
            artistBtns[index].textContent = artistName;
            artistBtns[index].dataset.artistName = artistName;
        });

        console.log('Masquage du loading, affichage du container');
        loadingArtists.classList.add('d-none');
        artistsContainer.classList.remove('d-none');
        console.log('Artistes affichés!');

    } catch (error) {
        console.error('Erreur complète:', error);
        console.error('Stack:', error.stack);
        
        // Si c'est une erreur réseau (CORS en local), informer l'utilisateur
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            alert('Erreur de connexion à l\'API.\n\nSi vous testez en local, cette erreur est normale (problème CORS).\n\nSolution : Déployez l\'application sur GitHub Pages ou utilisez un serveur local.\n\nRetour à l\'écran d\'accueil...');
            resetApp();
            showScreen(selectionScreen);
        } else {
            alert('Erreur lors du chargement de la question.\n\nRetour à l\'écran d\'accueil...');
            resetApp();
            showScreen(selectionScreen);
        }
    }
}
const loadCurrentQuestion = window.loadCurrentQuestion;

function handleAnswer(buttonIndex) {
    const artwork = appState.artworks[appState.currentIndex];
    const selectedBtn = artistBtns[buttonIndex];
    const selectedArtistName = selectedBtn.dataset.artistName;
    const correctArtistName = artwork.nom;
    const isCorrect = selectedArtistName === correctArtistName;
    
    // Retirer immédiatement toutes les classes actives de Bootstrap
    artistBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.blur();
    });
    
    // Forcer le blur du bouton pour éviter qu'il reste en focus
    selectedBtn.blur();
    document.activeElement.blur();

    // Enregistrer la réponse
    appState.answers.push({
        artwork: artwork,
        selectedArtistName: selectedArtistName,
        correctArtistName: correctArtistName,
        isCorrect: isCorrect
    });

    // Désactiver tous les boutons
    artistBtns.forEach(btn => {
        btn.disabled = true;
        const btnArtistName = btn.dataset.artistName;
        
        if (btnArtistName === correctArtistName) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn) {
            btn.classList.add('incorrect');
        } else {
            btn.classList.add('not-selected');
        }
    });

    // Passer à la question suivante après un délai
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

// Passer à la question suivante (accessible globalement pour artist-mode.js)
window.nextQuestion = function() {
    appState.currentIndex++;
    
    if (appState.currentIndex < appState.artworks.length) {
        loadCurrentQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    // Protection si aucune réponse
    if (!appState.answers || appState.answers.length === 0) {
        console.error('Aucune réponse enregistrée');
        alert('Aucune réponse n\'a été enregistrée.\n\nRetour à l\'écran d\'accueil...');
        resetApp();
        showScreen(selectionScreen);
        return;
    }
    
    const correctAnswers = appState.answers.filter(a => a.isCorrect).length;
    const totalQuestions = appState.answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Afficher le score
    scoreEl.textContent = `${correctAnswers}/${totalQuestions}`;
    
    // Message selon le score
    let message = '';
    if (percentage === 100) {
        message = '🎉 Parfait ! Vous êtes un expert !';
    } else if (percentage >= 80) {
        message = '👏 Excellent ! Très bonne connaissance de l\'art !';
    } else if (percentage >= 60) {
        message = '👍 Bien joué ! Vous vous débrouillez bien !';
    } else if (percentage >= 40) {
        message = '💪 Pas mal ! Continuez à vous entraîner !';
    } else {
        message = '📚 Il reste encore beaucoup à découvrir !';
    }
    scoreMessage.textContent = message;

    // Afficher la liste des résultats
    resultsList.innerHTML = '';
    appState.answers.forEach((answer, index) => {
        const artwork = answer.artwork;
        const correctArtistName = answer.correctArtistName || artwork.nom || 'Inconnu';
        
        // Construire le nom de l'artiste avec la date si disponible
        let artistDisplay = correctArtistName;
        if (artwork.dd) {
            artistDisplay += ` (${artwork.dd})`;
        }
        
        const card = document.createElement('div');
        card.className = 'col-12';  // Une card par ligne
        card.innerHTML = `
            <div class="result-card-horizontal">
                <div class="result-image-container">
                    <img src="${artwork.img_url}" alt="${artwork.titre}" 
                         onclick="window.open('https://collections.louvre.fr/ark:/53355/${artwork.ark}', '_blank')">
                </div>
                <div class="result-info">
                    <h5>${artwork.titre || 'Sans titre'}</h5>
                    <p><strong>${artistDisplay}</strong></p>
                    ${artwork.autre ? `<p class="text-muted small">${artwork.autre}</p>` : ''}
                    <div class="mt-2">
                        ${answer.isCorrect 
                            ? '<span class="badge bg-success">✓ Correct</span>' 
                            : '<span class="badge bg-danger">✗ Incorrect</span>'}
                    </div>
                </div>
            </div>
        `;
        resultsList.appendChild(card);
    });

    showScreen(resultsScreen);
}

// Réinitialiser l'application (accessible globalement pour artist-mode.js)
window.resetApp = function() {
    appState.category = 'Peintures'; // Remettre Peintures par défaut
    appState.itemCount = 5;
    appState.level = 3;
    appState.artworks = [];
    appState.currentIndex = 0;
    appState.answers = [];
    appState.currentArtists = [];
    
    // Réinitialiser les filtres
    appState.filters = {
        artiste: null,
        genre: null,
        ecole: null,
        periode: null
    };
    appState.artistMode = false;
    
    // Réinitialiser les boutons de sélection
    categoryBtns.forEach(b => b.classList.remove('active'));
    categoryBtns[0].classList.add('active'); // Sélectionner Peintures par défaut
    
    // Réinitialiser les réglages
    updateSettingsUI();
    
    // Réafficher tous les boutons (au cas où on était en mode artiste)
    artistBtns.forEach(btn => btn.classList.remove('d-none'));
    
    startBtn.disabled = false; // Activer le bouton
    startBtn.textContent = 'Commencer le quiz';
}

// Démarrer l'application
init();

}); // Fin DOMContentLoaded
