from django.db import models
from django.contrib.auth.models import AbstractUser

# Utente personalizzato
class CustomUser(AbstractUser):
    is_employer = models.BooleanField(default=False)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.username} ({'Employer' if self.is_employer else 'User'})"

# Lavoro
class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    location = models.CharField(max_length=100, default='Pisa')
    pay = models.DecimalField(max_digits=10, decimal_places=2)
    skills_required = models.TextField(blank=True)
    employer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.location})"

# Candidatura a un lavoro
class Application(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=50, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} -> {self.job.title} ({self.status})"

# Lavoro salvato dall’utente
class SavedJob(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} saved {self.job.title}"

# Notifiche agli utenti
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - Read: {self.read}"
