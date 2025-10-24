from rest_framework import serializers
from .models import CustomUser, Job, Application, SavedJob, Notification, Message, Conversation
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
        read_only_fields = ('employer', 'created_at')
    
    def validate_pay(self, value):
        """Validazione per il campo pay"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Il compenso deve essere maggiore di zero.")
        return value

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

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'sender_username', 'receiver_username', 'job', 'content', 'read', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'job', 'job_title', 'last_message', 'created_at', 'updated_at')
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
