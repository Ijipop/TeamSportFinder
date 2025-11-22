# accounts/serializers.py
"""
Serializers pour l'API REST
"""

from requestes.models import JoinRequest
from tournaments.models import Team
from .models import User
from rest_framework import serializers

# --- USER ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

        read_only_fields = ['id', 'clerk_id', 'created_at'] # put any attributs that can't be modified!

# --- JOIN REQUEST CREATION ---
class JoinRequestSerializer(serializers.ModelSerializer):
    team_id = serializers.UUIDField(write_only=True)
    message = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = JoinRequest
        fields = ['id', 'team_id', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        team_id = data.get('team_id')

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            raise serializers.ValidationError("Équipe introuvable.")

        # Vérifier que l'équipe n'est pas pleine
        if team.is_full:
            raise serializers.ValidationError("Cette équipe est déjà complète.")

        # Vérifier qu'il n'existe pas déjà une demande
        if JoinRequest.objects.filter(player=user, team=team).exists():
            raise serializers.ValidationError("Vous avez déjà envoyé une demande à cette équipe.")

        data['team'] = team
        data['player'] = user
        return data

    def create(self, validated_data):
        return JoinRequest.objects.create(
            player=validated_data['player'],
            team=validated_data['team'],
            message=validated_data.get('message', '')
        )


# --- JOIN REQUEST DETAIL (affichage joueur/organisateur) ---
class JoinRequestDetailSerializer(serializers.ModelSerializer):
    player = UserSerializer(read_only=True)
    team = serializers.SerializerMethodField()
    tournament = serializers.SerializerMethodField()

    class Meta:
        model = JoinRequest
        fields = ['id', 'player', 'team', 'tournament', 'status', 'message', 'created_at']

    def get_team(self, obj):
        return {
            "id": str(obj.team.id),
            "name": obj.team.name,
            "current_capacity": obj.team.current_capacity,
            "max_capacity": obj.team.max_capacity,
        }

    def get_tournament(self, obj):
        return {
            "id": str(obj.team.tournament.id),
            "name": obj.team.tournament.name,
            "sport": obj.team.tournament.sport,
            "city": obj.team.tournament.city,
        }


# --- JOIN REQUEST UPDATE (organisateur) ---
class JoinRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = ['status']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status')

        if new_status == 'accepted':
            team = instance.team
            if team.is_full:
                raise serializers.ValidationError("Impossible d'accepter, l'équipe est pleine.")
            team.members.add(instance.player)
            team.current_capacity += 1
            team.save()

        instance.status = new_status
        instance.save()
        return instance
