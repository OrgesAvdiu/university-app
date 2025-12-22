from rest_framework import viewsets, permissions, response, decorators
from django.contrib.auth.models import User
from .models import Faculty, Administrator, Professor, Student, Subject, Grade
from .serializer import (
	FacultySerializer,
	AdministratorSerializer,
	ProfessorSerializer,
	StudentSerializer,
	SubjectSerializer,
	GradeSerializer,
	UserSerializer,
)
from .permissions import IsAdminOrReadOnly, IsAuthenticatedReadOnly


def get_user_role(user: User):
	if hasattr(user, "administrator_profile"):
		return "administrator"
	if hasattr(user, "professor_profile"):
		return "professor"
	if hasattr(user, "student_profile"):
		return "student"
	return "user"


class FacultyViewSet(viewsets.ModelViewSet):
	queryset = Faculty.objects.all()
	serializer_class = FacultySerializer
	permission_classes = [IsAdminOrReadOnly]


class SubjectViewSet(viewsets.ModelViewSet):
	serializer_class = SubjectSerializer
	permission_classes = [IsAdminOrReadOnly]

	def get_queryset(self):
		user = self.request.user
		role = get_user_role(user)
		qs = Subject.objects.select_related("faculty", "professor").prefetch_related("students")
		if role == "administrator":
			return qs
		if role == "professor":
			try:
				prof = user.professor_profile
				return qs.filter(professor=prof)
			except Professor.DoesNotExist:
				return Subject.objects.none()
		if role == "student":
			# Students should see all subjects, with an 'enrolled' flag in the serializer
			return qs
		return Subject.objects.none()

	@decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
	def add_student(self, request, pk=None):
		"""Add a student to this subject (admin only)"""
		if not (request.user.is_superuser or hasattr(request.user, "administrator_profile")):
			return response.Response({"error": "Admin only"}, status=403)
		subject = self.get_object()
		student_id = request.data.get("student_id")
		try:
			student = Student.objects.get(pk=student_id)
			subject.students.add(student)
			return response.Response({"success": True})
		except Student.DoesNotExist:
			return response.Response({"error": "Student not found"}, status=404)

	@decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
	def remove_student(self, request, pk=None):
		"""Remove a student from this subject (admin only)"""
		if not (request.user.is_superuser or hasattr(request.user, "administrator_profile")):
			return response.Response({"error": "Admin only"}, status=403)
		subject = self.get_object()
		student_id = request.data.get("student_id")
		try:
			student = Student.objects.get(pk=student_id)
			subject.students.remove(student)
			return response.Response({"success": True})
		except Student.DoesNotExist:
			return response.Response({"error": "Student not found"}, status=404)

	@decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
	def enroll(self, request, pk=None):
		"""Allow the current student to enroll in this subject"""
		if not hasattr(request.user, "student_profile"):
			return response.Response({"error": "Student only"}, status=403)
		subject = self.get_object()
		student = request.user.student_profile
		subject.students.add(student)
		return response.Response({"success": True, "enrolled": True})

	@decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
	def unenroll(self, request, pk=None):
		"""Allow the current student to unenroll from this subject"""
		if not hasattr(request.user, "student_profile"):
			return response.Response({"error": "Student only"}, status=403)
		subject = self.get_object()
		student = request.user.student_profile
		subject.students.remove(student)
		return response.Response({"success": True, "enrolled": False})


class GradeViewSet(viewsets.ModelViewSet):
	serializer_class = GradeSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		role = get_user_role(user)
		if role == "administrator" or user.is_superuser:
			return Grade.objects.select_related("student", "subject", "professor")
		if role == "professor":
			try:
				prof = user.professor_profile
				return Grade.objects.filter(professor=prof).select_related("student", "subject", "professor")
			except Professor.DoesNotExist:
				return Grade.objects.none()
		if role == "student":
			try:
				stu = user.student_profile
				return Grade.objects.filter(student=stu).select_related("student", "subject", "professor")
			except Student.DoesNotExist:
				return Grade.objects.none()
		return Grade.objects.none()

	def create(self, request, *args, **kwargs):
		"""Only professor/admin can create grades"""
		if not (hasattr(request.user, "professor_profile") or request.user.is_superuser or hasattr(request.user, "administrator_profile")):
			return response.Response({"error": "Professor or admin only"}, status=403)
		return super().create(request, *args, **kwargs)

	def update(self, request, *args, **kwargs):
		"""Only professor/admin can update grades"""
		if not (hasattr(request.user, "professor_profile") or request.user.is_superuser or hasattr(request.user, "administrator_profile")):
			return response.Response({"error": "Professor or admin only"}, status=403)
		return super().update(request, *args, **kwargs)

	@decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
	def by_subject(self, request):
		"""Get grades for a specific subject (professor view)"""
		subject_id = request.query_params.get("subject_id")
		if not subject_id:
			return response.Response({"error": "subject_id required"}, status=400)
		if not hasattr(request.user, "professor_profile"):
			return response.Response({"error": "Professor only"}, status=403)
		prof = request.user.professor_profile
		try:
			subject = Subject.objects.get(pk=subject_id, professor=prof)
			grades = Grade.objects.filter(subject=subject).select_related("student", "subject", "professor")
			serializer = self.get_serializer(grades, many=True)
			return response.Response(serializer.data)
		except Subject.DoesNotExist:
			return response.Response({"error": "Subject not found or not your subject"}, status=404)


class ProfessorViewSet(viewsets.ModelViewSet):
    queryset = Professor.objects.select_related("user", "faculty")
    serializer_class = ProfessorSerializer
    permission_classes = [IsAdminOrReadOnly]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related("user", "faculty")
    serializer_class = StudentSerializer
    permission_classes = [IsAdminOrReadOnly]


class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.select_related("user", "faculty")
    serializer_class = AdministratorSerializer
    permission_classes = [IsAdminOrReadOnly]


class MeViewSet(viewsets.ViewSet):
	permission_classes = [permissions.IsAuthenticated]

	@decorators.action(detail=False, methods=["get"])
	def profile(self, request):
		user = request.user
		role = get_user_role(user)
		data = {"user": UserSerializer(user).data, "role": role}
		try:
			if role == "administrator":
				data["profile"] = AdministratorSerializer(user.administrator_profile).data
			elif role == "professor":
				data["profile"] = ProfessorSerializer(user.professor_profile).data
			elif role == "student":
				data["profile"] = StudentSerializer(user.student_profile).data
		except Exception:
			data["profile"] = None
		return response.Response(data)
