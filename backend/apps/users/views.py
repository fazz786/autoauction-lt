from rest_framework import generics, status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserAdminSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create new user account"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user':  UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/ — authenticate and receive token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user':  UserSerializer(user).data,
        })


class LogoutView(APIView):
    """POST /api/auth/logout/ — delete auth token"""

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out successfully.'})


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/auth/me/ — view or update own profile"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """GET /api/auth/users/ — admin: list all users"""
    serializer_class   = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset           = User.objects.all().order_by('-created_at')


class BlockUserView(APIView):
    """POST /api/auth/users/<id>/block/ — admin: toggle block status"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        user.is_blocked = not user.is_blocked
        user.save()
        action = 'blocked' if user.is_blocked else 'unblocked'
        return Response({'detail': f'User {action} successfully.', 'is_blocked': user.is_blocked})
