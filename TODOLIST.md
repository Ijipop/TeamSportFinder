# 📋 Todo List - TeamSportFinder 🏆

## 1️⃣ Setup complet du projet

📌 **Référence** : Planning Jour 1, page 16

- [x] Créer le repo Git (backend + frontend)
- [x] Installer Django + DRF
- [ ] Configurer PostgreSQL Neon
- [ ] Installer et configurer Clerk (clé publique + JWT)
- [ ] Créer projet React + Vite
- [ ] Ajouter Tailwind ou Material UI
- [ ] Ajouter Axios avec intercepteur JWT

---

## 2️⃣ Créer les modèles Django (Backend)

📌 **Référence** : pages 5 à 8 (diagramme et modèles)

- [ ] User (clerk_id, email, role)
- [ ] PlayerProfile
- [ ] Tournament
- [ ] Team
- [ ] JoinRequest ⚠️ _(cœur du système)_
- [ ] Match

**Faire ensuite :**
- [ ] `python manage.py makemigrations`
- [ ] `python manage.py migrate`

---

## 3️⃣ API Auth + Profils

📌 **Référence** : Section 4.1 et 4.2, pages 9 à 10

- [ ] Auth via Clerk (middleware JWT)
- [ ] CRUD du profil joueur
- [ ] Dashboard organisateur (statistiques)

---

## 4️⃣ API Tournois

📌 **Référence** : Section 4.3, page 10

**Endpoints :**
- [ ] Créer tournoi
- [ ] Lister mes tournois
- [ ] Détails tournoi
- [ ] Modifier/Supprimer

---

## 5️⃣ API Équipes

📌 **Référence** : Section 4.4, pages 11–12

**Organisateur :**
- [ ] Créer équipe
- [ ] Modifier / supprimer
- [ ] Voir les membres

**Joueur :**
- [ ] Rechercher équipes disponibles
- [ ] Détails d'une équipe

---

## 6️⃣ API JoinRequest (fonctionnalité centrale) ⭐

📌 **Référence** : Section 4.5, pages 12–13

> C'est le cœur de ton projet 💙

**Côté joueur :**
- [ ] Envoyer demande
- [ ] Voir mes demandes
- [ ] Annuler demande (si pending)

**Côté organisateur :**
- [ ] Voir demandes reçues
- [ ] Accepter / Refuser
- [ ] Logique métier complète
- [ ] Ajouter joueur
- [ ] Incrémenter capacité
- [ ] Empêcher demande si équipe pleine

---

## 7️⃣ API Matchs

📌 **Référence** : Section 4.6, page 14

- [ ] Organisateur : créer / modifier / supprimer
- [ ] Joueur : voir ses matchs (équipe A ou B)

---

## 8️⃣ Frontend – Structure (React)

📌 **Référence** : Planning Jour 2, pages 16–17

- [ ] Routes principales
- [ ] Intégration Clerk UI (login / signup)
- [ ] Axios configuré
- [ ] Layout (header, sidebar, footer)

---

## 9️⃣ Pages joueur

📌 **Référence** : Planning Jour 2, page 17

- [ ] Profil
- [ ] Recherche équipes
- [ ] Détails équipe
- [ ] Mes demandes
- [ ] Mes matchs

---

## 🔟 Pages organisateur

📌 **Référence** : Planning Jour 3, page 18

- [ ] Dashboard
- [ ] Gestion tournois
- [ ] Gestion équipes
- [ ] Gestion demandes
- [ ] Gestion matchs

---

## 1️⃣1️⃣ Polissage & UX ✨

📌 **Référence** : Planning Jour 3, pages 18–19

- [ ] États de chargement
- [ ] Validation formulaires
- [ ] Gestion erreurs API
- [ ] Feedback visuel (toast, couleurs)
- [ ] Responsive

---

## 1️⃣2️⃣ Documentation & Tests 📚

📌 **Référence** : pages 20–21

- [ ] README complet
- [ ] Documentation API
- [ ] Diagramme BDD
- [ ] Tests manuels
- [ ] Préparer la démo

---

## 🟦 Résumé ultra-court des étapes (10 points)

- [ ] Setup projet
- [ ] Modèles Django
- [ ] Auth + Profils
- [ ] Tournois
- [ ] Équipes
- [ ] JoinRequests (core)
- [ ] Matchs
- [ ] Setup React + Layout
- [ ] Pages joueur + organisateur
- [ ] Polish + Doc + Démo

---

*Bonne chance avec ton projet ! 🚀*
