from django.shortcuts import render
from accounts.models import User
from accounts.serializers import UserSerializer
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import AnonymousUser
from clerk_auth.utils import get_or_create_user_from_clerk
from clerk_auth.permissions import IsClerkAuthenticated

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # ✔ protège l'accès

@api_view(['GET'])
@permission_classes([IsClerkAuthenticated])
def get_current_user(request):
    """
    Endpoint pour récupérer l'utilisateur actuel
    Retourne 404 si l'utilisateur n'existe pas encore dans la base de données
    (l'utilisateur doit s'inscrire via /register avant de pouvoir se connecter)
    """
    try:
        # L'utilisateur peut être AnonymousUser si il n'existe pas encore dans Django
        user = request.user
        
        # Vérifier que l'utilisateur existe dans la base de données Django
        if isinstance(user, AnonymousUser) or not hasattr(user, 'id') or not user.id:
            return Response(
                {'error': 'Compte non trouvé. Veuillez vous inscrire d\'abord.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération de l\'utilisateur: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsClerkAuthenticated])
def create_user_from_clerk(request):
    """
    Endpoint pour créer l'utilisateur lors de l'inscription
    Utilisé après que l'utilisateur ait complété l'inscription Clerk
    Accepte les utilisateurs authentifiés avec Clerk même s'ils n'existent pas encore dans Django
    """
    try:
        # Récupérer les infos depuis le token Clerk (déjà vérifié par l'authentification)
        clerk_user_id = getattr(request, 'clerk_user_id', None)
        clerk_email = getattr(request, 'clerk_email', None)
        clerk_role_from_token = getattr(request, 'clerk_role', 'player')
        
        if not clerk_user_id or not clerk_email:
            return Response(
                {'error': 'Informations Clerk manquantes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si l'utilisateur existe déjà
        try:
            existing_user = User.objects.get(clerk_id=clerk_user_id)
            # L'utilisateur existe déjà, retourner ses données
            serializer = UserSerializer(existing_user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            pass  # L'utilisateur n'existe pas, on va le créer
        
        # Récupérer le nom depuis les métadonnées Clerk ou le body
        full_name = request.data.get('full_name') or request.data.get('name')
        
        # Récupérer le rôle depuis le body de la requête (OBLIGATOIRE)
        role_from_body = request.data.get('role')
        
        # Si aucun rôle n'est fourni dans le body, NE PAS utiliser le rôle du token
        # L'utilisateur doit choisir son rôle explicitement
        if not role_from_body or role_from_body not in ['player', 'organizer']:
            return Response(
                {'error': 'Le rôle est obligatoire. Veuillez choisir un rôle (player ou organizer).'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        final_role = role_from_body
        
        # Créer l'utilisateur
        user = get_or_create_user_from_clerk(
            clerk_user_id=clerk_user_id,
            email=clerk_email,
            full_name=full_name,
            role=final_role
        )
        
        # S'assurer que le rôle est bien défini
        if user.role != final_role:
            user.role = final_role
            user.save()
        
        serializer = UserSerializer(user)
        # Log pour déboguer
        print(f"Utilisateur créé avec le rôle: {user.role}, final_role: {final_role}")
        print(f"Données sérialisées: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Erreur lors de la création de l'utilisateur: {str(e)}")
        print(f"Traceback: {error_trace}")
        return Response(
            {'error': f'Erreur lors de la création de l\'utilisateur: {str(e)}', 'details': error_trace if __debug__ else None},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )