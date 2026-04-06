"""
users/models.py
Custom User model extending Django's AbstractUser.
Adds role field to distinguish Admin vs regular User.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('user',  'Regular User'),
        ('admin', 'Administrator'),
    ]

    role        = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone       = models.CharField(max_length=20, blank=True)
    country     = models.CharField(max_length=60, default='Lithuania')
    is_blocked  = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def is_admin(self):
        return self.role == 'admin'
