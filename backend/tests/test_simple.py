"""Simple tests to verify the test environment is working"""

import pytest
from app.core.config import settings


def test_settings_loaded():
    """Test that settings are loaded correctly"""
    assert settings.PROJECT_NAME == "Money Dairy Lovers"
    assert settings.VERSION == "1.0.0"
    assert settings.API_V1_STR == "/api/v1"


def test_environment_variable():
    """Test environment variables are loaded"""
    assert settings.ENVIRONMENT == "development"
    assert settings.MAX_FILE_SIZE == 5242880


def test_cors_origins():
    """Test CORS origins configuration"""
    origins = settings.BACKEND_CORS_ORIGINS
    assert isinstance(origins, list)
    assert len(origins) > 0


def test_basic_math():
    """Test that basic math works"""
    assert 2 + 2 == 4
    assert 10 * 5 == 50


class TestSimpleClass:
    """Simple test class"""
    
    def test_string_operations(self):
        """Test string operations"""
        test_string = "Money Dairy Lovers"
        assert test_string.lower() == "money dairy lovers"
        assert test_string.upper() == "MONEY DAIRY LOVERS"
        assert "Money" in test_string
    
    def test_list_operations(self):
        """Test list operations"""
        test_list = [1, 2, 3, 4, 5]
        assert len(test_list) == 5
        assert sum(test_list) == 15
        assert max(test_list) == 5
        assert min(test_list) == 1