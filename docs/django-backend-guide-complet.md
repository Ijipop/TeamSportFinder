# Guide Complet Backend Django + DRF + PostgreSQL + Stripe + Clerk

## Table des Matières
1. [Installation et Configuration Initiale](#1-installation-et-configuration-initiale)
2. [Configuration PostgreSQL (Neon)](#2-configuration-postgresql-neon)
3. [Configuration du Projet Django](#3-configuration-du-projet-django)
4. [Modèles de Données](#4-modèles-de-données)
5. [Configuration Clerk (Authentication JWT)](#5-configuration-clerk-authentication-jwt)
6. [Configuration Stripe](#6-configuration-stripe)
7. [Serializers DRF](#7-serializers-drf)
8. [Views et Endpoints API](#8-views-et-endpoints-api)
9. [URLs et Routing](#9-urls-et-routing)
10. [Django Admin](#10-django-admin)
11. [Tests et Déploiement](#11-tests-et-déploiement)


---

## 1. Installation et Configuration Initiale

### 1.1 Prérequis
```bash
# Vérifier les versions
python --version  # Python 3.9+
pip --version
```

### 1.2 Création de l'Environnement Virtuel
```bash
# Créer un dossier pour le projet
mkdir course-platform-backend
cd course-platform-backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur macOS/Linux:
source venv/bin/activate
```

### 1.3 Installation des Dépendances
```bash
# Installer Django et les packages nécessaires
pip install django==5.0
pip install djangorestframework==3.14.0
pip install psycopg2-binary==2.9.9  # Pour PostgreSQL
pip install python-dotenv==1.0.0    # Pour les variables d'environnement
pip install stripe==7.0.0           # SDK Stripe
pip install pyjwt==2.8.0            # Pour JWT
pip install cryptography==41.0.7    # Dépendance pour JWT
pip install django-cors-headers==4.3.1  # Pour CORS
pip install requests==2.31.0        # Pour appels HTTP (Clerk)

# Sauvegarder les dépendances
pip freeze > requirements.txt
```

**Explication des packages:**
- **django**: Framework web principal
- **djangorestframework**: Pour créer des API REST
- **psycopg2-binary**: Adaptateur PostgreSQL pour Python
- **python-dotenv**: Gestion des variables d'environnement
- **stripe**: SDK officiel Stripe pour les paiements
- **pyjwt**: Décodage et validation des tokens JWT de Clerk
- **django-cors-headers**: Autoriser les requêtes cross-origin du frontend React

---

## 2. Configuration PostgreSQL (Neon)

### 2.1 Créer une Base de Données sur Neon

1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte et un nouveau projet
3. Créez une base de données (ex: `course_platform_db`)
4. Copiez la **Connection String** qui ressemble à:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/course_platform_db?sslmode=require
   ```

### 2.2 Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet:
```bash
touch .env
```

Contenu du fichier `.env`:
```env
# Django
SECRET_KEY=your-django-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/course_platform_db?sslmode=require

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000
```

**Créez aussi un fichier `.env.example`** (sans les vraies valeurs):
```env
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_JWKS_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=http://localhost:3000
```

### 2.3 Ajouter .env au .gitignore
```bash
echo ".env" >> .gitignore
echo "venv/" >> .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "db.sqlite3" >> .gitignore
```

---

## 3. Configuration du Projet Django

### 3.1 Créer le Projet Django
```bash
# Créer le projet Django (le point à la fin crée dans le dossier courant)
django-admin startproject config .

# Structure créée:
# course-platform-backend/
# ├── config/
# │   ├── __init__.py
# │   ├── settings.py
# │   ├── urls.py
# │   ├── asgi.py
# │   └── wsgi.py
# ├── manage.py
# ├── venv/
# └── .env
```

### 3.2 Créer l'Application Django
```bash
# Créer l'app "courses" qui contiendra notre logique métier
python manage.py startapp courses

# Structure de l'app:
# courses/
# ├── migrations/
# ├── __init__.py
# ├── admin.py
# ├── apps.py
# ├── models.py
# ├── tests.py
# └── views.py
```

### 3.3 Configuration de settings.py

Remplacez le contenu de `config/settings.py`:

```python
"""
Configuration Django pour le projet Course Platform
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-change-this')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',           # Django REST Framework
    'corsheaders',              # CORS headers
    
    # Local apps
    'courses.apps.CoursesConfig',  # Notre application
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS - doit être en haut
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# Configuration PostgreSQL avec Neon
import dj_database_url

# Si DATABASE_URL existe dans .env, l'utiliser, sinon SQLite par défaut
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'America/Toronto'  # Ou votre fuseau horaire
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# DJANGO REST FRAMEWORK CONFIGURATION
# =============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'courses.authentication.ClerkJWTAuthentication',  # Notre auth custom
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
# Autoriser le frontend React à faire des requêtes
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# =============================================================================
# CLERK CONFIGURATION
# =============================================================================
CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
CLERK_PUBLISHABLE_KEY = os.getenv('CLERK_PUBLISHABLE_KEY')
CLERK_JWKS_URL = os.getenv('CLERK_JWKS_URL')

# =============================================================================
# STRIPE CONFIGURATION
# =============================================================================
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

# =============================================================================
# LOGGING (optionnel mais recommandé)
# =============================================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

**Installer le package manquant:**
```bash
pip install dj-database-url==2.1.0
pip freeze > requirements.txt
```

---

## 4. Modèles de Données

### 4.1 Créer les Modèles dans courses/models.py

```python
"""
Modèles de données pour la plateforme de cours
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Course(models.Model):
    """
    Modèle représentant un cours
    """
    # Informations de base
    title = models.CharField(
        max_length=200,
        verbose_name="Titre du cours",
        help_text="Titre complet du cours"
    )
    
    description = models.TextField(
        verbose_name="Description",
        help_text="Description détaillée du cours"
    )
    
    slug = models.SlugField(
        max_length=200,
        unique=True,
        verbose_name="Slug",
        help_text="Identifiant unique pour l'URL (ex: python-pour-debutants)"
    )
    
    # Prix et disponibilité
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Prix",
        help_text="Prix du cours en dollars"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif",
        help_text="Le cours est-il disponible à l'achat ?"
    )
    
    # Métadonnées
    instructor_name = models.CharField(
        max_length=200,
        verbose_name="Nom de l'instructeur",
        blank=True
    )
    
    duration_hours = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Durée (heures)",
        help_text="Durée estimée du cours en heures"
    )
    
    thumbnail_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name="URL de la miniature",
        help_text="URL de l'image du cours"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créé le"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifié le"
    )
    
    class Meta:
        verbose_name = "Cours"
        verbose_name_plural = "Cours"
        ordering = ['-created_at']  # Plus récents en premier
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def enrollment_count(self):
        """Nombre d'étudiants inscrits"""
        return self.enrollments.filter(is_paid=True).count()


class Enrollment(models.Model):
    """
    Modèle représentant une inscription d'un étudiant à un cours
    Relation Many-to-Many entre les étudiants (via Clerk) et les cours
    """
    # Relation avec le cours
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name="Cours"
    )
    
    # Identifiant de l'étudiant depuis Clerk
    clerk_user_id = models.CharField(
        max_length=255,
        verbose_name="ID Utilisateur Clerk",
        help_text="Identifiant unique de l'utilisateur dans Clerk"
    )
    
    # Informations de l'étudiant (dénormalisées pour facilité)
    student_email = models.EmailField(
        verbose_name="Email de l'étudiant",
        help_text="Email de l'étudiant au moment de l'inscription"
    )
    
    student_name = models.CharField(
        max_length=200,
        verbose_name="Nom de l'étudiant",
        blank=True
    )
    
    # Informations de paiement
    price_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Prix payé",
        help_text="Prix payé par l'étudiant (peut différer du prix actuel)"
    )
    
    is_paid = models.BooleanField(
        default=False,
        verbose_name="Payé",
        help_text="Le paiement a-t-il été confirmé ?"
    )
    
    # Informations Stripe
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Payment Intent Stripe",
        help_text="ID du Payment Intent Stripe"
    )
    
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Customer ID Stripe",
        help_text="ID du client dans Stripe"
    )
    
    stripe_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Session ID Stripe",
        help_text="ID de la session de paiement Stripe"
    )
    
    # Timestamps
    enrolled_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Inscrit le"
    )
    
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Payé le"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifié le"
    )
    
    class Meta:
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        ordering = ['-enrolled_at']
        
        # Un étudiant ne peut s'inscrire qu'une seule fois à un cours
        unique_together = ['course', 'clerk_user_id']
        
        indexes = [
            models.Index(fields=['clerk_user_id']),
            models.Index(fields=['is_paid']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]
    
    def __str__(self):
        status = "✓ Payé" if self.is_paid else "✗ Non payé"
        return f"{self.student_email} - {self.course.title} ({status})"
    
    def mark_as_paid(self):
        """Marquer l'inscription comme payée"""
        from django.utils import timezone
        self.is_paid = True
        self.paid_at = timezone.now()
        self.save(update_fields=['is_paid', 'paid_at', 'updated_at'])
```

**Explications des modèles:**

1. **Course (Cours):**
   - Contient toutes les informations d'un cours
   - `slug` permet des URLs lisibles (ex: /courses/python-debutants)
   - `is_active` permet d'activer/désactiver un cours
   - Propriété `enrollment_count` pour afficher le nombre d'inscrits

2. **Enrollment (Inscription):**
   - Relie un étudiant (via son `clerk_user_id`) à un cours
   - Stocke le prix payé (peut différer du prix actuel du cours)
   - `unique_together` empêche les inscriptions multiples
   - Informations Stripe pour le suivi des paiements
   - Méthode `mark_as_paid()` pour mettre à jour le statut

### 4.2 Créer et Appliquer les Migrations

```bash
# Créer les migrations
python manage.py makemigrations

# Voir le SQL qui sera exécuté (optionnel)
python manage.py sqlmigrate courses 0001

# Appliquer les migrations
python manage.py migrate
```

**Sortie attendue:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, courses, sessions
Running migrations:
  Applying courses.0001_initial... OK
```

---

## 5. Configuration Clerk (Authentication JWT)

### 5.1 Créer le Middleware d'Authentification

Créez le fichier `courses/authentication.py`:

```python
"""
Authentification JWT avec Clerk
"""
import jwt
import requests
from django.conf import settings
from rest_framework import authentication, exceptions
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class ClerkJWTAuthentication(authentication.BaseAuthentication):
    """
    Authentification basée sur les JWT tokens de Clerk
    """
    
    def authenticate(self, request):
        """
        Authentifie la requête en vérifiant le JWT token de Clerk
        """
        # Récupérer le token depuis le header Authorization
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None  # Pas de token = pas d'authentification
        
        # Le format attendu est: "Bearer <token>"
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise exceptions.AuthenticationFailed('Format du header Authorization invalide')
        
        token = parts[1]
        
        try:
            # Décoder et valider le JWT
            payload = self.verify_jwt(token)
            
            # Créer un objet utilisateur simplifié
            user = ClerkUser(payload)
            
            return (user, None)  # (user, auth) tuple
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expiré')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Token invalide: {str(e)}')
        except Exception as e:
            logger.error(f"Erreur d'authentification: {str(e)}")
            raise exceptions.AuthenticationFailed('Erreur d\'authentification')
    
    def verify_jwt(self, token):
        """
        Vérifie et décode le JWT token en utilisant les JWKS de Clerk
        """
        # Récupérer les JWKS (JSON Web Key Set) de Clerk
        jwks = self.get_jwks()
        
        # Décoder le header du token pour obtenir le 'kid' (Key ID)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        
        if not kid:
            raise jwt.InvalidTokenError('Token sans kid')
        
        # Trouver la bonne clé dans le JWKS
        signing_key = None
        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                # Construire la clé publique RSA
                signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not signing_key:
            raise jwt.InvalidTokenError('Clé de signature introuvable')
        
        # Décoder et valider le token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=['RS256'],
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iat': True,
            }
        )
        
        return payload
    
    def get_jwks(self):
        """
        Récupère les JWKS de Clerk (avec cache pour optimiser)
        """
        cache_key = 'clerk_jwks'
        jwks = cache.get(cache_key)
        
        if jwks is None:
            # Télécharger les JWKS depuis Clerk
            jwks_url = settings.CLERK_JWKS_URL
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            jwks = response.json()
            
            # Mettre en cache pour 1 heure
            cache.set(cache_key, jwks, 3600)
        
        return jwks


class ClerkUser:
    """
    Classe représentant un utilisateur Clerk
    Compatible avec Django REST Framework
    """
    
    def __init__(self, payload):
        self.payload = payload
        self.clerk_user_id = payload.get('sub')  # 'sub' contient l'user ID
        self.email = payload.get('email', '')
        self.first_name = payload.get('given_name', '')
        self.last_name = payload.get('family_name', '')
        self.is_authenticated = True
        self.is_active = True
    
    @property
    def is_anonymous(self):
        return False
    
    @property
    def full_name(self):
        """Nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def __str__(self):
        return self.email or self.clerk_user_id
```

**Explications:**

1. **ClerkJWTAuthentication:**
   - Hérite de `BaseAuthentication` de DRF
   - Extrait le token du header `Authorization: Bearer <token>`
   - Vérifie le token en utilisant les clés publiques (JWKS) de Clerk
   - Retourne un objet `ClerkUser` si le token est valide

2. **verify_jwt():**
   - Télécharge les clés publiques depuis Clerk (JWKS)
   - Trouve la bonne clé via le `kid` (Key ID)
   - Décode le JWT avec la clé publique RSA

3. **get_jwks():**
   - Cache les clés publiques pour éviter de les télécharger à chaque requête
   - Durée de cache: 1 heure

4. **ClerkUser:**
   - Objet simple représentant l'utilisateur
   - Compatible avec les permissions Django/DRF
   - Contient l'ID Clerk et les infos de base

### 5.2 Configuration du Cache Django

Ajoutez dans `config/settings.py`:

```python
# Cache configuration (pour les JWKS)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

---

## 6. Configuration Stripe

### 6.1 Créer les Utilitaires Stripe

Créez le fichier `courses/stripe_utils.py`:

```python
"""
Utilitaires pour l'intégration Stripe
"""
import stripe
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

# Configurer Stripe avec la clé secrète
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(course, user, success_url, cancel_url):
    """
    Crée une session de paiement Stripe Checkout
    
    Args:
        course: Instance du cours
        user: Objet ClerkUser
        success_url: URL de redirection en cas de succès
        cancel_url: URL de redirection en cas d'annulation
    
    Returns:
        dict: Données de la session Stripe
    """
    try:
        # Créer la session Checkout
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'cad',  # ou 'usd'
                    'unit_amount': int(course.price * 100),  # Stripe utilise les centimes
                    'product_data': {
                        'name': course.title,
                        'description': course.description[:500],  # Limite de caractères
                        'images': [course.thumbnail_url] if course.thumbnail_url else [],
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=user.clerk_user_id,
            customer_email=user.email,
            metadata={
                'course_id': str(course.id),
                'course_slug': course.slug,
                'clerk_user_id': user.clerk_user_id,
            },
        )
        
        logger.info(f"Session Stripe créée: {session.id} pour le cours {course.id}")
        
        return {
            'session_id': session.id,
            'url': session.url,
            'payment_status': session.payment_status,
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Erreur Stripe lors de la création de session: {str(e)}")
        raise Exception(f"Erreur de paiement: {str(e)}")


def create_payment_intent(course, user):
    """
    Crée un Payment Intent Stripe (alternative à Checkout)
    Utilisé pour un paiement direct sans redirection
    
    Args:
        course: Instance du cours
        user: Objet ClerkUser
    
    Returns:
        dict: Données du Payment Intent
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(course.price * 100),
            currency='cad',
            metadata={
                'course_id': str(course.id),
                'clerk_user_id': user.clerk_user_id,
            },
            description=f"Inscription au cours: {course.title}",
        )
        
        logger.info(f"Payment Intent créé: {intent.id} pour le cours {course.id}")
        
        return {
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Erreur Stripe lors de la création du Payment Intent: {str(e)}")
        raise Exception(f"Erreur de paiement: {str(e)}")


def verify_webhook_signature(payload, sig_header):
    """
    Vérifie la signature d'un webhook Stripe
    
    Args:
        payload: Corps de la requête (bytes)
        sig_header: Header 'Stripe-Signature'
    
    Returns:
        dict: Événement Stripe vérifié
    """
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
        return event
    except ValueError:
        # Payload invalide
        raise Exception("Payload webhook invalide")
    except stripe.error.SignatureVerificationError:
        # Signature invalide
        raise Exception("Signature webhook invalide")


def retrieve_session(session_id):
    """
    Récupère les détails d'une session Checkout
    
    Args:
        session_id: ID de la session Stripe
    
    Returns:
        stripe.checkout.Session: Objet session
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return session
    except stripe.error.StripeError as e:
        logger.error(f"Erreur lors de la récupération de la session: {str(e)}")
        raise Exception(f"Session introuvable: {str(e)}")


def create_refund(payment_intent_id, amount=None):
    """
    Crée un remboursement pour un paiement
    
    Args:
        payment_intent_id: ID du Payment Intent
        amount: Montant à rembourser en centimes (None = remboursement total)
    
    Returns:
        stripe.Refund: Objet remboursement
    """
    try:
        refund_params = {'payment_intent': payment_intent_id}
        if amount:
            refund_params['amount'] = amount
        
        refund = stripe.Refund.create(**refund_params)
        logger.info(f"Remboursement créé: {refund.id}")
        return refund
        
    except stripe.error.StripeError as e:
        logger.error(f"Erreur lors du remboursement: {str(e)}")
        raise Exception(f"Erreur de remboursement: {str(e)}")
```

**Explications:**

1. **create_checkout_session():**
   - Crée une session Stripe Checkout (page de paiement hébergée)
   - Ajoute les métadonnées pour identifier le cours et l'étudiant
   - Retourne l'URL de la page de paiement

2. **create_payment_intent():**
   - Alternative pour un paiement direct (sans redirection)
   - Utilisé avec Stripe Elements côté frontend

3. **verify_webhook_signature():**
   - CRITIQUE pour la sécurité
   - Vérifie que les webhooks viennent bien de Stripe

4. **create_refund():**
   - Utile pour rembourser un étudiant

---

## 7. Serializers DRF

### 7.1 Créer les Serializers

Créez le fichier `courses/serializers.py`:

```python
"""
Serializers pour l'API REST
"""
from rest_framework import serializers
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Course
    """
    enrollment_count = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'slug',
            'price',
            'is_active',
            'instructor_name',
            'duration_hours',
            'thumbnail_url',
            'enrollment_count',
            'is_enrolled',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'enrollment_count']
    
    def get_is_enrolled(self, obj):
        """
        Vérifie si l'utilisateur actuel est inscrit à ce cours
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return Enrollment.objects.filter(
                course=obj,
                clerk_user_id=request.user.clerk_user_id,
                is_paid=True
            ).exists()
        return False


class CourseListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour la liste des cours
    """
    enrollment_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'slug',
            'price',
            'instructor_name',
            'duration_hours',
            'thumbnail_url',
            'enrollment_count',
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Enrollment
    """
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id',
            'course',
            'course_title',
            'course_slug',
            'clerk_user_id',
            'student_email',
            'student_name',
            'price_paid',
            'is_paid',
            'stripe_payment_intent_id',
            'stripe_session_id',
            'enrolled_at',
            'paid_at',
        ]
        read_only_fields = [
            'id',
            'clerk_user_id',
            'student_email',
            'student_name',
            'enrolled_at',
            'paid_at',
        ]


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """
    Serializer pour créer une session de paiement Stripe
    """
    course_id = serializers.IntegerField()
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
    
    def validate_course_id(self, value):
        """Vérifie que le cours existe et est actif"""
        try:
            course = Course.objects.get(id=value, is_active=True)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Cours introuvable ou inactif")
        return value


class EnrollmentCreateSerializer(serializers.Serializer):
    """
    Serializer pour créer une inscription (après paiement)
    """
    course_id = serializers.IntegerField()
    stripe_session_id = serializers.CharField(max_length=255)
    
    def validate(self, data):
        """Valide que le cours existe et que l'utilisateur n'est pas déjà inscrit"""
        try:
            course = Course.objects.get(id=data['course_id'], is_active=True)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course_id": "Cours introuvable"})
        
        # Vérifier que l'utilisateur n'est pas déjà inscrit
        user = self.context['request'].user
        if Enrollment.objects.filter(
            course=course,
            clerk_user_id=user.clerk_user_id
        ).exists():
            raise serializers.ValidationError("Vous êtes déjà inscrit à ce cours")
        
        return data


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher les inscriptions d'un étudiant
    """
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id',
            'course',
            'price_paid',
            'is_paid',
            'enrolled_at',
            'paid_at',
        ]
```

**Explications:**

1. **CourseSerializer:**
   - Serializer complet pour un cours
   - `is_enrolled`: champ calculé pour savoir si l'utilisateur est inscrit
   - `enrollment_count`: nombre d'inscrits

2. **CourseListSerializer:**
   - Version allégée pour les listes
   - Optimise les performances en envoyant moins de données

3. **EnrollmentSerializer:**
   - Affiche les inscriptions avec les infos du cours
   - Champs read-only pour la sécurité

4. **CreateCheckoutSessionSerializer:**
   - Valide les données pour créer un paiement
   - Vérifie que le cours existe

5. **StudentEnrollmentSerializer:**
   - Pour afficher les cours d'un étudiant
   - Inclut le cours complet

---

## 8. Views et Endpoints API

### 8.1 Créer les Views

Créez le fichier `courses/views.py`:

```python
"""
Views pour l'API REST
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import logging
import json

from .models import Course, Enrollment
from .serializers import (
    CourseSerializer,
    CourseListSerializer,
    EnrollmentSerializer,
    CreateCheckoutSessionSerializer,
    StudentEnrollmentSerializer,
    EnrollmentCreateSerializer,
)
from .stripe_utils import (
    create_checkout_session,
    verify_webhook_signature,
    retrieve_session,
)

logger = logging.getLogger(__name__)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les cours
    - list: Liste tous les cours actifs
    - retrieve: Détails d'un cours spécifique
    """
    queryset = Course.objects.filter(is_active=True)
    permission_classes = [AllowAny]  # Les cours sont publics
    
    def get_serializer_class(self):
        """Utilise un serializer différent pour la liste et le détail"""
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer
    
    def get_queryset(self):
        """Filtre les cours selon les paramètres de requête"""
        queryset = super().get_queryset()
        
        # Filtrer par instructeur (optionnel)
        instructor = self.request.query_params.get('instructor', None)
        if instructor:
            queryset = queryset.filter(instructor_name__icontains=instructor)
        
        # Recherche par titre ou description (optionnel)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def create_checkout(self, request, pk=None):
        """
        Crée une session de paiement Stripe pour un cours
        POST /api/courses/{id}/create_checkout/
        
        Body:
        {
            "success_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        }
        """
        course = self.get_object()
        user = request.user
        
        # Vérifier si l'étudiant est déjà inscrit
        if Enrollment.objects.filter(
            course=course,
            clerk_user_id=user.clerk_user_id,
            is_paid=True
        ).exists():
            return Response(
                {"error": "Vous êtes déjà inscrit à ce cours"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valider les URLs
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        success_url = serializer.validated_data['success_url']
        cancel_url = serializer.validated_data['cancel_url']
        
        try:
            # Créer la session Stripe
            session_data = create_checkout_session(
                course=course,
                user=user,
                success_url=success_url,
                cancel_url=cancel_url
            )
            
            # Créer une inscription en attente
            enrollment, created = Enrollment.objects.get_or_create(
                course=course,
                clerk_user_id=user.clerk_user_id,
                defaults={
                    'student_email': user.email,
                    'student_name': user.full_name,
                    'price_paid': course.price,
                    'is_paid': False,
                    'stripe_session_id': session_data['session_id'],
                }
            )
            
            if not created:
                # Mise à jour si l'inscription existe déjà
                enrollment.stripe_session_id = session_data['session_id']
                enrollment.save()
            
            return Response({
                "session_id": session_data['session_id'],
                "url": session_data['url'],
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de la session: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les inscriptions
    - list: Liste les inscriptions de l'utilisateur connecté
    - retrieve: Détails d'une inscription
    """
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les inscriptions de l'utilisateur connecté"""
        return Enrollment.objects.filter(
            clerk_user_id=self.request.user.clerk_user_id,
            is_paid=True
        ).select_related('course')
    
    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """
        Vérifie le statut d'un paiement après redirection depuis Stripe
        POST /api/enrollments/verify_payment/
        
        Body:
        {
            "session_id": "cs_test_..."
        }
        """
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response(
                {"error": "session_id requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Récupérer la session Stripe
            session = retrieve_session(session_id)
            
            # Vérifier le statut du paiement
            if session.payment_status == 'paid':
                # Trouver l'inscription correspondante
                enrollment = get_object_or_404(
                    Enrollment,
                    stripe_session_id=session_id,
                    clerk_user_id=request.user.clerk_user_id
                )
                
                # Marquer comme payé si ce n'est pas déjà fait
                if not enrollment.is_paid:
                    enrollment.mark_as_paid()
                    enrollment.stripe_payment_intent_id = session.payment_intent
                    enrollment.save()
                
                serializer = StudentEnrollmentSerializer(enrollment)
                return Response({
                    "status": "success",
                    "enrollment": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "pending",
                    "payment_status": session.payment_status
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du paiement: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Webhook Stripe pour recevoir les événements de paiement
    POST /api/webhooks/stripe/
    
    Cet endpoint est appelé automatiquement par Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    if not sig_header:
        logger.warning("Webhook reçu sans signature")
        return HttpResponse(status=400)
    
    try:
        # Vérifier la signature du webhook
        event = verify_webhook_signature(payload, sig_header)
        
    except Exception as e:
        logger.error(f"Erreur de vérification webhook: {str(e)}")
        return HttpResponse(status=400)
    
    # Traiter l'événement
    event_type = event['type']
    
    logger.info(f"Webhook reçu: {event_type}")
    
    if event_type == 'checkout.session.completed':
        # Paiement réussi
        session = event['data']['object']
        handle_checkout_session_completed(session)
    
    elif event_type == 'payment_intent.succeeded':
        # Payment Intent réussi (pour paiements directs)
        payment_intent = event['data']['object']
        handle_payment_intent_succeeded(payment_intent)
    
    elif event_type == 'payment_intent.payment_failed':
        # Paiement échoué
        payment_intent = event['data']['object']
        handle_payment_failed(payment_intent)
    
    # Retourner 200 pour indiquer à Stripe que le webhook a été reçu
    return HttpResponse(status=200)


def handle_checkout_session_completed(session):
    """
    Traite un événement checkout.session.completed
    """
    try:
        session_id = session['id']
        payment_intent_id = session.get('payment_intent')
        clerk_user_id = session.get('client_reference_id')
        
        # Trouver l'inscription correspondante
        enrollment = Enrollment.objects.filter(
            stripe_session_id=session_id
        ).first()
        
        if enrollment:
            # Marquer comme payé
            if not enrollment.is_paid:
                enrollment.mark_as_paid()
                enrollment.stripe_payment_intent_id = payment_intent_id
                enrollment.save()
                logger.info(f"Inscription {enrollment.id} marquée comme payée")
        else:
            logger.warning(f"Inscription introuvable pour session {session_id}")
            
    except Exception as e:
        logger.error(f"Erreur lors du traitement du webhook: {str(e)}")


def handle_payment_intent_succeeded(payment_intent):
    """
    Traite un événement payment_intent.succeeded
    """
    try:
        payment_intent_id = payment_intent['id']
        
        # Trouver l'inscription correspondante
        enrollment = Enrollment.objects.filter(
            stripe_payment_intent_id=payment_intent_id
        ).first()
        
        if enrollment and not enrollment.is_paid:
            enrollment.mark_as_paid()
            logger.info(f"Inscription {enrollment.id} marquée comme payée (Payment Intent)")
            
    except Exception as e:
        logger.error(f"Erreur lors du traitement du Payment Intent: {str(e)}")


def handle_payment_failed(payment_intent):
    """
    Traite un échec de paiement
    """
    try:
        payment_intent_id = payment_intent['id']
        logger.warning(f"Paiement échoué: {payment_intent_id}")
        
        # Ici, vous pouvez envoyer un email à l'étudiant, etc.
        
    except Exception as e:
        logger.error(f"Erreur lors du traitement de l'échec: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    """
    Retourne les cours auxquels l'utilisateur est inscrit
    GET /api/my-courses/
    """
    enrollments = Enrollment.objects.filter(
        clerk_user_id=request.user.clerk_user_id,
        is_paid=True
    ).select_related('course')
    
    serializer = StudentEnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint de santé pour vérifier que l'API fonctionne
    GET /api/health/
    """
    return Response({
        "status": "ok",
        "message": "API is running"
    })
```

**Explications des views:**

1. **CourseViewSet:**
   - `list()`: Liste tous les cours actifs
   - `retrieve()`: Détails d'un cours
   - `create_checkout()`: Action custom pour créer un paiement Stripe

2. **EnrollmentViewSet:**
   - Affiche uniquement les cours de l'utilisateur connecté
   - `verify_payment()`: Vérifie si un paiement est confirmé après redirection

3. **stripe_webhook:**
   - CRITIQUE: Reçoit les événements Stripe
   - Vérifie la signature pour la sécurité
   - Met à jour les inscriptions automatiquement

4. **my_courses:**
   - Endpoint simple pour récupérer les cours de l'utilisateur

---

## 9. URLs et Routing

### 9.1 URLs de l'Application

Créez le fichier `courses/urls.py`:

```python
"""
URLs de l'application courses
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router DRF pour les ViewSets
router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

app_name = 'courses'

urlpatterns = [
    # ViewSets via le router
    path('', include(router.urls)),
    
    # Endpoints custom
    path('my-courses/', views.my_courses, name='my-courses'),
    path('webhooks/stripe/', views.stripe_webhook, name='stripe-webhook'),
    path('health/', views.health_check, name='health-check'),
]
```

### 9.2 URLs Principales du Projet

Modifiez `config/urls.py`:

```python
"""
URLs principales du projet
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # API
    path('api/', include('courses.urls')),
]
```

**Endpoints disponibles:**
```
GET    /api/courses/                      # Liste des cours
GET    /api/courses/{id}/                 # Détails d'un cours
POST   /api/courses/{id}/create_checkout/ # Créer un paiement

GET    /api/enrollments/                  # Mes inscriptions
POST   /api/enrollments/verify_payment/   # Vérifier un paiement

GET    /api/my-courses/                   # Mes cours
POST   /api/webhooks/stripe/              # Webhook Stripe
GET    /api/health/                       # Health check
```

---

## 10. Django Admin

### 10.1 Configuration de l'Admin

Modifiez `courses/admin.py`:

```python
"""
Configuration de l'interface d'administration Django
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Admin pour le modèle Course
    """
    list_display = [
        'title',
        'price',
        'is_active',
        'instructor_name',
        'enrollment_count_display',
        'created_at',
    ]
    
    list_filter = [
        'is_active',
        'created_at',
        'instructor_name',
    ]
    
    search_fields = [
        'title',
        'description',
        'instructor_name',
    ]
    
    prepopulated_fields = {
        'slug': ('title',)  # Auto-génère le slug depuis le titre
    }
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'enrollment_count_display',
        'enrollment_list',
    ]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'slug', 'description', 'is_active')
        }),
        ('Prix et instructeur', {
            'fields': ('price', 'instructor_name', 'duration_hours')
        }),
        ('Média', {
            'fields': ('thumbnail_url',)
        }),
        ('Statistiques', {
            'fields': ('enrollment_count_display', 'enrollment_list'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def enrollment_count_display(self, obj):
        """Affiche le nombre d'inscrits avec un badge"""
        count = obj.enrollment_count
        if count == 0:
            color = 'gray'
        elif count < 10:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            count
        )
    enrollment_count_display.short_description = 'Inscrits'
    
    def enrollment_list(self, obj):
        """Affiche la liste des inscriptions pour ce cours"""
        enrollments = obj.enrollments.select_related('course').order_by('-enrolled_at')
        
        if not enrollments.exists():
            return "Aucune inscription"
        
        html = '<table style="width: 100%; border-collapse: collapse;">'
        html += '''
            <tr style="background-color: #f5f5f5; font-weight: bold;">
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Étudiant</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Email</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Statut</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Prix</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>
            </tr>
        '''
        
        for enrollment in enrollments:
            status_color = 'green' if enrollment.is_paid else 'red'
            status_text = '✓ Payé' if enrollment.is_paid else '✗ Impayé'
            
            html += f'''
                <tr style="border: 1px solid #ddd;">
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <a href="{reverse('admin:courses_enrollment_change', args=[enrollment.id])}">
                            {enrollment.student_name or 'N/A'}
                        </a>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{enrollment.student_email}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                        <span style="color: {status_color}; font-weight: bold;">{status_text}</span>
                    </td>
                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">
                        {enrollment.price_paid} $
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        {enrollment.enrolled_at.strftime('%d/%m/%Y %H:%M')}
                    </td>
                </tr>
            '''
        
        html += '</table>'
        return format_html(html)
    
    enrollment_list.short_description = 'Liste des inscriptions'
    
    def get_queryset(self, request):
        """Optimise les requêtes avec les annotations"""
        queryset = super().get_queryset(request)
        return queryset.annotate(
            paid_enrollment_count=Count(
                'enrollments',
                filter=Q(enrollments__is_paid=True)
            )
        )


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """
    Admin pour le modèle Enrollment
    """
    list_display = [
        'id',
        'course',
        'student_email',
        'payment_status_display',
        'price_paid',
        'enrolled_at',
    ]
    
    list_filter = [
        'is_paid',
        'enrolled_at',
        'paid_at',
        'course',
    ]
    
    search_fields = [
        'student_email',
        'student_name',
        'clerk_user_id',
        'stripe_payment_intent_id',
        'stripe_session_id',
    ]
    
    readonly_fields = [
        'clerk_user_id',
        'enrolled_at',
        'paid_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Informations de l\'inscription', {
            'fields': ('course', 'clerk_user_id')
        }),
        ('Informations de l\'étudiant', {
            'fields': ('student_email', 'student_name')
        }),
        ('Paiement', {
            'fields': (
                'price_paid',
                'is_paid',
                'stripe_payment_intent_id',
                'stripe_customer_id',
                'stripe_session_id',
            )
        }),
        ('Dates', {
            'fields': ('enrolled_at', 'paid_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def payment_status_display(self, obj):
        """Affiche le statut de paiement avec des couleurs"""
        if obj.is_paid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Payé</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Non payé</span>'
            )
    payment_status_display.short_description = 'Statut'
    
    actions = ['mark_as_paid', 'mark_as_unpaid']
    
    def mark_as_paid(self, request, queryset):
        """Action pour marquer les inscriptions comme payées"""
        updated = 0
        for enrollment in queryset:
            if not enrollment.is_paid:
                enrollment.mark_as_paid()
                updated += 1
        
        self.message_user(
            request,
            f"{updated} inscription(s) marquée(s) comme payée(s)."
        )
    mark_as_paid.short_description = "Marquer comme payé"
    
    def mark_as_unpaid(self, request, queryset):
        """Action pour marquer les inscriptions comme non payées"""
        from django.utils import timezone
        updated = queryset.update(is_paid=False, paid_at=None, updated_at=timezone.now())
        self.message_user(
            request,
            f"{updated} inscription(s) marquée(s) comme non payée(s)."
        )
    mark_as_unpaid.short_description = "Marquer comme non payé"


# Personnalisation du titre de l'admin
admin.site.site_header = "Administration Course Platform"
admin.site.site_title = "Course Platform Admin"
admin.site.index_title = "Tableau de bord"
```

**Fonctionnalités de l'admin:**

1. **CourseAdmin:**
   - Liste avec filtres et recherche
   - Badge coloré pour le nombre d'inscrits
   - Tableau détaillé des inscriptions dans la page de détail
   - Auto-génération du slug depuis le titre

2. **EnrollmentAdmin:**
   - Affichage du statut de paiement en couleur
   - Actions bulk: marquer comme payé/non payé
   - Filtres par cours, statut, date

### 10.2 Créer un Superutilisateur

```bash
python manage.py createsuperuser

# Entrez:
# - Username: admin
# - Email: admin@example.com
# - Password: (votre mot de passe sécurisé)
```

---

## 11. Tests et Déploiement

### 11.1 Tester l'API Localement

```bash
# Lancer le serveur de développement
python manage.py runserver

# L'API est disponible sur:
# http://127.0.0.1:8000/api/

# Admin Django:
# http://127.0.0.1:8000/admin/
```

### 11.2 Créer des Données de Test

Créez le fichier `courses/management/commands/create_test_data.py`:

```python
"""
Commande pour créer des données de test
"""
from django.core.management.base import BaseCommand
from courses.models import Course


class Command(BaseCommand):
    help = 'Crée des cours de test'
    
    def handle(self, *args, **options):
        courses_data = [
            {
                'title': 'Python pour Débutants',
                'slug': 'python-debutants',
                'description': 'Apprenez les bases de Python de zéro.',
                'price': 49.99,
                'instructor_name': 'Marie Dupont',
                'duration_hours': 20,
            },
            {
                'title': 'Django Avancé',
                'slug': 'django-avance',
                'description': 'Maîtrisez Django pour créer des applications web professionnelles.',
                'price': 99.99,
                'instructor_name': 'Jean Martin',
                'duration_hours': 40,
            },
            {
                'title': 'React et API REST',
                'slug': 'react-api-rest',
                'description': 'Créez des interfaces modernes avec React.',
                'price': 79.99,
                'instructor_name': 'Sophie Leroux',
                'duration_hours': 30,
            },
        ]
        
        for data in courses_data:
            course, created = Course.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Cours créé: {course.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Cours existant: {course.title}')
                )
```

Créez les dossiers nécessaires:
```bash
mkdir -p courses/management/commands
touch courses/management/__init__.py
touch courses/management/commands/__init__.py
```

Exécutez la commande:
```bash
python manage.py create_test_data
```

### 11.3 Tester avec cURL ou Postman

```bash
# 1. Lister les cours (pas d'auth requise)
curl http://127.0.0.1:8000/api/courses/

# 2. Obtenir un token JWT depuis Clerk (frontend)
# Puis utiliser le token dans les requêtes:

# 3. Créer une session de paiement (avec auth)
curl -X POST http://127.0.0.1:8000/api/courses/1/create_checkout/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'

# 4. Voir mes inscriptions
curl http://127.0.0.1:8000/api/my-courses/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11.4 Configuration pour la Production

Créez un fichier `.env.production`:

```env
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com

DATABASE_URL=postgresql://...

CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_JWKS_URL=https://votre-app.clerk.accounts.dev/.well-known/jwks.json

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

FRONTEND_URL=https://votre-frontend.com
```

**Important pour la production:**

1. **Générer une SECRET_KEY sécurisée:**
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

2. **Configurer les fichiers statiques:**
```bash
python manage.py collectstatic
```

3. **Utiliser un serveur WSGI (Gunicorn):**
```bash
pip install gunicorn
gunicorn config.wsgi:application
```

4. **Configurer le webhook Stripe:**
   - Aller dans le Dashboard Stripe
   - Ajouter un endpoint: `https://votre-api.com/api/webhooks/stripe/`
   - Sélectionner les événements: `checkout.session.completed`, `payment_intent.succeeded`
   - Copier le **Signing Secret**

---

## Résumé des Commandes Principales

```bash
# Installation
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Éditer .env avec vos clés

# Migrations
python manage.py makemigrations
python manage.py migrate

# Admin
python manage.py createsuperuser

# Données de test
python manage.py create_test_data

# Lancer le serveur
python manage.py runserver
```

---

## Structure Finale du Projet

```
course-platform-backend/
├── config/
│   ├── __init__.py
│   ├── settings.py          # Configuration Django
│   ├── urls.py              # URLs principales
│   ├── wsgi.py
│   └── asgi.py
├── courses/
│   ├── migrations/
│   ├── management/
│   │   └── commands/
│   │       └── create_test_data.py
│   ├── __init__.py
│   ├── admin.py             # Configuration Admin
│   ├── apps.py
│   ├── authentication.py    # Auth Clerk JWT
│   ├── models.py            # Modèles Course & Enrollment
│   ├── serializers.py       # Serializers DRF
│   ├── stripe_utils.py      # Utilitaires Stripe
│   ├── urls.py              # URLs de l'app
│   └── views.py             # Views API
├── manage.py
├── requirements.txt
├── .env                     # Variables d'environnement (ne pas commiter)
├── .env.example
└── .gitignore
```

---

## Prochaines Étapes

1. **Tester l'API complète** avec Postman ou Insomnia
2. **Configurer le webhook Stripe** en production
3. **Créer le frontend React** qui consomme cette API
4. **Ajouter des tests unitaires** (pytest-django)
5. **Déployer sur un serveur** (Railway, Render, AWS, etc.)

---

