// Mode quiz artiste spécifique (Oui/Non)

async function loadCurrentQuestionArtistMode() {
    const artwork = window.appState.artworks[window.appState.currentIndex];
    
    // Mettre à jour la progression
    window.currentQuestionEl.textContent = window.appState.currentIndex + 1;
    const progressPercent = ((window.appState.currentIndex + 1) / window.appState.itemCount) * 100;
    window.progressBar.style.width = `${progressPercent}%`;

    // Réinitialiser l'interface
    window.artistsContainer.classList.add('d-none');
    window.loadingArtists.classList.remove('d-none');
    window.artworkImage.classList.add('d-none');
    window.artworkLoading.classList.remove('d-none');

    // Réactiver et réinitialiser les boutons (on n'en utilisera que 2)
    window.artistBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'not-selected', 'active');
        btn.textContent = '';
        btn.blur();
    });
    
    // Double sécurité : retirer active après un court délai
    setTimeout(() => {
        window.artistBtns.forEach(btn => {
            btn.classList.remove('active');
        });
    }, 50);

    try {
        // Charger l'image
        const img = new Image();
        img.onload = () => {
            window.artworkImage.src = artwork.img_url;
            window.artworkImage.classList.remove('d-none');
            window.artworkLoading.classList.add('d-none');
            console.log('Image chargée!');
        };
        img.onerror = () => {
            window.artworkLoading.innerHTML = '<p class="text-danger">Erreur de chargement de l\'image</p>';
            console.error('Erreur chargement image');
        };
        img.src = artwork.img_url;

        // Afficher seulement 2 boutons : Oui / Non
        const artistName = window.appState.filters.artiste.nom;
        
        // Bouton 0: OUI
        window.artistBtns[0].textContent = `Oui (${artistName})`;
        window.artistBtns[0].dataset.artistName = artwork.nom; // Le vrai nom de l'artiste de l'œuvre
        window.artistBtns[0].dataset.isYes = 'true';
        window.artistBtns[0].classList.remove('d-none');
        
        // Bouton 1: NON
        window.artistBtns[1].textContent = 'Non';
        window.artistBtns[1].dataset.artistName = 'NOT_' + artwork.nom; // Marqueur pour "non"
        window.artistBtns[1].dataset.isYes = 'false';
        window.artistBtns[1].classList.remove('d-none');
        
        // Cacher les boutons 2 et 3
        window.artistBtns[2].classList.add('d-none');
        window.artistBtns[3].classList.add('d-none');

        window.loadingArtists.classList.add('d-none');
        window.artistsContainer.classList.remove('d-none');
        console.log('Boutons Oui/Non affichés!');

    } catch (error) {
        console.error('Erreur complète:', error);
        console.error('Stack:', error.stack);
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            alert('Erreur de connexion à l\'API.\n\nRetour à l\'écran d\'accueil...');
            window.resetApp();
            window.showScreen(window.selectionScreen);
        } else {
            alert('Erreur lors du chargement de la question.\n\nRetour à l\'écran d\'accueil...');
            window.resetApp();
            window.showScreen(window.selectionScreen);
        }
    }
}

// Gérer la réponse en mode artiste
function handleAnswerArtistMode(buttonIndex) {
    const artwork = window.appState.artworks[window.appState.currentIndex];
    const selectedBtn = window.artistBtns[buttonIndex];
    const isYesButton = selectedBtn.dataset.isYes === 'true';
    const artistName = window.appState.filters.artiste.nom;
    
    // L'œuvre est-elle vraiment de cet artiste ?
    const isCorrectArtist = artwork.nom === artistName;
    
    // La réponse est correcte si :
    // - On a cliqué "Oui" ET c'est le bon artiste
    // - On a cliqué "Non" ET ce n'est PAS le bon artiste
    const isCorrect = (isYesButton && isCorrectArtist) || (!isYesButton && !isCorrectArtist);
    
    // Forcer le blur du bouton pour éviter qu'il reste en focus
    window.artistBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.blur();
    });
    selectedBtn.blur();
    document.activeElement.blur();

    // Enregistrer la réponse
    window.appState.answers.push({
        artwork: artwork,
        selectedAnswer: isYesButton ? 'Oui' : 'Non',
        correctAnswer: isCorrectArtist ? 'Oui' : 'Non',
        isCorrect: isCorrect
    });

    // Désactiver les boutons et montrer le feedback
    window.artistBtns.forEach((btn, idx) => {
        if (idx < 2) { // Seulement les 2 premiers boutons
            btn.disabled = true;
            
            const btnIsYes = btn.dataset.isYes === 'true';
            const shouldBeYes = isCorrectArtist;
            
            if ((btnIsYes && shouldBeYes) || (!btnIsYes && !shouldBeYes)) {
                btn.classList.add('correct');
            } else if (btn === selectedBtn) {
                btn.classList.add('incorrect');
            } else {
                btn.classList.add('not-selected');
            }
        }
    });

    // Passer à la question suivante après un délai
    setTimeout(() => {
        window.nextQuestion();
    }, 1500);
}
