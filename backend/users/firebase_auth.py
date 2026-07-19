"""
Firebase ID Token Authentication for Django REST Framework.

This module provides a custom DRF authentication class that verifies
Firebase ID tokens sent as Bearer tokens in the Authorization header.

Authentication Flow:
    React → Firebase Google Login → Firebase ID Token → Django REST API
    → Firebase Admin verifies token → Request is authenticated

Usage:
    Set as default authentication in settings.py REST_FRAMEWORK config,
    or use per-view with @authentication_classes([FirebaseAuthentication])
"""

import logging

from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)


class FirebaseUser:
    """
    Lightweight user object representing a Firebase-authenticated user.
    Used as request.user in DRF views after successful token verification.

    This does NOT use Django's built-in User model — Firebase is the
    single source of truth for authentication.
    """

    def __init__(self, decoded_token: dict):
        self.uid = decoded_token.get('uid', '')
        self.email = decoded_token.get('email', '')
        self.name = decoded_token.get('name', '')
        self.picture = decoded_token.get('picture', '')
        self.email_verified = decoded_token.get('email_verified', False)
        self.firebase_claims = decoded_token

    @property
    def is_authenticated(self):
        """Required by DRF — always True for verified Firebase users."""
        return True

    def __str__(self):
        return f"FirebaseUser(uid={self.uid}, email={self.email})"


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom DRF authentication backend that verifies Firebase ID tokens.

    Expects the Authorization header in the format:
        Authorization: Bearer <firebase-id-token>

    Returns:
        tuple: (FirebaseUser, decoded_token) on success
        None: if no Authorization header is present (allows anonymous access
              for views with AllowAny permission)

    Raises:
        AuthenticationFailed: if the token is invalid, expired, or revoked
    """

    keyword = 'Bearer'

    def authenticate(self, request):
        """
        Authenticate the request using a Firebase ID token.
        """
        auth_header = authentication.get_authorization_header(request).decode('utf-8')

        if not auth_header:
            return None  # No auth header — let permission classes decide

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != self.keyword:
            return None  # Not a Bearer token — skip this authenticator

        token = parts[1]

        try:
            from django.conf import settings
            from google.oauth2 import id_token
            from google.auth.transport import requests as auth_requests
            from google.auth import exceptions as auth_exceptions

            project_id = getattr(settings, 'FIREBASE_PROJECT_ID', 'memorycraft-2c771')
            
            # Verify token using Google's public certificates (does not require service account file)
            decoded_token = id_token.verify_firebase_token(
                token,
                auth_requests.Request(),
                audience=project_id
            )
            
            # Map 'sub' claim to 'uid' for compatibility
            if 'uid' not in decoded_token and 'sub' in decoded_token:
                decoded_token['uid'] = decoded_token['sub']

            logger.info(
                "Firebase token verified publicly for uid=%s email=%s",
                decoded_token.get('uid'),
                decoded_token.get('email'),
            )
            user = FirebaseUser(decoded_token)
            return (user, decoded_token)

        except ValueError as e:
            err_str = str(e).lower()
            logger.warning("Firebase token verification ValueError: %s", str(e))
            if "expired" in err_str:
                raise exceptions.AuthenticationFailed(
                    detail="Firebase ID token has expired. Please re-authenticate.",
                    code="token_expired",
                )
            else:
                raise exceptions.AuthenticationFailed(
                    detail=f"Invalid Firebase ID token: {str(e)}",
                    code="token_invalid",
                )

        except auth_exceptions.MalformedError as e:
            logger.warning("Malformed Firebase ID token: %s", str(e))
            raise exceptions.AuthenticationFailed(
                detail="Malformed authentication token format.",
                code="token_format_error",
            )

        except Exception as e:
            logger.error("Unexpected Firebase auth error: %s", str(e))
            raise exceptions.AuthenticationFailed(
                detail="Authentication failed. Please try again.",
                code="auth_error",
            )


    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the WWW-Authenticate
        header in a 401 response.
        """
        return self.keyword
