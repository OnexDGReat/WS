from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# =====================================================
# Custom User Manager
# =====================================================
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, fullname="", role="partner", position="", **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            fullname=fullname,
            role=role,
            position=position,
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
            role="admin",
            **extra_fields
        )


# =====================================================
# Custom User Model
# =====================================================
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("partner", "Partner"),
    )

    email = models.EmailField(unique=True)
    fullname = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="partner")
    position = models.CharField(max_length=255, blank=True)

    username = None  # remove default username field
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


# =====================================================
# Department Model
# =====================================================
class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# =====================================================
# Partner (Institution)
# =====================================================
class Partner(models.Model):
    CATEGORY_CHOICES = (
        ("school", "School"),
        ("government", "Government Agency"),
        ("ngo", "NGO"),
        ("company", "Private Company"),
        ("other", "Other"),
    )

    STATUS_CHOICES = (
        ("active", "Active"),
        ("pending", "Pending"),
        ("expired", "Expired"),
    )

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="school")

    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    address = models.TextField()
    website = models.URLField(blank=True, null=True)

    email = models.EmailField()
    phone = models.CharField(max_length=50)

    contact_person = models.CharField(max_length=255)
    contact_position = models.CharField(max_length=255)

    effectivity_start = models.DateField()
    effectivity_end = models.DateField()

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# =====================================================
# Partner Contacts (Dynamic Supervisors / Managers)
# =====================================================
class PartnerContact(models.Model):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name="contacts")
    fullname = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.fullname} - {self.partner.name}"


# =====================================================
# Activity Logs for each partner
# =====================================================
class PartnershipActivity(models.Model):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name="activities")
    activity_date = models.DateField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.partner.name} ({self.activity_date})"
