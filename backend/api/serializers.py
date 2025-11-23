from rest_framework import serializers
from accounts.models import User
from players.models import PlayerProfile
from tournaments.models import Tournament, Team
from requestes.models import JoinRequest
from matches.models import Match

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

# class PlayerProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PlayerProfile
#         fields = "__all__"

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__"

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"

class JoinRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = "__all__"

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"


# from rest_framework import serializers
# from tournaments.models import Team
# from accounts.models import User

# class TeamSerializer(serializers.ModelSerializer):
#     places_disponibles = serializers.SerializerMethodField()
#     membres = serializers.StringRelatedField(many=True)

#     class Meta:
#         model = Team
#         fields = [
#             "id", "name", "tournament", "max_capacity", "current_capacity",
#             "places_disponibles", "membres"
#         ]

#     def get_places_disponibles(self, obj):
#         return obj.max_capacity - obj.current_capacity