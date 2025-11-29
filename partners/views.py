from rest_framework import viewsets
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import json
from rest_framework.permissions import IsAuthenticated

from .models import Partner, PartnerContact, PartnershipActivity, User
from .serializers import (
    PartnerSerializer,
    PartnerContactSerializer,
    PartnershipActivitySerializer
)

# =====================================================
# PARTNER CRUD API (Fully CSRF-compatible)
# =====================================================
class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all().order_by("-created_at")
    serializer_class = PartnerSerializer


class PartnerContactViewSet(viewsets.ModelViewSet):
    queryset = PartnerContact.objects.all()
    serializer_class = PartnerContactSerializer


class PartnershipActivityViewSet(viewsets.ModelViewSet):
    queryset = PartnershipActivity.objects.all()
    serializer_class = PartnershipActivitySerializer


# =====================================================
# CSRF COOKIE ENDPOINT
# React must call this ONCE to receive a CSRF token.
# =====================================================
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# =====================================================
# HOME TEST PAGE
# =====================================================
def home(request):
    return HttpResponse("Welcome to the OSA Partnership Monitoring System!")


# =====================================================
# Current User
# =====================================================
def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "id": request.user.id,
            "email": request.user.email,
            "fullname": getattr(request.user, "fullname", ""),
            "role": request.user.role,
            "position": getattr(request.user, "position", "")
        })
    return JsonResponse({"error": "Not logged in"}, status=401)


# =====================================================
# SIGNUP
# =====================================================
@csrf_exempt     # we intentionally exempt this (login/signup)
def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid method"}, status=400)

    try:
        data = json.loads(request.body)

        if User.objects.filter(email=data.get("email")).exists():
            return JsonResponse({"success": False, "error": "User already exists"})

        User.objects.create_user(
            email=data.get("email"),
            password=data.get("password"),
            fullname=data.get("fullname", ""),
            position=data.get("position", "")
        )

        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


# =====================================================
# LOGIN
# =====================================================
@csrf_exempt     # login doesn't require CSRF
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid method"}, status=400)

    try:
        data = json.loads(request.body)

        user = authenticate(
            request,
            username=data.get("email"),
            password=data.get("password")
        )

        if user:
            login(request, user)
            return JsonResponse({
                "success": True,
                "id": user.id,
                "email": user.email,
                "fullname": user.fullname,
                "role": user.role,
                "position": getattr(user, "position", "")
            })

        return JsonResponse({"success": False, "error": "Invalid credentials"})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


# =====================================================
# LOGOUT
# =====================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()  # if using token auth
    return Response({"detail": "Successfully logged out"})
