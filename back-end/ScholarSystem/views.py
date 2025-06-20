from django.shortcuts import render
from django.http import HttpResponse, FileResponse, Http404
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth import authenticate, login
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Publication, ChatMessage, ChatbotInteraction, Document
from .serializers import (
    PublicationSerializer, ChatMessageSerializer,
    ChatbotInteractionSerializer, DocumentSerializer
)
from transformers import pipeline
import torch
from datetime import datetime
from django.db import models
from django.db.models import Q
import os
from django.conf import settings
import json
import re
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



# Create your views here.
def home(request):
    return render(request,'home.html')


def Room(request):
    return render(request,'room.html')


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({
                'detail': 'Connexion réussie',
                'csrf_token': get_token(request)
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'username': ['Identifiants incorrects']
            }, status=status.HTTP_400_BAD_REQUEST)

class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    # permission_classes = [permissions.IsAuthenticated]  # Temporarily commented out for testing

    def create(self, request, *args, **kwargs):
        try:
            print(f"Received data: {request.data}")
            print(f"Received files: {request.FILES}")
            
            # Validate required fields
            if not request.data.get('title'):
                return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not request.data.get('content'):
                return Response({'error': 'Abstract/Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not request.data.get('domain'):
                return Response({'error': 'Domain is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not request.data.get('author_name'):
                return Response({'error': 'Author name is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if document is uploaded
            if 'document' not in request.FILES:
                return Response({'error': 'Document file is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (20MB for documents, 5MB for images)
            document_file = request.FILES.get('document')
            if document_file and document_file.size > 20 * 1024 * 1024:  # 20MB
                return Response({'error': 'Document file size must be less than 20MB'}, status=status.HTTP_400_BAD_REQUEST)
            
            cover_image = request.FILES.get('cover_image')
            if cover_image and cover_image.size > 5 * 1024 * 1024:  # 5MB
                return Response({'error': 'Cover image size must be less than 5MB'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Process tags
            tags_data = request.data.get('tags', '[]')
            if isinstance(tags_data, str):
                try:
                    tags = json.loads(tags_data)
                except json.JSONDecodeError:
                    # If JSON parsing fails, treat as comma-separated string
                    tags = [tag.strip() for tag in tags_data.split(',') if tag.strip()]
            else:
                tags = tags_data
            
            print(f"Processed tags: {tags}")
            
            # Create the publication data
            publication_data = {
                'title': request.data.get('title'),
                'content': request.data.get('content'),
                'domain': request.data.get('domain'),
                'author_name': request.data.get('author_name'),
                'tags': tags,
                'document': document_file,
                'cover_image': cover_image
            }
            
            print(f"Publication data: {publication_data}")
            
            serializer = self.get_serializer(data=publication_data)
            if serializer.is_valid():
                print("Serializer is valid")
                self.perform_create(serializer, author_name=request.data.get('author_name'))
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error creating publication: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': 'An error occurred while creating the publication'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer, author_name):
        try:
            print(f"perform_create called with author_name: {author_name}")
            
            # Clean and validate author name
            if not author_name or not author_name.strip():
                author_name = 'Anonymous'
            
            author_name = author_name.strip()
            print(f"Cleaned author_name: {author_name}")
            
            # Try to find an existing user with the provided author name
            user = User.objects.filter(username=author_name).first()
            print(f"Existing user found: {user}")
            
            if not user:
                # Create a new user with the author name as username
                # Generate a unique username if the author name already exists as a username
                # Clean the author name for username (remove special characters, spaces to underscores)
                base_username = re.sub(r'[^a-zA-Z0-9_]', '_', author_name.lower())
                base_username = re.sub(r'_+', '_', base_username).strip('_')
                
                # Ensure username is not empty and has minimum length
                if not base_username or len(base_username) < 3:
                    base_username = 'author'
                
                username = base_username
                counter = 1
                
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                print(f"Generated username: {username}")
                
                # Split author name for first_name and last_name
                name_parts = author_name.split()
                first_name = name_parts[0] if name_parts else author_name
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                
                print(f"Creating user with first_name: {first_name}, last_name: {last_name}")
                
                # Create user with the author name
                user = User.objects.create_user(
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    password='default123'  # Default password for auto-created users
                )
                print(f"User created successfully: {user}")
            
            print(f"Saving publication with author: {user}")
            serializer.save(author=user)
            print("Publication saved successfully")
            
        except Exception as e:
            print(f"Error in perform_create: {e}")
            import traceback
            traceback.print_exc()
            # Fallback: create without author
            serializer.save()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        publication = self.get_object()
        publication.likes += 1
        publication.save()
        return Response({
            'status': 'liked',
            'likes': publication.likes,
            'dislikes': publication.dislikes
        })

    @action(detail=True, methods=['post'])
    def dislike(self, request, pk=None):
        publication = self.get_object()
        # Add dislikes field if it doesn't exist
        if not hasattr(publication, 'dislikes'):
            publication.dislikes = 0
        publication.dislikes += 1
        publication.save()
        return Response({
            'status': 'disliked',
            'likes': publication.likes,
            'dislikes': publication.dislikes
        })

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        publication = self.get_object()
        
        # Validate input
        content = request.data.get('content', '').strip()
        user = request.data.get('user', 'Anonymous').strip()
        
        if not content:
            return Response({'error': 'Comment content is required'}, status=400)
        
        # Create comment with proper timestamp
        comment = {
            'user': user or 'Anonymous',
            'content': content,
            'timestamp': datetime.now().isoformat()
        }
        
        # Initialize comments list if it doesn't exist
        if not publication.comments:
            publication.comments = []
        
        # Add comment to the list
        publication.comments.append(comment)
        publication.save()
        
        # Return the complete comment object
        return Response(comment)

    @action(detail=True, methods=['delete'], url_path='comment/(?P<comment_index>[0-9]+)')
    def delete_comment(self, request, pk=None, comment_index=None):
        publication = self.get_object()
        try:
            comment_index = int(comment_index)
            if not publication.comments:
                return Response({'error': 'No comments found'}, status=404)
            if comment_index < 0 or comment_index >= len(publication.comments):
                return Response({'error': 'Comment index out of range'}, status=400)
            comment = publication.comments[comment_index]
            # Autorisation : admin ou auteur du commentaire
            if not (request.user.is_staff or request.user.is_superuser or comment.get('user') == request.user.username):
                return Response({'error': 'Vous ne pouvez supprimer que vos propres commentaires.'}, status=403)
            deleted_comment = publication.comments.pop(comment_index)
            publication.save()
            return Response({
                'status': 'deleted',
                'comment': deleted_comment,
                'remaining_comments': len(publication.comments)
            })
        except (ValueError, TypeError):
            return Response({'error': 'Invalid comment index'}, status=400)
        except Exception as e:
            return Response({'error': f'Error deleting comment: {str(e)}'}, status=500)

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        tag = request.query_params.get('tag', '')
        domain = request.query_params.get('domain', '')
        author = request.query_params.get('author', '')
        date = request.query_params.get('date', '')
        queryset = self.get_queryset()
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(content__icontains=q))
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        if domain:
            queryset = queryset.filter(domain__icontains=domain)
        if author:
            queryset = queryset.filter(author_name__icontains=author)
        if date:
            queryset = queryset.filter(created_at__date=date)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        publication = self.get_object()
        
        # Increment comment counter when document is downloaded
        if not publication.comments:
            publication.comments = []
        
        # Add a system comment to indicate download
        download_comment = {
            'user': 'System',
            'content': f'Document downloaded by user',
            'timestamp': datetime.now().isoformat(),
            'type': 'download'
        }
        
        publication.comments.append(download_comment)
        publication.save()
        
        if publication.document:
            file_path = os.path.join(settings.MEDIA_ROOT, str(publication.document))
            
            if os.path.exists(file_path):
                # Récupère l'extension d'origine du document
                file_name = os.path.basename(str(publication.document))
                file_extension = os.path.splitext(file_name)[1]
                print(f"[DOWNLOAD] Nom du fichier stocké : {file_name}, extension utilisée : {file_extension}")
                
                # Nettoie le nom du fichier pour éviter tout caractère spécial
                safe_title = publication.title.replace(' ', '_').replace('/', '_').replace('\\', '_')
                safe_title = ''.join(c for c in safe_title if c.isalnum() or c in ('-', '_')).rstrip('_')
                
                # Construit le nom final avec l'extension d'origine
                safe_filename = f"{safe_title}{file_extension}"
                print(f"[DOWNLOAD] Nom du fichier envoyé au navigateur : {safe_filename}")
                
                response = FileResponse(open(file_path, 'rb'))
                response['Content-Disposition'] = f'attachment; filename=\"{safe_filename}\"'
                return response
            else:
                raise Http404("File not found")
        else:
            raise Http404("No document available")

    @action(detail=True, methods=['post'], url_path='clean-comments')
    def clean_comments(self, request, pk=None):
        publication = self.get_object()
        
        if publication.comments:
            # Remove duplicate comments based on content and user
            seen = set()
            unique_comments = []
            
            for comment in publication.comments:
                # Create a unique key for each comment
                comment_key = f"{comment.get('user', '')}:{comment.get('content', '')}"
                
                if comment_key not in seen:
                    seen.add(comment_key)
                    unique_comments.append(comment)
            
            # Update publication with unique comments
            publication.comments = unique_comments
            publication.save()
            
            return Response({
                'status': 'cleaned',
                'original_count': len(publication.comments),
                'cleaned_count': len(unique_comments)
            })
        
        return Response({'status': 'no comments to clean'})

    @action(detail=False, methods=['post'], url_path='clean-all-comments')
    def clean_all_comments(self, request):
        publications = self.get_queryset()
        total_cleaned = 0
        
        for publication in publications:
            if publication.comments:
                # Remove duplicate comments
                seen = set()
                unique_comments = []
                
                for comment in publication.comments:
                    comment_key = f"{comment.get('user', '')}:{comment.get('content', '')}"
                    
                    if comment_key not in seen:
                        seen.add(comment_key)
                        unique_comments.append(comment)
                
                if len(unique_comments) != len(publication.comments):
                    publication.comments = unique_comments
                    publication.save()
                    total_cleaned += 1
        
        return Response({
            'status': 'cleaned',
            'publications_cleaned': total_cleaned
        })

    def destroy(self, request, *args, **kwargs):
        publication = self.get_object()
        if request.user.is_staff or request.user.is_superuser:
            return super().destroy(request, *args, **kwargs)
        return Response({'error': "Seul l'admin peut supprimer une publication."}, status=403)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            models.Q(sender=self.request.user) |
            models.Q(receiver=self.request.user)
        ).order_by('timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ChatbotViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.qa_model = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2",
            tokenizer="deepset/roberta-base-squad2"
        )

    @action(detail=False, methods=['post'])
    def ask(self, request):
        query = request.data.get('query')
        context = self._get_relevant_context(query)
        
        response = self.qa_model(
            question=query,
            context=context
        )

        interaction = ChatbotInteraction.objects.create(
            user=request.user,
            query=query,
            response=response['answer'],
            context={'context': context}
        )

        return Response({
            'answer': response['answer'],
            'confidence': response['score']
        })

    def _get_relevant_context(self, query):
        # Implémenter la logique pour récupérer le contexte pertinent
        # à partir des documents stockés
        return "Contexte pertinent basé sur les documents disponibles"

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        documents = Document.objects.filter(
            models.Q(title__icontains=query) |
            models.Q(content__icontains=query)
        )
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        from django.contrib.auth.models import User
        import re
        user = None
        # Recherche par email ou username
        if username_or_email:
            if re.match(r"[^@]+@[^@]+\\.[^@]+", username_or_email):
                try:
                    user = User.objects.get(email=username_or_email)
                    username = user.username
                except User.DoesNotExist:
                    username = None
            else:
                username = username_or_email
        else:
            username = None
        # Toujours utiliser authenticate pour vérifier le mot de passe hashé
        from django.contrib.auth import authenticate
        user = authenticate(username=username, password=password)
        if not user:
            from rest_framework_simplejwt.exceptions import AuthenticationFailed
            raise AuthenticationFailed('No active account found with the given credentials')
        data = super().validate({'username': username, 'password': password})
        data['role'] = 'admin' if user.is_staff or user.is_superuser else 'user'
        data['email'] = user.email
        data['date_joined'] = user.date_joined.strftime('%Y-%m-%d')
        data['username'] = user.username
        return data

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer

