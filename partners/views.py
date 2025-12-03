from rest_framework import viewsets
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework.response import Response
import json

from .models import (
    Partner,
    PartnerContact,
    PartnershipActivity,
    User,
    College,
    Department,

)

from .serializers import (
    PartnerSerializer,
    PartnerContactSerializer,
    PartnershipActivitySerializer,
    UserListSerializer,
    UserSerializer,
    CollegeSerializer,
    DepartmentSerializer,
)

from .permissions import IsSuperAdmin


# =====================================================
# PARTNER CRUD
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
# CSRF TOKEN
# =====================================================
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# =====================================================
# HOME
# =====================================================
def home(request):
    return HttpResponse("Welcome to the OSA Partnership Monitoring System!")


# =====================================================
# CURRENT USER
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
            "status": request.user.status,
        })
    return JsonResponse({"error": "Not logged in"}, status=401)


# =====================================================
# ALL USERS
# =====================================================
def all_users(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not logged in"}, status=401)

    # Optional: restrict only to superadmin
    if request.user.role != "superadmin":
        return JsonResponse({"error": "Unauthorized"}, status=403)

    users = User.objects.all()
    user_list = []
    

    for user in users:
        user_list.append({
            "id": user.id,
            "email": user.email,
            "fullname": user.fullname,
            "role": user.role,
            "college": user.college.name if hasattr(user, "college") and user.college else None,
            "department": user.department.name if hasattr(user, "department") and user.department else None,
            "status": getattr(user, "status", None),
        })

    return JsonResponse(user_list, safe=False)

# =====================================================
# Fetch All Users API for Users List
# =====================================================

@api_view(["GET"])
def get_all_users(request):
    users = User.objects.filter(status="approved").order_by("fullname")
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)


# =====================================================
# SIGNUP SYSTEM WITH APPROVAL FLOW
# =====================================================
@csrf_exempt
def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid method"}, status=400)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        role = data.get("role")

        college_id = data.get("college")
        department_id = data.get("department")

        college = College.objects.get(id=college_id) if college_id else None
        department = Department.objects.get(id=department_id) if department_id else None

        # Check if user already exists
        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            if existing_user.status == "declined":
                # Reuse the declined account
                existing_user.fullname = data.get("fullname", existing_user.fullname)
                existing_user.set_password(data.get("password"))
                existing_user.role = role
                existing_user.college = college
                existing_user.department = department
                existing_user.status = "pending" if role not in ["student", "guest"] else "approved"
                existing_user.is_active = True if role in ["student", "guest"] else False
                existing_user.save()
                return JsonResponse({
                    "success": True,
                    "message": "Account recreated successfully",
                    "auto_approved": role in ["student", "guest"]
                })
            elif existing_user.status == "pending":
                return JsonResponse({
            "success": False,
            "error": "This email already has a pending registration. Please wait for approval."
        })
            if existing_user.status == "approved":
             return JsonResponse({
            "success": False,
            "error": "An approved account already exists for this email."
        })
            

        # Determine approval for student and guest roles
        auto_approve = role in ["student", "guest"]
        status = "approved" if auto_approve else "pending"
        is_active = True if auto_approve else False

        # Create new user
        user = User.objects.create_user(
            email=email,
            password=data.get("password"),
            fullname=data.get("fullname", ""),
            role=role,
            college=college,
            department=department,
            status=status,
            is_active=is_active
        )

        return JsonResponse({
            "success": True,
            "message": "Account created",
            "auto_approved": auto_approve
        })

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
        email = data.get("email")
        password = data.get("password")



        # Check if user exists
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"success": False, "error": "Account not found"})

        # Authenticate
        user = authenticate(request, username=email, password=password)
        if not user:
            return JsonResponse({"success": False, "error": "Invalid credentials or Still pending"})

        # Prepare user info
        user_data = {
            "id": user.id,
            "email": user.email,
            "fullname": user.fullname,
            "role": user.role,
            "college": user.college.name if user.college else None,
            "department": user.department.name if user.department else None,
            "status": user.status,
        }

        # Handle status
        if user.status == "pending":
            return JsonResponse({
                "success": False,
                "error": "Your account is still pending approval. Please wait!",
                "user": user_data
            })
        elif user.status == "declined":
            return JsonResponse({
                "success": False,
                "error": "Your account request was declined.",
                "user": user_data
            })

        # Only login approved users
        if user.status == "approved":
            login(request, user)
            return JsonResponse({"success": True, "user": user_data})

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
# REQUESTS PAGE — admin account approvals
# =====================================================
@api_view(["GET"])
def get_pending_requests(request):
    if not request.user.is_authenticated or request.user.role != "superadmin":
        return Response({"detail": "Not authorized"}, status=403)

    pending = User.objects.filter(status="pending").order_by("fullname")
    serializer = UserListSerializer(pending, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def approve_request(request, user_id):
    if not request.user.is_authenticated or request.user.role != "superadmin":
        return Response({"detail": "Not authorized"}, status=403)

    try:
        user = User.objects.get(id=user_id)
        user.status = "approved"
        user.is_active = True
        user.save()
        return Response({"success": True, "message": "User approved"})
    except User.DoesNotExist:
        return Response({"success": False, "error": "User not found"}, status=404)


@api_view(["POST"])
def decline_request(request, user_id):
    if not request.user.is_authenticated or request.user.role != "superadmin":
        return Response({"detail": "Not authorized"}, status=403)

    try:
        user = User.objects.get(id=user_id)
        # Mark as declined and deactivate account
        user.status = "declined"
        user.is_active = False

        # Modify email so original email is free for new registration
        user.email = f"{user.email}"

        user.save()
        return Response({"success": True, "message": "User declined, email released for future registration"})
    except User.DoesNotExist:
        return Response({"success": False, "error": "User not found"}, status=404)



# =====================================================
# USERS CRUD (Superadmin Only)
# =====================================================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(status="approved").order_by('fullname')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


# =====================================================
# COLLEGES & DEPARTMENTS
# =====================================================
@api_view(["GET"])
def college_list(request):
    colleges = College.objects.all()
    serializer = CollegeSerializer(colleges, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def department_list(request):
    college_id = request.GET.get("college_id")
    if college_id:
        departments = Department.objects.filter(college_id=college_id)
    else:
        departments = Department.objects.none()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

# Only superadmins can access
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_users(request):
    if request.user.role != "superadmin":
        return Response({"detail": "Not authorized"}, status=403)

    pending = User.objects.filter(is_pending=True).order_by("fullname")
    serializer = UserListSerializer(pending, many=True)
    return Response(serializer.data)

# =====================================================
# DECLINED USERS LIST & DELETE
# =====================================================
@api_view(['GET'])
def declined_users_list(request):
    declined_users = User.objects.filter(status="declined")
    data = [{
        "id": u.id,
        "fullname": u.fullname,
        "email": u.email,
        "role": u.role,
        "college": u.college.name if u.college else None,
        "department": u.department.name if u.department else None,
    } for u in declined_users]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk, status="declined")
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found or not declined."}, status=status.HTTP_404_NOT_FOUND)