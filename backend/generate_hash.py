from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generate hash for password "password"
password_hash = pwd_context.hash("password")
print(f"Password hash for 'password': {password_hash}")

# Verify it works
print(f"Verification test: {pwd_context.verify('password', password_hash)}")