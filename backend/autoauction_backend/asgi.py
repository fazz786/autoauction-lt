"""
ASGI config for AutoAuction LT.
Routes HTTP requests through Django and WebSocket connections
through Django Channels for real-time bidding.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import apps.auctions.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autoauction_backend.settings')

application = ProtocolTypeRouter({
    # Standard HTTP → Django views
    'http': get_asgi_application(),

    # WebSocket → Django Channels (real-time bidding)
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                apps.auctions.routing.websocket_urlpatterns
            )
        )
    ),
})
