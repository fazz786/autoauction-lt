from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Comment, CommentLike
from .serializers import CommentSerializer


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/comments/?auction=<id>  — public: list comments for an auction
    POST /api/comments/               — authenticated: post a comment
    """
    serializer_class   = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Comment.objects.select_related('author').all()
        auction_id = self.request.query_params.get('auction')
        if auction_id:
            qs = qs.filter(auction_id=auction_id)
        return qs


class CommentDeleteView(generics.DestroyAPIView):
    """DELETE /api/comments/<id>/ — admin: remove a comment"""
    queryset           = Comment.objects.all()
    serializer_class   = CommentSerializer
    permission_classes = [permissions.IsAdminUser]


class CommentLikeView(APIView):
    """POST /api/comments/<id>/like/ — toggle like on a comment"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({'detail': 'Comment not found.'}, status=404)

        like, created = CommentLike.objects.get_or_create(comment=comment, user=request.user)
        if not created:
            like.delete()
            return Response({'liked': False, 'like_count': comment.likes.count()})
        return Response({'liked': True, 'like_count': comment.likes.count()})
