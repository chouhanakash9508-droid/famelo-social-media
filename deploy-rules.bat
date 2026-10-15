@echo off
echo Deploying Firestore rules...
cd frontend
firebase deploy --only firestore:rules
echo Rules deployed successfully!
pause