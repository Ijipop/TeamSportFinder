from rest_framework import serializers
from matches.models import Match
from tournaments.models import Team
from tournaments.serializers import TeamListSerializer


class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher un match avec toutes les informations
    """
    team_a = TeamListSerializer(read_only=True)
    team_b = TeamListSerializer(read_only=True)
    tournament_name = serializers.SerializerMethodField()
    tournament_id = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            'id', 'team_a', 'team_b', 'date', 'location',
            'score_a', 'score_b', 'tournament_name', 'tournament_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_tournament_name(self, obj):
        """Retourne le nom du tournoi (les deux équipes doivent être du même tournoi)"""
        return obj.team_a.tournament.name if obj.team_a.tournament else None

    def get_tournament_id(self, obj):
        """Retourne l'ID du tournoi"""
        return str(obj.team_a.tournament.id) if obj.team_a.tournament else None


class MatchCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un match
    - Vérifie que les deux équipes sont du même tournoi
    - Vérifie que l'organisateur est propriétaire du tournoi
    """
    team_a_id = serializers.UUIDField(write_only=True)
    team_b_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Match
        fields = ['team_a_id', 'team_b_id', 'date', 'location', 'score_a', 'score_b']
        read_only_fields = ['score_a', 'score_b']  # Les scores sont optionnels à la création

    def validate(self, data):
        """Valide que les deux équipes sont du même tournoi et que l'utilisateur est l'organisateur"""
        team_a_id = data.get('team_a_id')
        team_b_id = data.get('team_b_id')
        user = self.context['request'].user

        # Vérifier que les deux équipes existent
        try:
            team_a = Team.objects.select_related('tournament').get(id=team_a_id)
            team_b = Team.objects.select_related('tournament').get(id=team_b_id)
        except Team.DoesNotExist:
            raise serializers.ValidationError("Une ou plusieurs équipes sont introuvables.")

        # Vérifier que les deux équipes sont du même tournoi
        if team_a.tournament != team_b.tournament:
            raise serializers.ValidationError(
                "Les deux équipes doivent appartenir au même tournoi."
            )

        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if team_a.tournament.organizer != user:
            raise serializers.ValidationError(
                "Vous n'êtes pas l'organisateur de ce tournoi."
            )

        # Vérifier que les deux équipes sont différentes
        if team_a == team_b:
            raise serializers.ValidationError(
                "Une équipe ne peut pas jouer contre elle-même."
            )

        data['team_a'] = team_a
        data['team_b'] = team_b
        return data

    def create(self, validated_data):
        """Crée le match"""
        # Retirer team_a_id et team_b_id car on utilise team_a et team_b
        validated_data.pop('team_a_id', None)
        validated_data.pop('team_b_id', None)
        return Match.objects.create(**validated_data)


class MatchUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour modifier un match
    - On ne peut modifier que la date, le lieu et les scores
    - On ne peut pas changer les équipes
    """
    class Meta:
        model = Match
        fields = ['date', 'location', 'score_a', 'score_b']

    def validate(self, data):
        """Validation optionnelle pour les scores"""
        score_a = data.get('score_a')
        score_b = data.get('score_b')

        # Si un score est fourni, il doit être >= 0
        if score_a is not None and score_a < 0:
            raise serializers.ValidationError({"score_a": "Le score ne peut pas être négatif."})
        if score_b is not None and score_b < 0:
            raise serializers.ValidationError({"score_b": "Le score ne peut pas être négatif."})

        return data


class MatchListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour lister les matchs
    """
    team_a_name = serializers.CharField(source='team_a.name', read_only=True)
    team_b_name = serializers.CharField(source='team_b.name', read_only=True)
    tournament_name = serializers.CharField(source='team_a.tournament.name', read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'team_a_name', 'team_b_name', 'date', 'location',
            'score_a', 'score_b', 'tournament_name', 'created_at'
        ]

