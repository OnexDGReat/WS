from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# =====================================================
# College Model
# =====================================================
class College(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


# =====================================================
# Department Model
# =====================================================
class Department(models.Model):
    name = models.CharField(max_length=255)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name="departments")

    def __str__(self):
        return f"{self.name} ({self.college.name})"


# =====================================================
# Custom User Manager
# =====================================================
class UserManager(BaseUserManager):

    def create_user(
        self,
        email,
        password=None,
        fullname="",
        role="user",
        college=None,
        department=None,
        **extra_fields
    ):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)

        # Default fallback values
        if college is None:
            college, _ = College.objects.get_or_create(name="Not mentioned")

        if department is None:
            department, _ = Department.objects.get_or_create(
                name="Not mentioned",
                college=college
            )

        user = self.model(
            email=email,
            fullname=fullname,
            role=role,
            college=college,
            department=department,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            email=email,
            password=password,
            role="superadmin",
            **extra_fields
        )


# =====================================================
# Custom User Model
# =====================================================
class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("superadmin", "Superadmin"),
        ("college_admin", "College Admin"),
        ("department_admin", "Department Admin"),
        ("user", "Student / User"),
        ("guest", "Guest"),
    )

    email = models.EmailField(unique=True)
    fullname = models.CharField(max_length=255, blank=True)

    # Role-based access
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    # Academic attribution
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)

    username = None  # we are using email as username
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.fullname} ({self.email})"


# =====================================================
# Partner (Institution)
# =====================================================
class Partner(models.Model):
    company1 = models.CharField(max_length=255)
    college1 = models.CharField(max_length=255, blank=True, null=True)

    company2 = models.CharField(max_length=255, blank=True, null=True)
    college2 = models.CharField(max_length=255, blank=True, null=True)

    contact1_name = models.CharField(max_length=255)
    contact1_email = models.EmailField()
    contact1_phone = models.CharField(max_length=50, default="0000000000")

    contact2_name = models.CharField(max_length=255, blank=True, null=True)
    contact2_email = models.EmailField(blank=True, null=True)
    contact2_phone = models.CharField(max_length=50, blank=True, null=True)

    effectivity_start = models.DateField()
    effectivity_end = models.DateField()

    status = models.CharField(max_length=50, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# =====================================================
# Partner Contacts
# =====================================================
class PartnerContact(models.Model):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name="contacts")
    fullname = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.fullname} - {self.partner.company1}"


# =====================================================
# Activity Logs
# =====================================================
class PartnershipActivity(models.Model):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name="activities")
    activity_date = models.DateField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.partner.company1} ({self.activity_date})"

