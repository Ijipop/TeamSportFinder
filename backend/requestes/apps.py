from django.apps import AppConfig

class RequestesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'requestes'

    def ready(self):
        import requestes.signals
