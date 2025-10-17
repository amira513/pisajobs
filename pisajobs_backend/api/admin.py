from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Job, Application, SavedJob, Notification

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
