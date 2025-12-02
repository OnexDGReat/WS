from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PartnerViewSet,
    PartnerContactViewSet,
    PartnershipActivityViewSet,
    signup_view,
    login_view,
    logout_view,
    current_user,
)
from . import views

# -----------------------------
# Register ViewSets with router
# -----------------------------
router = DefaultRouter()
router.register(r'partners', PartnerViewSet)
router.register(r'partner-contacts', PartnerContactViewSet)
router.register(r'partner-activities', PartnershipActivityViewSet)
router.register(r'users', views.UserViewSet)

# -----------------------------
# URL Patterns
# -----------------------------
urlpatterns = [
    # AUTH API ENDPOINTS
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("users/", views.get_all_users, name="get_all_users"),
    path("current_user/", current_user, name="current_user"),

    # PARTNERS API
    path('all_partners_api/', views.all_partners_api, name='all_partners_api'),

    # BROWSER-FRIENDLY PARTNERS PAGE
    path('all_partners/', views.all_partners_page, name='all_partners_page'),

    # ROUTER-REGISTERED VIEWSETS
    path("", include(router.urls)),

    path("api/colleges/", views.all_colleges_api, name="colleges_api"),
    path("all_colleges_api/", views.all_colleges_api, name="all_colleges_api"),

    path('colleges/', views.get_colleges),
    path('courses/', views.get_courses),
]
