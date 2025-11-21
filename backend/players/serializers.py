from rest_framework import serializers
from players.models import PlayerProfile
from accounts.models import User


class PlayerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil joueur
    """
    # Inclure les infos de l'utilisateur (lecture seule)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = PlayerProfile
        fields = [
            'id',
            'user_id',
            'email',
            'full_name',
            'role',
            'city',
            'favorite_sport',
            'level',
            'position',
        ]
        read_only_fields = ['id']
    
    def validate_level(self, value):
        """
        Valide que le niveau est valide
        """
        valid_levels = ['beginner', 'intermediate', 'advanced']
        if value not in valid_levels:
            raise serializers.ValidationError(
                f"Le niveau doit être l'un des suivants: débutant, intermédiaire, avancé"
            )
        return value


class PlayerProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un profil joueur
    """
    class Meta:
        model = PlayerProfile
        fields = ['city', 'favorite_sport', 'level', 'position']
    
    def validate_level(self, value):
        """
        Valide que le niveau est valide
        """
        valid_levels = ['beginner', 'intermediate', 'advanced']
        if value not in valid_levels:
            raise serializers.ValidationError(
                f"Le niveau doit être l'un des suivants: débutant, intermédiaire, avancé"
            )
        return value

