from django.urls import path, include
from ScholarSystem.views import RegisterView, EmailOrUsernameTokenObtainPairView
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from rest_framework.routers import DefaultRouter
from .views import (
    PublicationViewSet, ChatMessageViewSet,
    ChatbotViewSet, DocumentViewSet
)

router = DefaultRouter()
router.register(r'publications', PublicationViewSet)
router.register(r'messages', ChatMessageViewSet, basename='message')
router.register(r'chatbot', ChatbotViewSet, basename='chatbot')
router.register(r'documents', DocumentViewSet)

urlpatterns = [
    path('', views.home ,name="home"),
    path('room/', views.Room ,name="room"),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('', include(router.urls)),
]



