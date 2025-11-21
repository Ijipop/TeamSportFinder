from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid

from backend.accounts.models import User
from backend.players.models import PlayerProfile


class PlayerProfileAPITestCase(TestCase):
    """
    Tests pour les endpoints du profil joueur
    """
    
    def setUp(self):
        """
        Configuration initiale pour chaque test
        """
        # Créer un utilisateur joueur pour les tests
        self.player_user = User.objects.create(
            id=uuid.uuid4(),
            clerk_id='clerk_test_player_123',
            email='player@test.com',
            full_name='Joueur Test',
            role='player '
        )
        
        # Créer un client API
        self.client = APIClient()
        
        # Simuler l'authentification en forçant request.user
        # (Dans un vrai test, on utiliserait un token JWT, mais ici on simplifie)
        self.client.force_authenticate(user=self.player_user)
    
    def test_create_player_profile(self):
        """
        Test 1: Créer un profil joueur
        """
        url = '/api/players/profile/'
        data = {
            'city': 'Paris',
            'favorite_sport': 'Football',
            'level': 'intermediate ',
            'position': 'Attaquant'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['city'], 'Paris')
        self.assertEqual(response.data['favorite_sport'], 'Football')
        self.assertEqual(response.data['level'], 'intermediate ')
        self.assertEqual(response.data['position'], 'Attaquant')
        
        # Vérifier que le profil a été créé en base
        profile = PlayerProfile.objects.get(user=self.player_user)
        self.assertEqual(profile.city, 'Paris')
        self.assertEqual(profile.favorite_sport, 'Football')
    
    def test_get_player_profile(self):
        """
        Test 2: Récupérer le profil joueur
        """
        # Créer d'abord un profil
        PlayerProfile.objects.create(
            user=self.player_user,
            city='Lyon',
            favorite_sport='Basketball',
            level='advanced ',
            position='Meneur'
        )
        
        url = '/api/players/profile/'
        response = self.client.get(url)
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['city'], 'Lyon')
        self.assertEqual(response.data['favorite_sport'], 'Basketball')
        self.assertEqual(response.data['level'], 'advanced ')
        self.assertEqual(response.data['email'], 'player@test.com')
        self.assertEqual(response.data['full_name'], 'Joueur Test')
    
    def test_get_profile_not_found(self):
        """
        Test 3: Récupérer un profil qui n'existe pas
        """
        url = '/api/players/profile/'
        response = self.client.get(url)
        
        # Vérifier que ça retourne 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Profil non trouvé', response.data['detail'])
    
    def test_update_player_profile_put(self):
        """
        Test 4: Mettre à jour complètement le profil (PUT)
        """
        # Créer d'abord un profil
        PlayerProfile.objects.create(
            user=self.player_user,
            city='Paris',
            favorite_sport='Football',
            level='beginner ',
            position='Gardien'
        )
        
        url = '/api/players/profile/'
        data = {
            'city': 'Marseille',
            'favorite_sport': 'Tennis',
            'level': 'advanced ',
            'position': 'Joueur'
        }
        
        response = self.client.put(url, data, format='json')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['city'], 'Marseille')
        self.assertEqual(response.data['favorite_sport'], 'Tennis')
        self.assertEqual(response.data['level'], 'advanced ')
        
        # Vérifier en base
        profile = PlayerProfile.objects.get(user=self.player_user)
        self.assertEqual(profile.city, 'Marseille')
        self.assertEqual(profile.favorite_sport, 'Tennis')
    
    def test_update_player_profile_patch(self):
        """
        Test 5: Mettre à jour partiellement le profil (PATCH)
        """
        # Créer d'abord un profil
        PlayerProfile.objects.create(
            user=self.player_user,
            city='Paris',
            favorite_sport='Football',
            level='intermediate ',
            position='Attaquant'
        )
        
        url = '/api/players/profile/'
        data = {
            'city': 'Lyon'  # Seulement changer la ville
        }
        
        response = self.client.patch(url, data, format='json')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['city'], 'Lyon')
        # Les autres champs doivent rester inchangés
        self.assertEqual(response.data['favorite_sport'], 'Football')
        self.assertEqual(response.data['level'], 'intermediate ')
        
        # Vérifier en base
        profile = PlayerProfile.objects.get(user=self.player_user)
        self.assertEqual(profile.city, 'Lyon')
        self.assertEqual(profile.favorite_sport, 'Football')
    
    def test_create_duplicate_profile(self):
        """
        Test 6: Essayer de créer un deuxième profil (doit échouer)
        """
        # Créer un premier profil
        PlayerProfile.objects.create(
            user=self.player_user,
            city='Paris',
            favorite_sport='Football',
            level='intermediate ',
            position='Attaquant'
        )
        
        url = '/api/players/profile/'
        data = {
            'city': 'Lyon',
            'favorite_sport': 'Basketball',
            'level': 'advanced ',
            'position': 'Meneur'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Vérifier que ça retourne une erreur 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('déjà un profil', response.data['detail'])
    
    def test_delete_player_profile(self):
        """
        Test 7: Supprimer le profil joueur
        """
        # Créer d'abord un profil
        PlayerProfile.objects.create(
            user=self.player_user,
            city='Paris',
            favorite_sport='Football',
            level='intermediate ',
            position='Attaquant'
        )
        
        url = '/api/players/profile/'
        response = self.client.delete(url)
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Vérifier que le profil a été supprimé
        self.assertFalse(PlayerProfile.objects.filter(user=self.player_user).exists())
    
    def test_unauthorized_access(self):
        """
        Test 8: Accès non authentifié (sans token)
        """
        # Créer un nouveau client sans authentification
        unauthenticated_client = APIClient()
        
        url = '/api/players/profile/'
        response = unauthenticated_client.get(url)
        
        # Vérifier que ça retourne 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_invalid_level(self):
        """
        Test 9: Créer un profil avec un niveau invalide
        """
        url = '/api/players/profile/'
        data = {
            'city': 'Paris',
            'favorite_sport': 'Football',
            'level': 'invalid_level',  # Niveau invalide
            'position': 'Attaquant'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Vérifier que ça retourne une erreur de validation
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('niveau', str(response.data).lower())


class PlayerProfilePermissionsTestCase(TestCase):
    """
    Tests pour les permissions (seuls les joueurs peuvent créer un profil)
    """
    
    def setUp(self):
        """
        Configuration initiale
        """
        # Créer un utilisateur organisateur (pas un joueur)
        self.organizer_user = User.objects.create(
            id=uuid.uuid4(),
            clerk_id='clerk_test_organizer_123',
            email='organizer@test.com',
            full_name='Organisateur Test',
            role='organizer '  # Pas un joueur !
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.organizer_user)
    
    def test_organizer_cannot_create_profile(self):
        """
        Test: Un organisateur ne peut pas créer un profil joueur
        """
        url = '/api/players/profile/'
        data = {
            'city': 'Paris',
            'favorite_sport': 'Football',
            'level': 'intermediate ',
            'position': 'Attaquant'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Vérifier que ça retourne 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('joueurs', response.data['detail'].lower())
