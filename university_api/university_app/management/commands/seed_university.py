from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from university_app.models import Faculty, Administrator, Professor, Student, Subject


class Command(BaseCommand):
    help = "Seed initial admin, professor, student, faculties and a sample subject (DEV ONLY)"

    def handle(self, *args, **options):
        cs, _ = Faculty.objects.get_or_create(name="Computer Science")
        en, _ = Faculty.objects.get_or_create(name="English")

        # Admin user
        admin_user, created = User.objects.get_or_create(username="admin")
        if created:
            admin_user.set_password("admin12345")
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.first_name = "Site"
            admin_user.last_name = "Admin"
            admin_user.save()
            Administrator.objects.get_or_create(user=admin_user, faculty=cs, defaults={"title": "Administrator"})
            self.stdout.write(self.style.SUCCESS("Created superuser admin/admin12345"))
        else:
            self.stdout.write("Superuser 'admin' already exists")

        # Professor user
        prof_user, created = User.objects.get_or_create(username="prof")
        if created:
            prof_user.set_password("prof12345")
            prof_user.first_name = "Ada"
            prof_user.last_name = "Lovelace"
            prof_user.save()
        professor, _ = Professor.objects.get_or_create(user=prof_user, faculty=cs, defaults={"office": "CS-101"})

        # Student user
        stu_user, created = User.objects.get_or_create(username="student")
        if created:
            stu_user.set_password("student12345")
            stu_user.first_name = "Alan"
            stu_user.last_name = "Turing"
            stu_user.save()
        student, _ = Student.objects.get_or_create(user=stu_user, faculty=cs, defaults={"enrollment_year": 2025})

        # Subject
        subj, _ = Subject.objects.get_or_create(
            code="CS101",
            defaults={"title": "Intro to Computer Science", "faculty": cs, "professor": professor},
        )
        subj.students.add(student)
        self.stdout.write(self.style.SUCCESS("Seeded professor, student, and CS101 subject"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
