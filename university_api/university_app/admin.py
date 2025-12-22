from django.contrib import admin
from .models import Faculty, Administrator, Professor, Student, Subject, Grade

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
	list_display = ("name", "created_at", "updated_at")


@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
	list_display = ("user", "faculty", "title")


@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
	list_display = ("user", "faculty", "office")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
	list_display = ("user", "faculty", "enrollment_year")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
	list_display = ("code", "title", "faculty", "professor")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
	list_display = ("student", "subject", "professor", "grade", "updated_at")
	list_filter = ("subject", "professor")
	search_fields = ("student__user__username", "subject__code")
