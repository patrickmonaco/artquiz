# ⚠️ Erreur ERR_INTERNET_DISCONNECTED en local

## Pourquoi cette erreur ?

Si vous voyez l'erreur `ERR_INTERNET_DISCONNECTED` quand vous testez l'application en local (en ouvrant directement `index.html` ou via le mode responsive du navigateur), c'est **NORMAL**.

Ce n'est **PAS** un problème de connexion Internet, mais un **problème CORS** (Cross-Origin Resource Sharing).

## Qu'est-ce que CORS ?

CORS est un mécanisme de sécurité des navigateurs qui empêche les requêtes JavaScript depuis une origine (domaine) vers une autre origine, sauf si le serveur l'autorise explicitement.

### Le problème en local :

- **Origine de votre page** : `file:///` ou `http://localhost`
- **Origine de l'API** : `https://rome.gotocity.eu`
- **Résultat** : Le navigateur bloque la requête pour des raisons de sécurité

## ✅ Solutions

### Solution 1 : Déployer sur GitHub Pages (Recommandé)

Une fois déployée sur GitHub Pages, l'application aura une origine HTTPS valide et l'API Oracle ORDS acceptera les requêtes.

```bash
# 1. Créez un repository sur GitHub
# 2. Uploadez les fichiers
# 3. Activez GitHub Pages dans Settings > Pages
# 4. Votre application sera accessible à : https://votre-username.github.io/artquiz/
```

### Solution 2 : Serveur local avec Python

Au lieu d'ouvrir le fichier directement, lancez un serveur local :

```bash
# Avec Python 3
cd chemin/vers/artquiz
python -m http.server 8000

# Puis ouvrez : http://localhost:8000
```

### Solution 3 : Serveur local avec Node.js

```bash
# Installer http-server globalement
npm install -g http-server

# Lancer le serveur
cd chemin/vers/artquiz
http-server -p 8000

# Puis ouvrez : http://localhost:8000
```

### Solution 4 : Extension Chrome pour désactiver CORS (Déconseillé)

**⚠️ À utiliser uniquement pour les tests, jamais en production !**

1. Installez l'extension "CORS Unblock" ou "Allow CORS"
2. Activez-la uniquement pendant vos tests
3. Désactivez-la après

## 🎯 Pourquoi ça fonctionne sur GitHub Pages ?

Sur GitHub Pages, votre application a une vraie origine HTTPS :
- `https://votre-username.github.io/artquiz/`

Oracle ORDS est généralement configuré pour accepter les requêtes depuis des origines HTTPS valides, donc tout fonctionne normalement.

## 🔒 Pour restreindre l'accès à GitHub Pages uniquement

Si vous voulez que votre API n'accepte que les requêtes depuis GitHub Pages, configurez CORS sur Oracle ORDS :

```sql
BEGIN
  ORDS.set_custom_attribute(
    p_module_name => 'artquiz_api',
    p_attribute   => 'cors.allowed.origins',
    p_value       => 'https://votre-username.github.io'
  );
END;
/
```

## 📝 Note importante

L'application **fonctionne parfaitement** une fois déployée. L'erreur en local est une protection normale du navigateur et n'indique pas un problème avec votre code.
