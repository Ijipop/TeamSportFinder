# 📋 Ce qui manque au projet TeamSportFinder

## ✅ Ce qui est FAIT

### Backend
- ✅ Modèles (User, PlayerProfile, Tournament, Team, JoinRequest, Match)
- ✅ API Auth + Profils joueurs
- ✅ API Tournois (CRUD complet)
- ✅ API Équipes (CRUD complet)
- ✅ API JoinRequest (partielle : créer, voir mes demandes, voir demandes reçues)
- ❌ API Matchs (modèle existe mais pas de ViewSet)

### Frontend
- ✅ Structure React + Material UI
- ✅ Authentification Clerk
- ✅ Dashboard Organisateur (liste tournois + création)
- ✅ Dashboard Joueur
- ✅ Page Tournois (liste tous les tournois)
- ✅ Page Profil
- ❌ Pages joueur manquantes
- ❌ Pages organisateur manquantes

---

## ❌ Ce qui MANQUE

### 🔴 Backend (Priorité HAUTE)

#### 1. API JoinRequest - Actions accept/reject
**Fichier**: `backend/requestes/views.py`

**Manque**:
- Action `accept` pour accepter une demande
- Action `reject` pour refuser une demande
- Validation que l'organisateur est bien le propriétaire du tournoi

**À ajouter**:
```python
@action(detail=True, methods=['post'], url_path='accept')
def accept(self, request, pk=None):
    """Organisateur : accepter une demande"""
    # Vérifier que l'organisateur est propriétaire du tournoi
    # Mettre status = 'accepted'
    # Le signal ajoutera automatiquement le joueur à l'équipe
```

```python
@action(detail=True, methods=['post'], url_path='reject')
def reject(self, request, pk=None):
    """Organisateur : refuser une demande"""
    # Vérifier que l'organisateur est propriétaire du tournoi
    # Mettre status = 'rejected'
```

#### 2. API Matchs - CRUD complet
**Fichier**: `backend/matches/views.py` (actuellement vide)

