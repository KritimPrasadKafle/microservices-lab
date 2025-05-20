from django.urls import path
from .views import UserRegistrationView, UserListView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name = 'register'),
    path('users/', UserListView.as_view(), name = 'users-list'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
