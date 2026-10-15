import hashlib
import json

# Simple password hashing function as fallback
def simple_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def simple_verify(password: str, hashed: str) -> bool:
    return simple_hash(password) == hashed

# Load and update users with simple hashes
with open('data/users.json', 'r') as f:
    users = json.load(f)

# Update all users with simple hash for "password"
for user in users:
    user['hashed_password'] = simple_hash("password")

# Save updated users
with open('data/users.json', 'w') as f:
    json.dump(users, f, indent=2)

print("Updated user passwords with simple hashing")
print(f"Hash for 'password': {simple_hash('password')}")