**À créer**:
- `MatchViewSet` avec :
  - **Organisateur** : `create`, `update`, `partial_update`, `destroy`, `list` (ses matchs)
  - **Joueur** : `list` (matchs de ses équipes), `retrieve` (détails d'un match)
- Serializers pour Match
- URLs pour MatchViewSet
- Permissions (IsOrganizer pour créer/modifier, IsPlayerOrOrganizer pour lire)

---

### 🟡 Frontend - Services (Priorité MOYENNE)

#### 3. JoinRequestService.ts
**Fichier**: `frontend/TeamSportFinder/src/core/services/JoinRequestService.ts`

**Fonctions à créer**:
- `createJoinRequest(teamId, message?)` - Envoyer une demande
- `getMyRequests()` - Voir mes demandes (joueur)
- `getReceivedRequests()` - Voir demandes reçues (organisateur)
- `acceptRequest(requestId)` - Accepter une demande
- `rejectRequest(requestId)` - Refuser une demande
- `cancelRequest(requestId)` - Annuler ma demande (joueur)

#### 4. MatchService.ts
**Fichier**: `frontend/TeamSportFinder/src/core/services/MatchService.ts`

**Fonctions à créer**:
- `getMatches(tournamentId?)` - Liste des matchs
- `getMyMatches()` - Mes matchs (joueur)
- `getMatch(matchId)` - Détails d'un match
- `createMatch(data)` - Créer un match (organisateur)
- `updateMatch(matchId, data)` - Modifier un match (organisateur)
- `deleteMatch(matchId)` - Supprimer un match (organisateur)

---

### 🟢 Frontend - Pages Joueur (Priorité MOYENNE)

#### 5. RechercheEquipesPage.tsx
**Route**: `/teams/search` ou `/teams`

**Fonctionnalités**:
- Barre de recherche d'équipes
- Filtres (par tournoi, par sport, disponibles seulement)
- Liste des équipes avec détails (nom, tournoi, places disponibles, membres)
- Bouton "Demander à rejoindre" sur chaque équipe
- Dialog pour voir les détails complets d'une équipe

#### 6. MesDemandesPage.tsx
**Route**: `/my-requests`

**Fonctionnalités**:
- Liste de toutes mes demandes (pending, accepted, rejected)
- Statut visuel (badge coloré)
- Bouton "Annuler" pour les demandes pending
- Affichage de l'équipe et du tournoi pour chaque demande

#### 7. MesMatchsPage.tsx
**Route**: `/my-matches`

**Fonctionnalités**:
- Liste de tous mes matchs (équipes où je suis membre)
- Filtres (par tournoi, par date)
- Détails du match (équipe A vs équipe B, date, lieu, scores)
- Affichage de l'équipe à laquelle j'appartiens

---

### 🔵 Frontend - Pages Organisateur (Priorité MOYENNE)

#### 8. GestionEquipesPage.tsx
**Route**: `/dashboard-organizer/teams`

**Fonctionnalités**:
- Liste de toutes mes équipes (tous mes tournois)
- Filtres par tournoi
- Créer une nouvelle équipe (dialog avec formulaire)
- Modifier une équipe (nom, capacité max)
- Supprimer une équipe
- Voir les membres d'une équipe
- Retirer un membre d'une équipe

#### 9. GestionDemandesPage.tsx
**Route**: `/dashboard-organizer/requests`

**Fonctionnalités**:
- Liste de toutes les demandes reçues (tous mes tournois)
- Filtres (par tournoi, par équipe, par statut)
- Voir les détails d'une demande (joueur, équipe, message)
- Boutons "Accepter" et "Refuser" pour les demandes pending
- Affichage du statut de chaque demande

#### 10. GestionMatchsPage.tsx
**Route**: `/dashboard-organizer/matches`

**Fonctionnalités**:
- Liste de tous mes matchs (tous mes tournois)
- Filtres par tournoi
- Créer un nouveau match (dialog avec formulaire : équipe A, équipe B, date, lieu)
- Modifier un match (date, lieu, scores)
- Supprimer un match
- Voir les détails d'un match

---

### ⚪ Frontend - Routes (Priorité BASSE)

#### 11. Ajouter les routes dans AppRouter.tsx

**Routes à ajouter**:
```typescript
// Pages joueur
<Route path="/teams/search" element={<RoleProtectedRoute allowedRoles={['player']}>...</Route>
<Route path="/my-requests" element={<RoleProtectedRoute allowedRoles={['player']}>...</Route>
<Route path="/my-matches" element={<RoleProtectedRoute allowedRoles={['player']}>...</Route>

// Pages organisateur
<Route path="/dashboard-organizer/teams" element={<RoleProtectedRoute allowedRoles={['organizer']}>...</Route>
<Route path="/dashboard-organizer/requests" element={<RoleProtectedRoute allowedRoles={['organizer']}>...</Route>
<Route path="/dashboard-organizer/matches" element={<RoleProtectedRoute allowedRoles={['organizer']}>...</Route>
```

---

## 📊 Résumé par priorité

### 🔴 URGENT (Backend - Fonctionnalités critiques)
1. ✅ API JoinRequest - Actions accept/reject
2. ✅ API Matchs - CRUD complet

### 🟡 IMPORTANT (Frontend - Services)
3. ✅ JoinRequestService.ts
4. ✅ MatchService.ts

### 🟢 NÉCESSAIRE (Frontend - Pages)
5. ✅ RechercheEquipesPage.tsx
6. ✅ MesDemandesPage.tsx
7. ✅ MesMatchsPage.tsx
8. ✅ GestionEquipesPage.tsx
9. ✅ GestionDemandesPage.tsx
10. ✅ GestionMatchsPage.tsx

### ⚪ FINALISATION (Routes)
11. ✅ Ajouter toutes les routes dans AppRouter.tsx

---

## 🎯 Ordre recommandé d'implémentation

1. **Backend JoinRequest** (accept/reject) - 30 min
2. **Backend Matchs** (CRUD complet) - 1h
3. **Frontend Services** (JoinRequestService + MatchService) - 30 min
4. **Frontend Pages Joueur** (3 pages) - 2h
5. **Frontend Pages Organisateur** (3 pages) - 2h
6. **Routes** - 15 min

**Temps total estimé**: ~6h15

---

*Dernière mise à jour: 23 novembre 2025*

