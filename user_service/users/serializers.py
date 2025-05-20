from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'phone_number')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username', ''),
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', '')
        )
        return user