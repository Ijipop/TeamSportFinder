"""
Commande pour créer des données de test pour Tournois, Équipes et Demandes
"""
import uuid
from django.core.management.base import BaseCommand
from accounts.models import User
from tournaments.models import Tournament, Team
from requestes.models import JoinRequest


class Command(BaseCommand):
    help = "Crée des données de test pour le projet TeamSportFinder"

    def handle(self, *args, **options):
        # --- Créer des utilisateurs ---
        users_data = [
            {"email": "alice@example.com", "full_name": "Alice Dupont"},
            {"email": "bob@example.com", "full_name": "Bob Martin"},
            {"email": "charlie@example.com", "full_name": "Charlie Tremblay"},
        ]
        users = []
        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "full_name": data["full_name"],
                    "role": "player",
                    # ⚠️ Génère un clerk_id unique pour éviter les doublons
                    "clerk_id": str(uuid.uuid4()),
                }
            )
            users.append(user)
            self.stdout.write(
                self.style.SUCCESS(f"Utilisateur {'créé' if created else 'existant'}: {user.full_name}")
            )

        # --- Créer un tournoi ---
        tournament, created = Tournament.objects.get_or_create(
            name="Hackathon Cup",
            defaults={
                "sport": "Soccer",
                "city": "Montréal",
                "organizer": users[0],  # Alice comme organisatrice
                "start_date": "2025-12-01",
            }
        )
        self.stdout.write(
            self.style.SUCCESS(f"Tournament {'créé' if created else 'existant'}: {tournament.name}")
        )

        # --- Créer des équipes ---
        teams_data = [
            {"name": "Les Dragons", "tournament": tournament, "max_capacity": 5},
            {"name": "Les Phoenix", "tournament": tournament, "max_capacity": 5},
        ]
        teams = []
        for data in teams_data:
            team, created = Team.objects.get_or_create(
                name=data["name"],
                tournament=data["tournament"],
                defaults={"max_capacity": data["max_capacity"], "current_capacity": 0}
            )
            teams.append(team)
            self.stdout.write(
                self.style.SUCCESS(f"Équipe {'créée' if created else 'existante'}: {team.name}")
            )

        # --- Créer des demandes d’adhésion ---
        join_requests_data = [
            {"player": users[1], "team": teams[0], "status": "pending"},
            {"player": users[2], "team": teams[1], "status": "pending"},
        ]
        for data in join_requests_data:
            jr, created = JoinRequest.objects.get_or_create(
                player=data["player"],
                team=data["team"],
                defaults={
                    "status": data["status"],
                    "message": f"Je veux rejoindre {data['team'].name}",
                }
            )
            self.stdout.write(
                self.style.SUCCESS(f"JoinRequest {'créée' if created else 'existante'}: {jr}")
            )