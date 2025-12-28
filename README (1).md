# ArtQuiz - Quiz sur les œuvres du Louvre

Application web de quiz pour tester vos connaissances sur les peintures et sculptures du Louvre.

## Fonctionnalités

- 🎨 Quiz sur les peintures et sculptures
- 📊 Choix entre 5 ou 10 œuvres par session
- 📱 Interface responsive (desktop et mobile)
- 🎯 Score et récapitulatif détaillé
- 🔗 Liens directs vers les collections du Louvre

## Technologies utilisées

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5.3.2
- API REST personnalisée

## Structure du projet

```
artquiz/
│
├── index.html      # Page principale
├── styles.css      # Styles CSS
├── app.js          # Logique JavaScript
└── README.md       # Ce fichier
```

## Installation locale

1. Clonez ce repository :
```bash
git clone https://github.com/votre-username/artquiz.git
cd artquiz
```

2. Ouvrez `index.html` dans votre navigateur

Ou utilisez un serveur local :
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js
npx http-server
```

## Déploiement sur GitHub Pages

### Méthode 1 : Via l'interface GitHub

1. Créez un nouveau repository sur GitHub
2. Uploadez les fichiers `index.html`, `styles.css`, et `app.js`
3. Allez dans **Settings** > **Pages**
4. Sous **Source**, sélectionnez la branche `main` et le dossier `/ (root)`
5. Cliquez sur **Save**
6. Votre site sera disponible à : `https://votre-username.github.io/artquiz/`

### Méthode 2 : Via Git

1. Créez un nouveau repository sur GitHub (ex: `artquiz`)

2. Initialisez Git localement :
```bash
git init
git add .
git commit -m "Initial commit - ArtQuiz application"
```

3. Connectez au repository distant :
```bash
git remote add origin https://github.com/votre-username/artquiz.git
git branch -M main
git push -u origin main
```

4. Activez GitHub Pages :
   - Allez dans **Settings** > **Pages**
   - Sélectionnez la branche `main`
   - Cliquez sur **Save**

5. Attendez quelques minutes et visitez :
   `https://votre-username.github.io/artquiz/`

## Utilisation de l'API

L'application utilise l'API REST suivante :

### Endpoints

**Récupérer des œuvres aléatoires :**
```
GET /artquiz_api/{Peintures|Sculptures}/random_items?nb_items={5|10}
```

**Récupérer des artistes pour une œuvre :**
```
GET /artquiz_api/{Peintures|Sculptures}/random_artistes?pnom={nom_artiste}
```

Exemple :
```
GET /artquiz_api/Peintures/random_artistes?pnom=Delacroix
```

### Structure des données

**Œuvre (artwork) :**
- `id` : Identifiant unique (numéro ARK)
- `titre` : Titre de l'œuvre
- `nom` : Nom de l'artiste auteur de l'œuvre
- `dd` : Date de création
- `img_url` : URL de l'image
- `legende` : URL de l'image (légende)
- `autre` : Informations complémentaires (dimensions au format "H:XXm;L:YYm")
- `copyright` : Information de copyright

**Artiste (depuis random_artistes) :**
- `nom` : Nom de l'artiste

**Exemple de réponse random_items :**
```json
{
  "items": [
    {
      "i": 0,
      "id": 1,
      "nom": "Chardin, Jean Baptiste Siméon",
      "titre": "Pipes et vase à boire, dit aussi La Tabagie",
      "dd": "1750",
      "img_url": "https://collections.louvre.fr/media/cache/large/...",
      "autre": "H:0,32m;L:0,42m"
    }
  ],
  "count": 5
}
```

## Fonctionnement

1. **Sélection** : L'utilisateur choisit entre Peintures ou Sculptures et le nombre d'œuvres (5 ou 10)

2. **Quiz** :
   - Une œuvre s'affiche avec 4 noms d'artistes
   - L'utilisateur clique sur l'artiste qu'il pense être l'auteur
   - Le bouton correct s'affiche en vert, l'incorrect en rouge
   - Passage automatique à la question suivante

3. **Résultats** :
   - Affichage du score
   - Liste des œuvres avec miniatures
   - Clic sur une image pour ouvrir la fiche du Louvre
   - Option pour rejouer

## Responsive Design

### Desktop
- Image à droite en pleine hauteur
- Boutons en grille 2x2 à gauche

### Mobile
- Image en haut (hauteur réduite)
- Boutons empilés verticalement en dessous

## Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans `styles.css` :
```css
:root {
    --primary-color: #0d6efd;
    --success-color: #28a745;
    --danger-color: #dc3545;
}
```

### Modifier l'URL de l'API
Dans `app.js`, modifiez :
```javascript
const API_BASE_URL = 'https://votre-api.com';
```

## Compatibilité

- Chrome (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Edge (dernières versions)
- Mobile (iOS Safari, Chrome Android)

## Licence

Ce projet est libre d'utilisation pour des fins éducatives et personnelles.

## Auteur

Patrick - 2025

## Remerciements

- Collections du Musée du Louvre
- Bootstrap pour le framework CSS
