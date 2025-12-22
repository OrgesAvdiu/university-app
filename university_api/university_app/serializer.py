from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Faculty, Administrator, Professor, Student, Subject, Grade


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ["id", "name"]


class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = Administrator
        fields = ["id", "user", "faculty", "title"]


class ProfessorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = Professor
        fields = ["id", "user", "faculty", "office"]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    faculty = FacultySerializer(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "user", "faculty", "enrollment_year"]


class GradeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), write_only=True, source="student"
    )

    class Meta:
        model = Grade
        fields = ["id", "subject", "student", "student_id", "grade", "notes", "created_at", "updated_at"]
        read_only_fields = ["subject", "created_at", "updated_at"]


class SubjectSerializer(serializers.ModelSerializer):
    faculty = FacultySerializer(read_only=True)
    professor = ProfessorSerializer(read_only=True)
    students = StudentSerializer(many=True, read_only=True)
    enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ["id", "code", "title", "faculty", "professor", "students", "enrolled"]

    def get_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        user = request.user
        if hasattr(user, "student_profile"):
            try:
                stu = user.student_profile
                return obj.students.filter(pk=stu.pk).exists()
            except Student.DoesNotExist:
                return False
        return False
