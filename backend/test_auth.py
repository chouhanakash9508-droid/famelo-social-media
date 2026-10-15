from passlib.context import CryptContext
import json

# Test password verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load users
with open('data/users.json', 'r') as f:
    users = json.load(f)

# Test password for alice@example.com
test_password = "password"
alice = users[0]
print(f"Testing password verification for {alice['email']}")
print(f"Stored hash: {alice['hashed_password']}")

try:
    result = pwd_context.verify(test_password, alice['hashed_password'])
    print(f"Password verification result: {result}")
except Exception as e:
    print(f"Error during verification: {e}")

# Generate new hash for testing
new_hash = pwd_context.hash(test_password)
print(f"New hash for 'password': {new_hash}")