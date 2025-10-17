from rest_framework import serializers
from .models import CustomUser, Job, Application, SavedJob, Notification
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'is_employer', 'skills', 'experience', 'rating')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)  

    class Meta:
        model = Application
        fields = '__all__'

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)  

    class Meta:
        model = SavedJob
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
