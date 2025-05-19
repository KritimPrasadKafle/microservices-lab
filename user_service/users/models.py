from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid 
# Create your models here.

class User(AbstractUser):
    id = models.BigIntegerField(unique=True, primary_key=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

