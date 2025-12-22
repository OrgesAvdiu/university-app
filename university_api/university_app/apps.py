from django.apps import AppConfig


class UniversityAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'university_app'

    def ready(self):
        # Seed initial Faculty entries using post_migrate signal
        from django.db.models.signals import post_migrate
        from django.dispatch import receiver

        @receiver(post_migrate)
        def create_default_faculties(sender, **kwargs):
            try:
                from .models import Faculty
                for name in ["Computer Science", "English"]:
                    Faculty.objects.get_or_create(name=name)
            except Exception:
                pass
