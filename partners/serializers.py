from rest_framework import serializers
from .models import (
    Partner,
    PartnerContact,
    PartnershipActivity,
    College,
    Department,
    User
)


# =====================================================
# Partner Contacts
# =====================================================
class PartnerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerContact
        fields = "__all__"


# =====================================================
# Partnership Activities
# =====================================================
class PartnershipActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnershipActivity
        fields = "__all__"


# =====================================================
# Partner / Institution Serializer
# =====================================================
class PartnerSerializer(serializers.ModelSerializer):
    contacts = PartnerContactSerializer(many=True, read_only=True)
    activities = PartnershipActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = [
            'id', 'company1', 'college1', 'company2', 'college2',
            'contact1_name', 'contact1_email', 'contact1_phone',
            'contact2_name', 'contact2_email', 'contact2_phone',
            'effectivity_start', 'effectivity_end', 'status',
            'created_at', 'updated_at',
            'contacts', 'activities'
        ]


# =====================================================
# College + Department
# =====================================================
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name']


class DepartmentSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'college']


# =====================================================
# Full User Serializer (for CRUD)
# =====================================================
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'fullname',
            'email',
            'role',
            'college',
            'department',
            'password',
            'is_active',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


# =====================================================
# Slim User List Serializer (no password)
# =====================================================
class UserListSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "fullname",
            "email",
            "role",
            "college",
            "department",
        ]

