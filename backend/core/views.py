"""
Core views — public endpoints.
"""

import logging
from datetime import datetime, timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    GET /api/health/
    Public endpoint that returns the backend status.
    No authentication required.
    """
    logger.info("Health check requested from %s", request.META.get('REMOTE_ADDR'))
    return Response({
        'status': 'healthy',
        'service': 'memorycraft-backend',
        'version': '1.0.0',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })
