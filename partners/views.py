from rest_framework import viewsets
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json
from .serializers import CollegeSerializer, DepartmentSerializer

from .models import Partner, PartnerContact, PartnershipActivity, User, College, Department
from .serializers import (
    PartnerSerializer,
    PartnerContactSerializer,
    PartnershipActivitySerializer,
    UserListSerializer,
    UserSerializer,
    CollegeSerializer,
    DepartmentSerializer,
    UserSerializer
)
from .permissions import IsSuperAdmin

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
            "fullname": request.user.fullname,
            "role": request.user.role,
            "college": request.user.college.name if request.user.college else None,
            "department": request.user.department.name if request.user.department else None,
        })
    return JsonResponse({"error": "Not logged in"}, status=401)



# =====================================================
# SIGNUP
# =====================================================
@csrf_exempt
def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid method"}, status=400)

    try:
        data = json.loads(request.body)

        if User.objects.filter(email=data.get("email")).exists():
            return JsonResponse({"success": False, "error": "User already exists"})

        college_id = data.get("college")
        department_id = data.get("department")

        college = College.objects.get(id=college_id) if college_id else None
        department = Department.objects.get(id=department_id) if department_id else None

        User.objects.create_user(
            email=data.get("email"),
            password=data.get("password"),
            fullname=data.get("fullname", ""),
            role=data.get("role"),
            college_id=data.get("college") or None,
            department_id=data.get("department") or None,
)


        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})



# =====================================================
# LOGIN
# =====================================================
@csrf_exempt
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
                "position": getattr(user, "position", "")
            })
        return JsonResponse({"success": False, "error": "Invalid credentials"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


# =====================================================
# LOGOUT
# =====================================================
@csrf_exempt
def logout_view(request):
    if request.method == "GET":
        logout(request)
        return JsonResponse({"success": True, "message": "Logged out"}, status=200)
    else:
        return JsonResponse({"success": False, "error": "Invalid method"}, status=400)


# =====================================================
# BROWSER-FRIENDLY PARTNERSHIP PAGE
# =====================================================
def all_partners_page(request):
    """
    View to see all partnerships in a simple HTML table in the browser.
    """
    partners = Partner.objects.all().order_by("-created_at")
    return render(request, 'partners/all_partners.html', {'partners': partners})


# =====================================================
# SIMPLE JSON API FOR FRONTEND CHECK
# =====================================================
@api_view(['GET'])
def all_partners_api(request):
    partners = Partner.objects.all().order_by("-created_at")
    serializer = PartnerSerializer(partners, many=True)
    return Response(serializer.data)

# Browser-friendly page for testing CRUD
def all_partners_page(request):
    partners = Partner.objects.all().order_by("-created_at")
    return render(request, "partners/all_partners.html", {"partners": partners})

# =====================================================
# GET ALL COLLEGES WITH PARTNERS
# =====================================================
def all_colleges_api(request):
    """
    Returns all colleges with their associated partners.
    Example output:
    [
        {
            "id": 1,
            "college": "CET - IT",
            "partners": "JairoSoft and Dusit"
        },
        {
            "id": 2,
            "college": "CHATME",
            "partners": "Smart"
        }
    ]
    """
    colleges = Department.objects.all()
    result = []

    for college in colleges:
        partners_qs = Partner.objects.filter(category=college.name)  # category stores college name
        partners_names = [p.company1 for p in partners_qs]
        # Combine partners with 'and' if more than one
        if len(partners_names) > 1:
            partners_str = " and ".join(partners_names)
        elif partners_names:
            partners_str = partners_names[0]
        else:
            partners_str = ""  # no partners yet

        result.append({
            "id": college.id,
            "college": college.name,
            "partners": partners_str,
        })

    return JsonResponse(result, safe=False)

@api_view(['GET'])
def get_colleges(request):
    colleges = College.objects.all()
    serializer = CollegeSerializer(colleges, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_courses(request):
    college_id = request.GET.get('college_id')
    if not college_id:
        return Response([], status=200)
    courses = Department.objects.filter(college_id=college_id)
    serializer = DepartmentSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_all_users(request):
    users = User.objects.all().order_by("fullname")
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

# =====================================================
# USERS CRUD (Superadmin only)
# =====================================================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

# =====================================================
# Colleges list
# =====================================================
@api_view(["GET"])
def college_list(request):
    colleges = College.objects.all()
    serializer = CollegeSerializer(colleges, many=True)
    return Response(serializer.data)


# =====================================================
# Departments list filtered by college
# =====================================================
@api_view(["GET"])
def department_list(request):
    college_id = request.GET.get("college_id")
    if college_id:
        departments = Department.objects.filter(college_id=college_id)
    else:
        departments = Department.objects.none()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)


# =====================================================
# Users list for superadmin only
# =====================================================
@api_view(["GET"])
def user_list(request):
    if not request.user.is_authenticated or request.user.role != "superadmin":
        return Response({"detail": "Not authorized"}, status=403)
    users = User.objects.all().order_by("fullname")
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)
