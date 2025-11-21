from .models import Team, Tournament
from rest_framework import serializers

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

        read_only_fields = ['id', 'created_at'] # put any attributs that can't be modified!

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

        read_only_fields = ['id', 'created_at']