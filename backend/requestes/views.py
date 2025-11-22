# from django.shortcuts import render

# # Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from requestes.models import JoinRequest
from accounts.permissions import IsPlayer, IsOrganizer
from tournaments.models import Team
from accounts.serializers import (
    JoinRequestSerializer,
    JoinRequestDetailSerializer,
    JoinRequestUpdateSerializer
)


class JoinRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les demandes d'adhésion.
    - Joueur : créer une demande, voir ses demandes
    - Organisateur : voir les demandes reçues, accepter/refuser
    """
    queryset = JoinRequest.objects.all()
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permissions dynamiques selon l'action et le rôle
        """
        if self.action in ['create', 'my_requests']:
            return [IsAuthenticated(), IsPlayer()]
        elif self.action in ['update', 'partial_update', 'received_requests']:
            return [IsAuthenticated(), IsOrganizer()]
        return [IsAuthenticated()]
    def get_serializer_class(self):
        if self.action == 'create':
            return JoinRequestSerializer
        elif self.action in ['update', 'partial_update']:
            return JoinRequestUpdateSerializer
        return JoinRequestDetailSerializer

    # --- Actions personnalisées ---
    @action(detail=False, methods=['get'], url_path='my', permission_classes=[IsAuthenticated, IsPlayer])
    def my_requests(self, request):
        """Joueur : voir toutes ses demandes"""
        qs = JoinRequest.objects.filter(player=request.user)
        serializer = JoinRequestDetailSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='received', permission_classes=[IsAuthenticated, IsOrganizer])
    def received_requests(self, request):
        """Organisateur : voir toutes les demandes reçues"""
        qs = JoinRequest.objects.filter(team__tournament__organizer=request.user)
        serializer = JoinRequestDetailSerializer(qs, many=True)
        return Response(serializer.data)