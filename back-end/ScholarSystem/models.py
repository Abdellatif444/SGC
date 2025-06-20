from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.core.exceptions import ValidationError
import os

def validate_document_file(value):
    """Validate that uploaded document is PDF, DOCX, or TXT"""
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.docx', '.txt']
    if ext not in valid_extensions:
        raise ValidationError(
            f'Unsupported file extension. Please upload a file with one of these extensions: {", ".join(valid_extensions)}'
        )

def validate_image_file(value):
    """Validate that uploaded image is a valid image format"""
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(
            f'Unsupported image format. Please upload an image with one of these extensions: {", ".join(valid_extensions)}'
        )

class Publication(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    domain = models.CharField(max_length=100)
    tags = models.JSONField(default=list, blank=True)
    document = models.FileField(upload_to='documents/', validators=[validate_document_file])
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True, validators=[validate_image_file])
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    author_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    attachments = ArrayField(models.URLField(), default=list, blank=True)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    comments = models.JSONField(default=list)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            GinIndex(fields=['tags']),
            GinIndex(fields=['metadata'])
        ]

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['sender', 'receiver', 'timestamp']),
            GinIndex(fields=['metadata'])
        ]

class ChatbotInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    query = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    context = models.JSONField(default=dict)
    confidence_score = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            GinIndex(fields=['context', 'metadata'])
        ]

class Document(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    file_url = models.URLField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    document_type = models.CharField(max_length=50)
    metadata = models.JSONField(default=dict)
    is_public = models.BooleanField(default=True)
    tags = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    search_vector = SearchVectorField(null=True)
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            GinIndex(fields=['metadata']),
            GinIndex(fields=['tags']),
            GinIndex(fields=['search_vector'])
        ]





