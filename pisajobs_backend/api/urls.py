from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register),
    path('login/', views.login),
    path('profile/', views.profile),
    
    # User specific
    path('saved-jobs/', views.saved_jobs_list),
    path('applications/', views.applications_list),
    path('notifications/', views.notifications_list),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read),
    path('notifications/mark-all-read/', views.mark_all_notifications_read),
    path('notifications/unread-count/', views.unread_notifications_count),
    
    # Job management
    path('jobs/', views.jobs_list),  # Lista tutti i job (pubblico)
    path('employer/jobs/', views.employer_jobs_list),  # Job dell'employer
    path('jobs/create/', views.job_create),  # Crea job 
    path('jobs/<int:job_id>/', views.job_detail),  # Dettagli job
    path('jobs/<int:job_id>/update/', views.job_update),  # Aggiorna job
    path('jobs/<int:job_id>/delete/', views.job_delete),  # Elimina job
    
    # Applications
    path('jobs/<int:job_id>/apply/', views.apply_to_job),  # Applica a job
    path('jobs/<int:job_id>/applications/', views.job_applications),  # Candidature per job
    path('applications/<int:application_id>/status/', views.update_application_status),  # Aggiorna status candidatura
    
    # Save/Unsave jobs
    path('jobs/<int:job_id>/save/', views.save_job),  # Salva job
    path('jobs/<int:job_id>/unsave/', views.unsave_job),  # Rimuovi job salvato
    
    # Messaging
    path('conversations/', views.conversations_list),  # Lista conversazioni
    path('conversations/start/', views.start_conversation),  # Inizia conversazione
    path('conversations/<int:conversation_id>/messages/', views.conversation_messages),  # Messaggi conversazione
    path('messages/send/', views.send_message),  # Invia messaggio
    path('messages/unread-count/', views.unread_messages_count),  # Conta messaggi non letti
    
    # Matching system
    path('jobs/<int:job_id>/matches/', views.job_matches),  # Candidati matching per job
    path('recommendations/', views.user_job_recommendations),  # Raccomandazioni per utente
]
