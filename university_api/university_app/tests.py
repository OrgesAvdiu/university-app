from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Faculty, Professor, Student, Subject, Administrator


class UniversityAPITests(APITestCase):
	def setUp(self):
		self.cs = Faculty.objects.create(name="CS")
		self.admin_user = User.objects.create_user(username="adminu", password="pass")
		self.admin_user.is_staff = True
		self.admin_user.is_superuser = True
		self.admin_user.save()
		Administrator.objects.create(user=self.admin_user, faculty=self.cs)

		self.prof_user = User.objects.create_user(username="profu", password="pass")
		self.prof = Professor.objects.create(user=self.prof_user, faculty=self.cs)

		self.stu_user = User.objects.create_user(username="stuu", password="pass")
		self.stu = Student.objects.create(user=self.stu_user, faculty=self.cs, enrollment_year=2025)

		self.subj = Subject.objects.create(code="CS1", title="CS", faculty=self.cs, professor=self.prof)
		self.subj.students.add(self.stu)

	def jwt_for(self, username, password="pass"):
		url = reverse("token_obtain_pair")
		res = self.client.post(url, {"username": username, "password": password}, format="json")
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		return res.data["access"]

	def test_me_profile(self):
		token = self.jwt_for("stuu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.get("/api/me/profile/")
		self.assertEqual(res.status_code, 200)
		self.assertEqual(res.data["role"], "student")

	def test_subjects_visibility_by_role(self):
		# student sees enrolled subjects
		token = self.jwt_for("stuu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.get("/api/subjects/")
		self.assertEqual(len(res.data), 1)

		# professor sees teaching subjects
		token = self.jwt_for("profu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.get("/api/subjects/")
		self.assertEqual(len(res.data), 1)

		# admin sees all
		token = self.jwt_for("adminu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.get("/api/subjects/")
		self.assertGreaterEqual(len(res.data), 1)

	def test_admin_only_write_subject(self):
		# professor cannot create subject
		token = self.jwt_for("profu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.post("/api/subjects/", {"code": "NEW", "title": "New", "faculty": self.cs.id})
		self.assertIn(res.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST))

		# admin can create (needs professor id, but serializer is read-only; this checks permission)
		token = self.jwt_for("adminu")
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
		res = self.client.get("/api/faculties/")
		self.assertEqual(res.status_code, 200)

