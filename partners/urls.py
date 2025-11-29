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

router = DefaultRouter()
router.register(r'partners', PartnerViewSet)
router.register(r'partner-contacts', PartnerContactViewSet)
router.register(r'partner-activities', PartnershipActivityViewSet)

urlpatterns = [
    # AUTH API ENDPOINTS
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("current_user/", current_user, name="current_user"),

    # PARTNERS API ROUTES
    path("", include(router.urls)),
]
