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
            from firebase_admin import auth as firebase_auth

            decoded_token = firebase_auth.verify_id_token(token)
            logger.info(
                "Firebase token verified for uid=%s email=%s",
                decoded_token.get('uid'),
                decoded_token.get('email'),
            )
            user = FirebaseUser(decoded_token)
            return (user, decoded_token)

        except firebase_auth.ExpiredIdTokenError:
            logger.warning("Expired Firebase ID token received")
            raise exceptions.AuthenticationFailed(
                detail="Firebase ID token has expired. Please re-authenticate.",
                code="token_expired",
            )

        except firebase_auth.RevokedIdTokenError:
            logger.warning("Revoked Firebase ID token received")
            raise exceptions.AuthenticationFailed(
                detail="Firebase ID token has been revoked.",
                code="token_revoked",
            )

        except firebase_auth.InvalidIdTokenError as e:
            logger.warning("Invalid Firebase ID token: %s", str(e))
            raise exceptions.AuthenticationFailed(
                detail="Invalid Firebase ID token.",
                code="token_invalid",
            )

        except firebase_auth.CertificateFetchError as e:
            logger.error("Failed to fetch Firebase certificates: %s", str(e))
            raise exceptions.AuthenticationFailed(
                detail="Authentication service temporarily unavailable.",
                code="cert_fetch_error",
            )

        except ValueError as e:
            logger.warning("Firebase token verification ValueError: %s", str(e))
            raise exceptions.AuthenticationFailed(
                detail="Invalid authentication token format.",
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
