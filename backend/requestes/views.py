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
        if self.action in ['create', 'my_requests', 'cancel']:
            return [IsAuthenticated(), IsPlayer()]
        elif self.action in ['update', 'partial_update', 'received_requests', 'accept', 'reject']:
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

    @action(detail=True, methods=['post'], url_path='accept', permission_classes=[IsAuthenticated, IsOrganizer])
    def accept(self, request, pk=None):
        """
        Organisateur : accepter une demande d'adhésion.
        - Vérifie que l'organisateur est propriétaire du tournoi
        - Vérifie que la demande est en statut 'pending'
        - Met le statut à 'accepted'
        - Le signal Django ajoutera automatiquement le joueur à l'équipe
        """
        try:
            join_request = self.get_object()
        except JoinRequest.DoesNotExist:
            return Response(
                {"error": "Demande introuvable."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que l'organisateur est bien le propriétaire du tournoi
        if join_request.team.tournament.organizer != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à gérer cette demande."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que la demande est en attente
        if join_request.status != 'pending':
            return Response(
                {"error": f"Cette demande a déjà été traitée (statut: {join_request.get_status_display()})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que l'équipe n'est pas pleine
        if join_request.team.is_full:
            return Response(
                {"error": "L'équipe est déjà complète. Impossible d'accepter la demande."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accepter la demande
        join_request.status = 'accepted'
        join_request.save()

        # Le signal Django s'occupera d'ajouter le joueur à l'équipe
        serializer = JoinRequestDetailSerializer(join_request)
        return Response(
            {
                "message": "Demande acceptée avec succès. Le joueur a été ajouté à l'équipe.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[IsAuthenticated, IsOrganizer])
    def reject(self, request, pk=None):
        """
        Organisateur : refuser une demande d'adhésion.
        - Vérifie que l'organisateur est propriétaire du tournoi
        - Vérifie que la demande est en statut 'pending'
        - Met le statut à 'rejected'
        """
        try:
            join_request = self.get_object()
        except JoinRequest.DoesNotExist:
            return Response(
                {"error": "Demande introuvable."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que l'organisateur est bien le propriétaire du tournoi
        if join_request.team.tournament.organizer != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à gérer cette demande."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que la demande est en attente
        if join_request.status != 'pending':
            return Response(
                {"error": f"Cette demande a déjà été traitée (statut: {join_request.get_status_display()})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Refuser la demande
        join_request.status = 'rejected'
        join_request.save()

        serializer = JoinRequestDetailSerializer(join_request)
        return Response(
            {
                "message": "Demande refusée avec succès.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='cancel', permission_classes=[IsAuthenticated, IsPlayer])
    def cancel(self, request, pk=None):
        """
        Joueur : annuler sa propre demande d'adhésion.
        - Vérifie que le joueur est bien l'auteur de la demande
        - Vérifie que la demande est en statut 'pending'
        - Supprime la demande
        """
        try:
            join_request = self.get_object()
        except JoinRequest.DoesNotExist:
            return Response(
                {"error": "Demande introuvable."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que le joueur est bien l'auteur de la demande
        if join_request.player != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à annuler cette demande."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que la demande est en attente
        if join_request.status != 'pending':
            return Response(
                {"error": f"Impossible d'annuler une demande déjà traitée (statut: {join_request.get_status_display()})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Supprimer la demande
        join_request.delete()

        return Response(
            {
                "message": "Demande annulée avec succès."
            },
            status=status.HTTP_200_OK
        )