from .models import Payment
from rest_framework import serializers

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        # TODO Model needs to be done first, then edit here if needed.
        model = Payment
        fields = '__all__'

        read_only_fields = ['id', 'created_at'] # put any attributs that can't be modified!