# Guide

## Set up folders

`mkdir frontend`
`mkdir backend`
`mkdir docs`

## Go in Backend

`cd backend`
`python -m venv env`
`env\Scripts\activate`

`pip install --upgrade pip`
`python -m pip install --upgrade pip`

Create `installation.txt`

```txt
# ======== Installation de Base ========

Django==5.0.1

djangorestframework==3.14.0

django-cors-headers==4.3.1

# ======== Base de Donne ========

psycopg2-binary>=2.9.9
# Responsable de la communication entre Django et PostgreSQL

dj-database-url==2.1.0
# Librairie responsable des url de Neon


# ======== Authentification ========

pyJWT==2.8.0
# Responsable des Encode/Decode des JSON pyJWT

# ======== Payment ========

stripe==7.8.0

# ======== Integration ========

requests==2.31.0

python-dotenv==1.0.0
# En cas ou on cree des fichiers .env/.env.local

Pillow>=10.2.0
# Responsable des images
```

`pip install -r installation.txt`

### django admin - MODELS

`django-admin startproject gestionetudiant .`
<!-- `django-admin startproject [name project] .` -->

`python manage.py startapp courses`
`python manage.py startapp payment`
`python manage.py startapp accounts`
<!-- `python manage.py startapp [name model]` -->

Edit the `models.py` to create the classes.

Edit `settings.py`, adding the Neon Tech database.

```python

# Add these at the top of your settings.py
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

load_dotenv()
```
