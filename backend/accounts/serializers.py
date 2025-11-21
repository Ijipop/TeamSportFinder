from .models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

        read_only_fields = ['id', 'clerk_id', 'created_at'] # put any attributs that can't be modified!