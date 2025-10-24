from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Job, Application, SavedJob, Notification, Message, Conversation

# Admin CustomUser
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_employer', 'is_staff', 'is_active', 'rating')
    list_filter = ('is_employer', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password', 'is_employer')}),
        ('Personal Info', {'fields': ('skills', 'experience', 'rating')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_employer', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'skills', 'experience')
    ordering = ('email',)

class JobAdminForm(forms.ModelForm):
    class Meta:
        model = Job
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # mostra solo utenti employer nella dropdown employer
        self.fields['employer'].queryset = CustomUser.objects.filter(is_employer=True)

# Admin Jobs
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    form = JobAdminForm
    list_display = ('title', 'category', 'location', 'pay', 'employer', 'created_at')
    list_filter = ('category', 'location')
    search_fields = ('title', 'description', 'skills_required', 'employer__username')

class ApplicationAdminForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # mostra solo utenti employer nella dropdown user
        self.fields['user'].queryset = CustomUser.objects.filter(is_employer=False)
# Admin Applications
@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    form = ApplicationAdminForm
    list_display = ('user', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'job__title')

class SavedJobAdminForm(forms.ModelForm):
    class Meta:
        model = SavedJob
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # mostra solo utenti non employer nella dropdown user
        self.fields['user'].queryset = CustomUser.objects.filter(is_employer=False)


# Admin SavedJobs
@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    form = SavedJobAdminForm
    list_display = ('user', 'job')
    search_fields = ('user__username', 'job__title')

# Admin Notifications
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'read', 'created_at')
    list_filter = ('read',)
    search_fields = ('user__username', 'message')

# Admin Messages
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'job', 'read', 'created_at')
    list_filter = ('read', 'created_at')
    search_fields = ('sender__username', 'receiver__username', 'content', 'job__title')
    raw_id_fields = ('sender', 'receiver', 'job')
    date_hierarchy = 'created_at'

# Admin Conversations
@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'participants_list', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('job__title', 'participants__username')
    filter_horizontal = ('participants',)
    raw_id_fields = ('job',)
    date_hierarchy = 'created_at'
    
    def participants_list(self, obj):
        return ", ".join([p.username for p in obj.participants.all()])
    participants_list.short_description = 'Partecipanti'
