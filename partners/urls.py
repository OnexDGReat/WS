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
    UserViewSet,
    college_list,
    department_list,
    get_all_users,
    all_users,
)
from . import views

# -----------------------------
# Register ViewSets with router
# -----------------------------
router = DefaultRouter()
router.register(r'partners', PartnerViewSet)
router.register(r'partner-contacts', PartnerContactViewSet)
router.register(r'partner-activities', PartnershipActivityViewSet)
router.register(r'users', UserViewSet, basename='user')  # CRUD API

# -----------------------------
# URL Patterns
# -----------------------------
urlpatterns = [
    path("", include(router.urls)),

    # AUTH API ENDPOINTS
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("current_user/", current_user, name="current_user"),

    # Colleges & Departments
    path('colleges/', college_list, name='college-list'),
    path('departments/', department_list, name='department-list'),

    # Legacy endpoints (optional)
    path('all_users/', all_users, name='all_users'),
    path("get_all_users/", get_all_users, name="get_all_users"),

    # PENDING USER REQUESTS
    path("pending-users/", views.get_pending_requests, name="pending_users"),
    path("pending-users/<int:user_id>/approve/", views.approve_request, name="approve_request"),
    path("pending-users/<int:user_id>/decline/", views.decline_request, name="decline_request"),

    # DECLINED USERS MANAGEMENT
    path('declined/', views.declined_users_list, name='declined_users'),
    path('declined/<int:pk>/', views.delete_user, name='delete_declined_user'),

    

    # # PARTNERS API
    # path("users/", views.get_all_users, name="get_all_users"),
    # path('all_partners_api/', views.all_partners_api, name='all_partners_api'),

    # # BROWSER-FRIENDLY PARTNERS PAGE
    # path('all_partners/', views.all_partners_page, name='all_partners_page'),

    # # ROUTER-REGISTERED VIEWSETS
    # path("", include(router.urls)),

    # path("api/colleges/", views.all_colleges_api, name="colleges_api"),
    # path("all_colleges_api/", views.all_colleges_api, name="all_colleges_api"),

    # path('colleges/', views.get_colleges),
    # path('courses/', views.get_courses),
]
