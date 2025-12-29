// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {

// Configuration de l'API
const API_BASE_URL = 'https://rome.gotocity.eu/ords/demo/artquiz_api';

// État de l'application
const appState = {
    category: 'Peintures', // Valeur par défaut
    itemCount: 5, // Valeur par défaut
    level: 3, // Niveau par défaut (1, 2 ou 3)
    artworks: [],
    currentIndex: 0,
    answers: [],
    currentArtists: []
};

// Éléments DOM
const selectionScreen = document.getElementById('selection-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const artistBtns = document.querySelectorAll('.artist-btn');
const artworkImage = document.getElementById('artwork-image');
const artworkLoading = document.getElementById('artwork-loading');
const loadingArtists = document.getElementById('loading-artists');
const artistsContainer = document.getElementById('artists-container');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const progressBar = document.getElementById('progress-bar');
const scoreEl = document.getElementById('score');
const scoreMessage = document.getElementById('score-message');
const resultsList = document.getElementById('results-list');
const replayBtn = document.getElementById('replay-btn');

// Éléments de réglages et aide
const settingsBtn = document.getElementById('settings-btn');
const helpBtn = document.getElementById('help-btn');
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
const seriesSizeBtns = document.querySelectorAll('.series-size-btn');
const levelBtns = document.querySelectorAll('.level-btn');

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
        btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index)));
    });

    // Rejouer
    replayBtn.addEventListener('click', () => {
        resetApp();
        showScreen(selectionScreen);
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

function showScreen(screen) {
    console.log('showScreen appelé avec:', screen);
    document.querySelectorAll('.screen').forEach(s => {
        console.log('Écran:', s.id, 'classList:', s.classList.value);
        s.classList.remove('active');
    });
    screen.classList.add('active');
    console.log('Écran activé:', screen.id, 'classList:', screen.classList.value);
}

async function startQuiz() {
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

async function loadCurrentQuestion() {
    const artwork = appState.artworks[appState.currentIndex];
    
    // Mettre à jour la progression
    currentQuestionEl.textContent = appState.currentIndex + 1;
    const progressPercent = ((appState.currentIndex + 1) / appState.itemCount) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Réinitialiser l'interface
    artistsContainer.classList.add('d-none');
    loadingArtists.classList.remove('d-none');
    artworkImage.classList.add('d-none');
    artworkLoading.classList.remove('d-none');

    // Réactiver et réinitialiser les boutons
    artistBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'not-selected');
        btn.textContent = '';
    });

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
        const artistUrl = `${API_BASE_URL}/${appState.category}/random_artistes?pnom=${encodeURIComponent(artistName)}`;
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
        console.error('Erreur:', error);
        alert('Erreur lors du chargement de la question. Passage à la suivante...');
        nextQuestion();
    }
}

function handleAnswer(buttonIndex) {
    const artwork = appState.artworks[appState.currentIndex];
    const selectedBtn = artistBtns[buttonIndex];
    const selectedArtistName = selectedBtn.dataset.artistName;
    const correctArtistName = artwork.nom;
    const isCorrect = selectedArtistName === correctArtistName;

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

function nextQuestion() {
    appState.currentIndex++;
    
    if (appState.currentIndex < appState.artworks.length) {
        loadCurrentQuestion();
    } else {
        showResults();
    }
}

function showResults() {
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
        
        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="result-card">
                <img src="${artwork.img_url}" alt="${artwork.titre}" 
                     onclick="window.open('https://collections.louvre.fr/ark:/53355/${artwork.id}', '_blank')">
                <h5>${artwork.titre || 'Sans titre'}</h5>
                <p><strong>${correctArtistName}</strong></p>
                ${artwork.autre ? `<p class="text-muted small">${artwork.autre}</p>` : ''}
                <div class="mt-2">
                    ${answer.isCorrect 
                        ? '<span class="badge bg-success">✓ Correct</span>' 
                        : '<span class="badge bg-danger">✗ Incorrect</span>'}
                </div>
            </div>
        `;
        resultsList.appendChild(card);
    });

    showScreen(resultsScreen);
}

function resetApp() {
    appState.category = 'Peintures'; // Remettre Peintures par défaut
    appState.itemCount = 5;
    appState.level = 3;
    appState.artworks = [];
    appState.currentIndex = 0;
    appState.answers = [];
    appState.currentArtists = [];
    
    // Réinitialiser les boutons de sélection
    categoryBtns.forEach(b => b.classList.remove('active'));
    categoryBtns[0].classList.add('active'); // Sélectionner Peintures par défaut
    
    // Réinitialiser les réglages
    updateSettingsUI();
    
    startBtn.disabled = false; // Activer le bouton
    startBtn.textContent = 'Commencer le quiz';
}

// Démarrer l'application
init();

}); // Fin DOMContentLoaded
