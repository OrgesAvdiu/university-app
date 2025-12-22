from django.db import models
from django.contrib.auth.models import User


class TimestampedModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		abstract = True


class Faculty(TimestampedModel):
	name = models.CharField(max_length=100, unique=True)

	def __str__(self):
		return self.name


class BaseProfile(TimestampedModel):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="%(class)s_profile")
	faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True)

	class Meta:
		abstract = True


class Administrator(BaseProfile):
	title = models.CharField(max_length=100, blank=True)

	def __str__(self):
		return f"Admin: {self.user.username}"


class Professor(BaseProfile):
	office = models.CharField(max_length=100, blank=True)

	def __str__(self):
		return f"Professor: {self.user.get_full_name() or self.user.username}"


class Student(BaseProfile):
	enrollment_year = models.PositiveIntegerField(null=True, blank=True)

	def __str__(self):
		return f"Student: {self.user.get_full_name() or self.user.username}"


class Subject(TimestampedModel):
	code = models.CharField(max_length=20, unique=True)
	title = models.CharField(max_length=200)
	faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name="subjects")
	professor = models.ForeignKey(Professor, on_delete=models.SET_NULL, null=True, blank=True, related_name="subjects")
	students = models.ManyToManyField(Student, blank=True, related_name="subjects")

	def __str__(self):
		return f"{self.code} - {self.title}"


class Grade(TimestampedModel):
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="grades")
	student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
	professor = models.ForeignKey(Professor, on_delete=models.SET_NULL, null=True, blank=True)
	grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # 0.00 to 999.99
	notes = models.TextField(blank=True)

	class Meta:
		unique_together = ("subject", "student")

	def __str__(self):
		return f"{self.student.user.username} - {self.subject.code}: {self.grade or 'N/A'}"
