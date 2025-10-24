from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Job, SavedJob, Application, Notification, Message, Conversation
from .serializers import UserSerializer, JobSerializer, SavedJobSerializer, ApplicationSerializer, NotificationSerializer, MessageSerializer, ConversationSerializer
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'id': user.id,
            
            'username': user.username,
            'email': user.email,
            'is_employer': user.is_employer,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'detail': 'Username e password obbligatori.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_employer': user.is_employer,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    else:
        return Response({'detail': 'Credenziali non valide.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_jobs_list(request):
    saved_jobs = SavedJob.objects.filter(user=request.user)
    serializer = SavedJobSerializer(saved_jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applications_list(request):
    applications = Application.objects.filter(user=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Marca una notifica come letta"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.save()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notifica non trovata.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Marca tutte le notifiche dell'utente come lette"""
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'detail': 'Tutte le notifiche sono state marcate come lette.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    """Conta le notifiche non lette"""
    count = Notification.objects.filter(user=request.user, read=False).count()
    return Response({'unread_count': count})


# JOB MANAGEMENT APIs 


@api_view(['GET'])
@permission_classes([AllowAny])
def jobs_list(request):
    """Lista tutti i job disponibili"""
    jobs = Job.objects.all().order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employer_jobs_list(request):
    """Lista i job dell'employer autenticato"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    jobs = Job.objects.filter(employer=request.user).order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def job_create(request):
    """Crea un nuovo job"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = JobSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(employer=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_detail(request, job_id):
    """Dettagli di un job specifico"""
    job = get_object_or_404(Job, id=job_id)
    serializer = JobSerializer(job)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def job_update(request, job_id):
    """Aggiorna un job"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id, employer=request.user)
    serializer = JobSerializer(job, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def job_delete(request, job_id):
    """Elimina un job"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id, employer=request.user)
    job.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


#APPLICATION MANAGEMENT APIs

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    """User applica a un job"""
    if request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per utenti.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id)
    
    # Controlla se l'utente ha già applicato
    if Application.objects.filter(user=request.user, job=job).exists():
        return Response({'detail': 'Hai già applicato per questo lavoro.'}, status=status.HTTP_400_BAD_REQUEST)
    
    application = Application.objects.create(user=request.user, job=job)
    serializer = ApplicationSerializer(application)
    
    # Crea notifica per l'employer
    Notification.objects.create(
        user=job.employer,
        message=f"Nuova candidatura per '{job.title}' da {request.user.username}"
    )
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_applications(request, job_id):
    """Lista le candidature per un job specifico (solo per l'employer)"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id, employer=request.user)
    applications = Application.objects.filter(job=job).order_by('-applied_at')
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    """Aggiorna lo status di una candidatura (solo per l'employer)"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id, job__employer=request.user)
    new_status = request.data.get('status')
    
    if new_status not in ['pending', 'accepted', 'rejected']:
        return Response({'detail': 'Status non valido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    application.status = new_status
    application.save()
    
    # Crea notifica per l'utente
    status_text = {'accepted': 'accettata', 'rejected': 'rifiutata', 'pending': 'in attesa'}[new_status]
    Notification.objects.create(
        user=application.user,
        message=f"La tua candidatura per '{application.job.title}' è stata {status_text}"
    )
    
    serializer = ApplicationSerializer(application)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_job(request, job_id):
    """User salva un job"""
    if request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per utenti.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id)
    
    # Controlla se il job è già salvato
    if SavedJob.objects.filter(user=request.user, job=job).exists():
        return Response({'detail': 'Job già salvato.'}, status=status.HTTP_400_BAD_REQUEST)
    
    saved_job = SavedJob.objects.create(user=request.user, job=job)
    serializer = SavedJobSerializer(saved_job)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_job(request, job_id):
    """User rimuove un job salvato"""
    if request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per utenti.'}, status=status.HTTP_403_FORBIDDEN)
    
    saved_job = get_object_or_404(SavedJob, user=request.user, job_id=job_id)
    saved_job.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


#  MESSAGING APIs 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations_list(request):
    """Lista le conversazioni dell'utente"""
    conversations = Conversation.objects.filter(participants=request.user).order_by('-updated_at')
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    """Inizia una nuova conversazione"""
    receiver_id = request.data.get('receiver_id')
    job_id = request.data.get('job_id')
    
    if not receiver_id:
        return Response({'detail': 'Receiver ID richiesto.'}, status=status.HTTP_400_BAD_REQUEST)
    
    receiver = get_object_or_404(CustomUser, id=receiver_id)
    
    # Controlla se esiste già una conversazione
    existing_conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=receiver
    )
    
    if job_id:
        existing_conversation = existing_conversation.filter(job_id=job_id)
    
    if existing_conversation.exists():
        conversation = existing_conversation.first()
    else:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, receiver)
        if job_id:
            job = get_object_or_404(Job, id=job_id)
            conversation.job = job
            conversation.save()
    
    serializer = ConversationSerializer(conversation)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_messages(request, conversation_id):
    """Lista i messaggi di una conversazione"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    messages = Message.objects.filter(
        sender__in=conversation.participants.all(),
        receiver__in=conversation.participants.all()
    ).order_by('created_at')
    
    # Marca i messaggi come letti
    Message.objects.filter(
        receiver=request.user,
        sender__in=conversation.participants.exclude(id=request.user.id)
    ).update(read=True)
    
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Invia un messaggio"""
    receiver_id = request.data.get('receiver_id')
    content = request.data.get('content')
    job_id = request.data.get('job_id')
    
    if not receiver_id or not content:
        return Response({'detail': 'Receiver ID e contenuto richiesti.'}, status=status.HTTP_400_BAD_REQUEST)
    
    receiver = get_object_or_404(CustomUser, id=receiver_id)
    job = get_object_or_404(Job, id=job_id) if job_id else None
    
    # Trova o crea la conversazione
    conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=receiver
    ).first()
    
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, receiver)
        if job:
            conversation.job = job
            conversation.save()
    
    message = Message.objects.create(
        sender=request.user,
        receiver=receiver,
        job=job,
        content=content
    )
    
    # Crea notifica per il ricevitore
    Notification.objects.create(
        user=receiver,
        message=f"Nuovo messaggio da {request.user.username}"
    )
    
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_messages_count(request):
    """Conta i messaggi non letti"""
    count = Message.objects.filter(receiver=request.user, read=False).count()
    return Response({'unread_count': count})


#  MATCHING SYSTEM APIs

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_matches(request, job_id):
    """Trova candidati matching per un job (solo per employer)"""
    if not request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per employer.'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id, employer=request.user)
    
    # Logica di matching basata su skills
    job_skills = job.skills_required.lower().split(',') if job.skills_required else []
    
    # Trova utenti con skills simili
    matching_users = CustomUser.objects.filter(is_employer=False)
    
    matches = []
    for user in matching_users:
        if user.skills:
            user_skills = user.skills.lower().split(',')
            # Calcola il grado di matching
            common_skills = set(job_skills) & set(user_skills)
            match_score = len(common_skills) / len(job_skills) if job_skills else 0
            
            if match_score > 0:
                matches.append({
                    'user': UserSerializer(user).data,
                    'match_score': match_score,
                    'common_skills': list(common_skills)
                })
    
    # Ordina per score di matching
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return Response(matches)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_job_recommendations(request):
    """Raccomandazioni di job per l'utente"""
    if request.user.is_employer:
        return Response({'detail': 'Accesso negato. Solo per utenti.'}, status=status.HTTP_403_FORBIDDEN)
    
    user_skills = request.user.skills.lower().split(',') if request.user.skills else []
    
    # Trova job con skills simili
    all_jobs = Job.objects.all()
    recommendations = []
    
    for job in all_jobs:
        if job.skills_required:
            job_skills = job.skills_required.lower().split(',')
            common_skills = set(user_skills) & set(job_skills)
            match_score = len(common_skills) / len(job_skills) if job_skills else 0
            
            if match_score > 0:
                recommendations.append({
                    'job': JobSerializer(job).data,
                    'match_score': match_score,
                    'common_skills': list(common_skills)
                })
    
    # Ordina per score di matching
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    
    return Response(recommendations[:10])  # Top 10 raccomandazioni
