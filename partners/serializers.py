from rest_framework import serializers
from .models import Partner, PartnerContact, PartnershipActivity

class PartnerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerContact
        fields = "__all__"


class PartnershipActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnershipActivity
        fields = "__all__"


class PartnerSerializer(serializers.ModelSerializer):
    contacts = PartnerContactSerializer(many=True, read_only=True)
    activities = PartnershipActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = "__all__"
