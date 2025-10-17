from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('profile/', views.profile),
    path('saved-jobs/', views.saved_jobs_list),
    path('applications/', views.applications_list),
    path('notifications/', views.notifications_list),
]
