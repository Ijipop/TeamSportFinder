# Guide

## In `\backend\`

`python -m venv env`

Active `env`
`env\Scripts\activate`

Upgrade pip
`python.exe -m pip install --upgrade pip`

Add `installation.txt`

```txt
# Django Core
Django==5.0.1
djangorestframework==3.14.0
django-cors-headers==4.3.1
python-dotenv==1.0.0
 
# Database
psycopg2-binary==2.9.9
dj-database-url==2.1.0
 
# Authentication
PyJWT==2.8.0
cryptography==41.0.7
python-jose[cryptography]==3.3.0
 
# Stripe
stripe==7.8.0
 
# Clerk Integration
requests==2.31.0
python-dotenv==1.0.0
 
# Utilities
python-decouple==3.8
Pillow==10.2.0
django-filter==23.5
 
# Development
django-extensions==3.2.3
ipython==8.19.0
 
# Testing
pytest==7.4.4
pytest-django==4.7.0
factory-boy==3.3.0
faker==22.0.0
 
# Documentation
drf-spectacular==0.27.0
```

`pip install -r installation.txt`

Change `==` tp `>=` if speficic build failed

### From Neon Tech

Create `.env` in `\backend\` folder
Add the copy/paste from Neon Tech.

### Create django project

`django-admin startproject doc .`
<!-- `django-admin startproject [name] .` -->

## Add application

`python manage.py startapp courses`

## in `doc/settings.py`
Add
```
from dotenv import load_dotenv


load_dotenv()
```

MOVE this in `.env`

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '[secret]'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

DEBUG = True

# ALLOWED_HOSTS = []
ALLOWED_HOSTS = localhost, 127.0.0.1

FRONTEND_URL = http://localhost:3000
```

And change it to this (import `os`)

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

Add in

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    '[modelname].apps.[Modelname]Config',
]
```

Add `'corsheaders.middleware.CorsMiddleware',` in `MIDDLEWARE` (Before `SessionMiddleware`, for priority sakes).

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Replace `DATABASES` with copy/paste from Neon Tech.

Add at the bottom
```python
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
]

CORS_ALLOWED_METHODES = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## models.py of courses

```python
from django.db import models

# Create your models here.
class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="Titre du cours ...")
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    is_active = models.BooleanField(default=True)
    instructor_name = models.CharField(max_length=20, verbose_name="Instructeur")
    image_url = models.URLField(blank=True, null=True)
    duration_hours = models.PositiveBigIntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True, max_length=200, help_text="python-pour-debutants") #localhost:3000/courses/python-pour-debutants
    # Slug = pour ID Unique pour URL d'un objet

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Cours"
        verbose_name_plural = "Cours"


    def __str__(self):
        return self.title
```

## migration to neon

create migrations
`python manage.py makemigrations`
send them to neon
`python manage.py migrate`

## in `/courses/serializers.py`
```python
from .models import Course
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

        read_only_fields = ['id', 'created_at', 'updated_at'] # put any attributs that can't be modified!
```

## in `doc/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('course/', include('courses.urls')),
]
```

## in `courses/urls.py` (created it)

```python
from django.urls import path
from . import views


# course/

urlpatterns = [
    # path('/', views.ListeDesCours.as_view),
    path('create/', views.createCourse, name='create_course')
]
```

## in `courses/views.py`

1 - Creation des models dnas les application
2 - Serializer pour transfromer les models (python) en JSON
3 - Definir les URLS pour acceder aux views (dans application et dans le projet definir le path de l'application)
4 - Creer les views pour retourner les donnees (API views)

`python manage.py runserver`