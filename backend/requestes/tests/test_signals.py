import pytest
from accounts.models import User
from tournaments.models import Tournament, Team
from requestes.models import JoinRequest

@pytest.mark.django_db
def test_accept_request_adds_player():
    organizer = User.objects.create(email="org@test.com", full_name="Org", clerk_id="clerk_org", role="organizer")
    player = User.objects.create(email="player@test.com", full_name="Player", clerk_id="clerk_player", role="player")
    tournament = Tournament.objects.create(name="Tournoi Test", sport="Soccer", city="Montreal", start_date="2025-01-01", organizer=organizer)
    team = Team.objects.create(name="Dragons", tournament=tournament, max_capacity=2)

    req = JoinRequest.objects.create(player=player, team=team, status="accepted")

    team.refresh_from_db()
    assert player in team.members.all()
    assert team.current_capacity == 1


@pytest.mark.django_db
def test_reject_request_if_team_full():
    organizer = User.objects.create(email="org@test.com", full_name="Org", clerk_id="clerk_org", role="organizer")
    p1 = User.objects.create(email="p1@test.com", full_name="P1", clerk_id="clerk_p1", role="player")
    p2 = User.objects.create(email="p2@test.com", full_name="P2", clerk_id="clerk_p2", role="player")
    tournament = Tournament.objects.create(name="Tournoi Test", sport="Soccer", city="Montreal", start_date="2025-01-01", organizer=organizer)
    team = Team.objects.create(name="Dragons", tournament=tournament, max_capacity=1)

    # Première demande acceptée
    JoinRequest.objects.create(player=p1, team=team, status="accepted")
    team.refresh_from_db()
    assert team.current_capacity == 1

    # Deuxième demande devrait être rejetée automatiquement
    req2 = JoinRequest.objects.create(player=p2, team=team, status="accepted")
    req2.refresh_from_db()
    assert req2.status == "rejected"
    assert p2 not in team.members.all()


@pytest.mark.django_db
def test_delete_request_removes_player():
    organizer = User.objects.create(email="org@test.com", full_name="Org", clerk_id="clerk_org", role="organizer")
    player = User.objects.create(email="player@test.com", full_name="Player", clerk_id="clerk_player", role="player")
    tournament = Tournament.objects.create(name="Tournoi Test", sport="Soccer", city="Montreal", start_date="2025-01-01", organizer=organizer)
    team = Team.objects.create(name="Dragons", tournament=tournament, max_capacity=2)

    req = JoinRequest.objects.create(player=player, team=team, status="accepted")
    team.refresh_from_db()
    assert player in team.members.all()

    # Suppression de la demande
    req.delete()
    team.refresh_from_db()
    assert player not in team.members.all()
    assert team.current_capacity == 0


@pytest.mark.django_db
def test_role_consistency_signal():
    # Organizer doit être staff
    org = User.objects.create(email="org@test.com", full_name="Org", clerk_id="clerk_org", role="organizer")
    assert org.is_staff is True

    # Player ne doit pas être staff
    player = User.objects.create(email="player@test.com", full_name="Player", clerk_id="clerk_player", role="player")
    assert player.is_staff is False