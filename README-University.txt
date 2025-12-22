University Application (Backend + Frontend)

Backend: Django REST API (university_api)
- Models: Administrator, Professor, Student (DRY via BaseProfile), Faculty, Subject
- Links: Subject connects Professor and Student; Faculty connects both as department
- Auth: JWT (SimpleJWT) + Session for admin site
- CORS: Restricted to http://localhost:5173 during development

Frontend: React (Vite) (university-frontend)
- Pages: Login, Administrator Dashboard, Student Dashboard, Professor Dashboard
- Role routing: Fetch /api/me/profile/ to determine role and route accordingly

Quick Start (Windows / PowerShell)
1) Backend
   - Ensure venv is configured (already detected at .venv)
   - Install deps if needed:
     C:/Users/OrgesAvdiu/Desktop/Training/.venv/Scripts/python.exe -m pip install -r university_api/requirements.txt
   - Run migrations:
     C:/Users/OrgesAvdiu/Desktop/Training/.venv/Scripts/python.exe university_api/manage.py migrate
   - Create superuser:
     C:/Users/OrgesAvdiu/Desktop/Training/.venv/Scripts/python.exe university_api/manage.py createsuperuser
   - Start server:
     C:/Users/OrgesAvdiu/Desktop/Training/.venv/Scripts/python.exe university_api/manage.py runserver

2) Frontend
   - Install Node.js (https://nodejs.org/) to use Vite
   - In C:\Users\OrgesAvdiu\Desktop\Training\university-frontend run:
     npm install
     npm run dev
   - Open http://localhost:5173

Default API endpoints
- Obtain token: POST http://localhost:8000/api/auth/token/ { username, password }
- Refresh token: POST http://localhost:8000/api/auth/token/refresh/ { refresh }
- Current user profile: GET http://localhost:8000/api/me/profile/
- Faculties: CRUD at http://localhost:8000/api/faculties/
- Subjects: CRUD at http://localhost:8000/api/subjects/ (role-filtered)

Role Setup
- Create users via admin at http://localhost:8000/admin/
- Create related profiles (Administrator/Professor/Student) linked to each User
- Assign Faculty to profiles and create Subjects for Professors; add Students to Subjects

CORS Configuration
- Currently allows http://localhost:5173; update ALLOWED_HOSTS and CORS in university_api/university_api/settings.py for production.

PythonAnywhere (Free Tier) Deployment (Backend)
- Sign up: https://www.pythonanywhere.com/
- Create a new Python web app (Django)
- Upload backend folder university_api via Bash or Git; install dependencies:
  pip install --user -r requirements.txt
- Configure WSGI:
  - Point to your project settings: university_api/university_api/settings.py
  - Set virtualenv if using one (optional)
- Set allowed hosts:
  ALLOWED_HOSTS = ['<your-username>.pythonanywhere.com']
- CORS: add your PythonAnywhere domain to CORS_ALLOWED_ORIGINS
- Run migrations on PythonAnywhere Bash:
  python manage.py migrate
- Create superuser:
  python manage.py createsuperuser
- Reload web app from the PythonAnywhere dashboard

Frontend Hosting Option (Static)
- Build frontend locally:
  npm run build
- Serve the dist/ with a static host (e.g., GitHub Pages or PythonAnywhere static files)
- Update CORS_ALLOWED_ORIGINS to your frontend domain

Notes
- Faculty seeded with 'Computer Science' and 'English' automatically after migrations.
- Subject and Faculty act as connectors between students and professors per requirements.
- Extend role-based permissions as needed for admin-only mutations.
