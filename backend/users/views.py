"""
Users views — protected endpoints requiring Firebase authentication.
"""

import os
import uuid
import logging
from pathlib import Path
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_photo(request):
    """
    POST /api/users/profile-photo/
    Allows the authenticated user to upload/change their profile photo.
    Verifies token and saves the file to local media storage.
    """
    user = request.user
    if 'file' not in request.FILES:
        return Response({'detail': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

    photo_file = request.FILES['file']
    
    # 1. File Type Validation
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(photo_file.name)[1].lower()
    if ext not in allowed_extensions:
        return Response(
            {'detail': f'Unsupported image format. Allowed formats are: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    # 2. File Size Validation (5MB limit)
    max_size = 5 * 1024 * 1024  # 5MB
    if photo_file.size > max_size:
        return Response(
            {'detail': 'Image is too large. Max file size allowed is 5MB.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Ensure profile_pics media directory exists
    media_dir = Path(settings.MEDIA_ROOT) / 'profile_pics'
    media_dir.mkdir(parents=True, exist_ok=True)

    # 3. Secure File Saving
    # Delete old files for this user to avoid filling disk space
    for old_file in media_dir.glob(f"{user.uid}_*"):
        try:
            old_file.unlink()
        except Exception as e:
            logger.warning("Failed to delete old profile pic %s: %s", old_file, str(e))

    # Save new file with user's uid and unique timestamp to bypass browser caching
    timestamp = uuid.uuid4().hex[:8]
    filename = f"{user.uid}_{timestamp}{ext}"
    file_path = media_dir / filename

    try:
        with open(file_path, 'wb+') as destination:
            for chunk in photo_file.chunks():
                destination.write(chunk)
    except Exception as e:
        logger.error("Failed to save uploaded file: %s", str(e))
        return Response({'detail': 'Failed to save the image on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 4. Return correct photo URL (absolute URI matching the server host)
    photo_url = request.build_absolute_uri(f"/media/profile_pics/{filename}")
    
    logger.info("Uploaded new profile photo for uid=%s to %s", user.uid, photo_url)

    return Response({
        'photoURL': photo_url,
        'message': 'Profile picture uploaded successfully.'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_photo(request):
    """
    DELETE /api/users/profile-photo/
    Deletes the authenticated user's uploaded profile picture from the disk.
    """
    user = request.user
    media_dir = Path(settings.MEDIA_ROOT) / 'profile_pics'
    deleted_count = 0
    if media_dir.exists():
        for file in media_dir.glob(f"{user.uid}_*"):
            try:
                file.unlink()
                deleted_count += 1
            except Exception as e:
                logger.warning("Failed to delete file %s: %s", file, str(e))
                
    logger.info("Deleted %d profile photos for uid=%s", deleted_count, user.uid)
    return Response({
        'message': 'Custom profile picture deleted successfully from server.',
        'deleted_count': deleted_count
    })

