"""
Users views — protected endpoints requiring Firebase authentication.
"""

import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /api/me/
    Protected endpoint that returns the authenticated Firebase user's information.
    Requires a valid Firebase ID token in the Authorization header.

    Returns:
        200: User information from the verified Firebase token
        401: If no token or invalid token is provided
    """
    user = request.user
    logger.info("User profile requested by uid=%s", user.uid)

    return Response({
        'uid': user.uid,
        'email': user.email,
        'name': user.name,
        'picture': user.picture,
        'email_verified': user.email_verified,
    })
