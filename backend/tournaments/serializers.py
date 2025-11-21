from .models import Team, Tournament
from rest_framework import serializers
from accounts.models import User

class TeamSerializer(serializers.ModelSerializer):
    tournament = serializers.StringRelatedField(read_only=True)
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Team
        fields = '__all__'

        read_only_fields = ['id', 'created_at'] # put any attributs that can't be modified!

class TournamentSerializer(serializers.ModelSerializer):
    organizer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'

        read_only_fields = ['id', 'created_at']