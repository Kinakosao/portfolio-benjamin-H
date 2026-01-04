# Portfolio Statique - Guide de Personnalisation et de Déploiement

Félicitations ! La structure de base de votre portfolio est prête. Suivez les étapes ci-dessous pour le personnaliser et le mettre en ligne avec GitHub Pages.

---

## 1. Personnaliser le Contenu

Ouvrez le fichier `index.html` avec un éditeur de code (comme VS Code, Sublime Text, etc.) et modifiez les sections suivantes.

### Titres et Nom
- **Ligne 31 :** Remplacez `[Votre Nom]` par votre nom complet.
- **Ligne 74 :** Faites de même dans le pied de page (footer).

```html
<!-- Ligne 31 -->
<h1>[Votre Nom]</h1>

<!-- Ligne 74 -->
<p>&copy; 2025 [Votre Nom]. Tous droits réservés.</p>
```

### Projets
- **Lignes 54 à 70 :** Vous trouverez trois blocs de projet.
- **`<h5>` :** Remplacez `Nom du Projet X` par le vrai nom de votre projet.
- **`<p>` :** Décrivez brièvement votre projet.
- **`<a>` (le `href` du bouton) :** Remplacez `#` par le lien direct vers votre projet sur GitHub.

```html
<!-- Exemple pour un projet -->
<div class="col-md-4 mb-4">
    <div class="card project-card">
        <div class="card-body text-center">
            <h5 class="card-title">Mon Super Projet Java</h5>
            <p class="card-text">Un logiciel de gestion de bibliothèque développé en Java avec une base de données SQL.</p>
            <a href="https://github.com/votre-pseudo/mon-super-projet" class="btn btn-primary">Voir sur GitHub</a>
        </div>
    </div>
</div>
```

### Liens de Contact
- **Lignes 89 à 91 :**
- **GitHub :** Remplacez `#` par le lien de votre profil GitHub.
- **LinkedIn :** Remplacez `#` par le lien de votre profil LinkedIn.
- **Email :** Remplacez `votre.email@example.com` par votre adresse e-mail.

```html
<!-- Ligne 89 -->
<a href="https://github.com/votre-pseudo" class="btn btn-dark m-2">GitHub</a>
<a href="https://linkedin.com/in/votre-profil" class="btn btn-primary m-2">LinkedIn</a>
<a href="mailto:votre.email@example.com" class="btn btn-danger m-2">Email</a>
```

### Image de fond (Optionnel)
- **Fichier `style.css`, ligne 15 :** Si vous souhaitez changer l'image, remplacez l'URL `https://source.unsplash.com/...` par une autre URL ou une image locale que vous ajouterez au dossier.

---

## 2. Déployer sur GitHub Pages

Suivez ces étapes pour mettre votre site en ligne gratuitement.

### Étape A : Créer un dépôt sur GitHub
1. Connectez-vous à votre compte [GitHub](https://github.com).
2. Créez un **nouveau dépôt** (New repository).
3. **Nommez votre dépôt** de la manière suivante : `votre-pseudo.github.io`. Remplacez `votre-pseudo` par votre nom d'utilisateur GitHub. C'est très important pour que le lien fonctionne directement.
4. Assurez-vous que le dépôt est **Public**.
5. Cliquez sur **Create repository**.

### Étape B : Envoyer les fichiers sur GitHub
1.  **Installez Git** sur votre ordinateur si ce n'est pas déjà fait : [git-scm.com](https://git-scm.com/downloads)
2.  Dans votre terminal, naviguez jusqu'au dossier de votre portfolio (`/home/ben/porto`).
3.  Exécutez les commandes suivantes, une par une, en remplaçant `votre-pseudo` :

```bash
# Initialiser le dépôt Git local
git init
git add .
git commit -m "Première version du portfolio"

# Lier votre dépôt local au dépôt distant sur GitHub
git branch -M main
git remote add origin https://github.com/votre-pseudo/votre-pseudo.github.io.git

# Envoyer vos fichiers
git push -u origin main
```

### Étape C : Activer GitHub Pages
Normalement, si vous avez bien nommé votre dépôt `votre-pseudo.github.io`, GitHub déploie automatiquement le site.

1.  Attendez une minute ou two.
2.  Votre site sera accessible à l'adresse : `https://votre-pseudo.github.io`

**Si ça ne fonctionne pas :**
1. Allez dans les **Settings** (Paramètres) de votre dépôt sur GitHub.
2. Allez dans la section **Pages** (dans le menu de gauche).
3. Sous "Branch", assurez-vous que la branche `main` est sélectionnée et cliquez sur **Save**.
4. Le site devrait être déployé après quelques instants.

---

Votre portfolio est maintenant en ligne et prêt à être partagé !