from django.urls import path
from .views import CommentListCreateView, CommentDeleteView, CommentLikeView

urlpatterns = [
    path('',                    CommentListCreateView.as_view(), name='comment-list'),
    path('<int:pk>/',           CommentDeleteView.as_view(),     name='comment-delete'),
    path('<int:pk>/like/',      CommentLikeView.as_view(),       name='comment-like'),
]
