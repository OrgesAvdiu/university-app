from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FacultyViewSet,
    SubjectViewSet,
    ProfessorViewSet,
    StudentViewSet,
    AdministratorViewSet,
    GradeViewSet,
    MeViewSet,
)

router = DefaultRouter()
router.register(r'faculties', FacultyViewSet)
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'professors', ProfessorViewSet)
router.register(r'students', StudentViewSet)
router.register(r'administrators', AdministratorViewSet)
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'me', MeViewSet, basename='me')

urlpatterns = [
    path('', include(router.urls)),
]
