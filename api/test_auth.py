#!/usr/bin/env python3
"""
Test script to verify password hashing works correctly
"""

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from passlib.context import CryptContext
    
    # Test argon2 configuration
    try:
        pwd_context = CryptContext(
            schemes=["argon2", "bcrypt"],
            deprecated="auto",
            argon2__memory_cost=102400,
            argon2__time_cost=2,
            argon2__parallelism=8
        )
        print("✅ Argon2 configuration successful")
        
        # Test password hashing
        test_password = "test123"
        hashed = pwd_context.hash(test_password)
        print(f"✅ Password hashed successfully: {hashed[:50]}...")
        
        # Test password verification
        is_valid = pwd_context.verify(test_password, hashed)
        print(f"✅ Password verification: {is_valid}")
        
        if is_valid:
            print("🎉 Password hashing system is working correctly!")
        else:
            print("❌ Password verification failed")
            sys.exit(1)
            
    except Exception as e:
        logger.warning(f"Argon2 failed: {e}")
        
        # Fallback to bcrypt
        try:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            print("✅ Bcrypt fallback configuration successful")
            
            # Test password hashing
            test_password = "test123"
            hashed = pwd_context.hash(test_password)
            print(f"✅ Password hashed successfully: {hashed[:50]}...")
            
            # Test password verification
            is_valid = pwd_context.verify(test_password, hashed)
            print(f"✅ Password verification: {is_valid}")
            
            if is_valid:
                print("🎉 Password hashing system is working correctly with bcrypt!")
            else:
                print("❌ Password verification failed")
                sys.exit(1)
                
        except Exception as e2:
            print(f"❌ Both argon2 and bcrypt failed: {e2}")
            sys.exit(1)
            
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages: pip install passlib argon2-cffi")
    sys.exit(1)
