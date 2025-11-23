from .models import Team, Tournament
from rest_framework import serializers
from accounts.models import User
from accounts.serializers import UserSerializer

# --- TEAM SERIALIZERS ---

class TeamCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une équipe (avec tournament_id)
    """
    tournament_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Team
        fields = ['name', 'tournament_id', 'max_capacity']
    
    def validate_name(self, value):
        """Valide que le nom n'est pas vide"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom de l'équipe ne peut pas être vide.")
        return value.strip()
    
    def validate_max_capacity(self, value):
        """Valide que la capacité maximale est positive"""
        if value <= 0:
            raise serializers.ValidationError("La capacité maximale doit être supérieure à 0.")
        if value > 50:
            raise serializers.ValidationError("La capacité maximale ne peut pas dépasser 50.")
        return value
    
    def validate(self, data):
        """Valide que le tournoi existe et que l'utilisateur est l'organisateur"""
        tournament_id = data.get('tournament_id')
        user = self.context['request'].user
        
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            raise serializers.ValidationError({"tournament_id": "Tournoi introuvable."})
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if tournament.organizer != user:
            raise serializers.ValidationError({"tournament_id": "Vous n'êtes pas l'organisateur de ce tournoi."})
        
        data['tournament'] = tournament
        return data


class TeamUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour mettre à jour une équipe (sans tournament_id)
    """
    class Meta:
        model = Team
        fields = ['name', 'max_capacity']
    
    def validate_name(self, value):
        """Valide que le nom n'est pas vide"""
        if value and not value.strip():
            raise serializers.ValidationError("Le nom de l'équipe ne peut pas être vide.")
        return value.strip() if value else value
    
    def validate_max_capacity(self, value):
        """Valide que la capacité maximale est positive"""
        if value is not None:
            if value <= 0:
                raise serializers.ValidationError("La capacité maximale doit être supérieure à 0.")
            if value > 50:
                raise serializers.ValidationError("La capacité maximale ne peut pas dépasser 50.")
            # Vérifier que la nouvelle capacité n'est pas inférieure au nombre actuel de membres
            if hasattr(self, 'instance') and self.instance:
                if value < self.instance.current_capacity:
                    raise serializers.ValidationError(
                        f"La capacité maximale ne peut pas être inférieure au nombre actuel de membres ({self.instance.current_capacity})."
                    )
        return value


class TeamListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour lister les équipes
    """
    tournament_name = serializers.SerializerMethodField()
    tournament_id = serializers.SerializerMethodField()
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'tournament_name',
            'tournament_id',
            'max_capacity',
            'current_capacity',
            'available_spots',
            'is_full',
            'created_at',
        ]
        read_only_fields = ['id', 'tournament_name', 'tournament_id', 'created_at', 'available_spots', 'is_full']
    
    def get_tournament_name(self, obj):
        """Retourne le nom du tournoi"""
        return obj.tournament.name if obj.tournament else None
    
    def get_tournament_id(self, obj):
        """Retourne l'ID du tournoi"""
        return str(obj.tournament.id) if obj.tournament else None


class TeamSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher une équipe avec toutes les informations
    """
    tournament = serializers.StringRelatedField(read_only=True)
    tournament_id = serializers.UUIDField(source='tournament.id', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    tournament_sport = serializers.CharField(source='tournament.sport', read_only=True)
    members = serializers.StringRelatedField(many=True, read_only=True)
    members_count = serializers.IntegerField(source='current_capacity', read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'tournament',
            'tournament_id',
            'tournament_name',
            'tournament_sport',
            'max_capacity',
            'current_capacity',
            'members_count',
            'available_spots',
            'is_full',
            'members',
            'created_at',
        ]
        read_only_fields = ['id', 'tournament', 'tournament_id', 'tournament_name', 'tournament_sport', 'members', 'created_at', 'members_count', 'available_spots', 'is_full']


# --- TOURNAMENT SERIALIZERS ---

class TournamentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un tournoi (sans organizer, il sera ajouté automatiquement)
    """
    class Meta:
        model = Tournament
        fields = ['name', 'sport', 'city', 'start_date']
    
    def validate_name(self, value):
        """Valide que le nom n'est pas vide"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom du tournoi ne peut pas être vide.")
        return value.strip()
    
    def validate_sport(self, value):
        """Valide que le sport n'est pas vide"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le sport ne peut pas être vide.")
        return value.strip()
    
    def validate_city(self, value):
        """Valide que la ville n'est pas vide"""
        if not value or not value.strip():
            raise serializers.ValidationError("La ville ne peut pas être vide.")
        return value.strip()


class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher un tournoi avec toutes les informations
    """
    organizer = UserSerializer(read_only=True)
    organizer_id = serializers.UUIDField(source='organizer.id', read_only=True)
    team_count = serializers.SerializerMethodField()
    total_players = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id',
            'name',
            'sport',
            'city',
            'start_date',
            'organizer',
            'organizer_id',
            'team_count',
            'total_players',
            'created_at',
        ]
        read_only_fields = ['id', 'organizer', 'organizer_id', 'created_at']
    
    def get_team_count(self, obj):
        """Retourne le nombre d'équipes dans le tournoi"""
        return obj.teams.count()
    
    def get_total_players(self, obj):
        """Retourne le nombre total de joueurs dans toutes les équipes du tournoi"""
        total = 0
        for team in obj.teams.all():
            total += team.current_capacity
        return total


class TournamentListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour lister les tournois (moins de détails)
    """
    organizer_name = serializers.SerializerMethodField()
    team_count = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id',
            'name',
            'sport',
            'city',
            'start_date',
            'organizer_name',
            'team_count',
            'created_at',
        ]
        read_only_fields = ['id', 'organizer_name', 'created_at']
    
    def get_organizer_name(self, obj):
        """Retourne le nom de l'organisateur"""
        return obj.organizer.full_name if obj.organizer else None
    
    def get_team_count(self, obj):
        """Retourne le nombre d'équipes dans le tournoi"""
        return obj.teams.count()