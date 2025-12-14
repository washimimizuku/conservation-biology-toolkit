#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database started"

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'breed_registry'" | grep -q 1 || PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d postgres -c "CREATE DATABASE breed_registry"

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Start server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000