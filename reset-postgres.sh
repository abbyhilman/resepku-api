#!/bin/bash

# Script untuk reset PostgreSQL password dengan cara menghapus password requirement
# Jalankan dengan: bash reset-postgres.sh

echo "🔧 Resetting PostgreSQL authentication..."
echo ""

# Stop PostgreSQL
echo "Stopping PostgreSQL..."
brew services stop postgresql@14
sleep 2

# Backup pg_hba.conf
echo "Backing up configuration..."
cp /opt/homebrew/var/postgresql@14/pg_hba.conf /opt/homebrew/var/postgresql@14/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)

# Replace all authentication methods with 'trust'
echo "Updating authentication method to 'trust'..."
cat > /opt/homebrew/var/postgresql@14/pg_hba.conf << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
EOF

# Start PostgreSQL
echo "Starting PostgreSQL..."
brew services start postgresql@14
sleep 5

# Test connection
echo "Testing connection..."
if /opt/homebrew/opt/postgresql@14/bin/psql postgres -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Connection successful!"
    
    # Create database
    echo "Creating database..."
    /opt/homebrew/opt/postgresql@14/bin/psql postgres -c "CREATE DATABASE food_recipe_db;" 2>&1 | grep -v "already exists" || echo "Database created or already exists"
    
    # Set password for user (optional, for future use)
    echo "Setting password for user hanwhalife..."
    /opt/homebrew/opt/postgresql@14/bin/psql postgres -c "ALTER USER hanwhalife WITH PASSWORD 'T@njungPr10k';"
    
    echo ""
    echo "✅ PostgreSQL setup complete!"
    echo ""
    echo "You can now:"
    echo "  1. Keep using without password (current setup)"
    echo "  2. Or use with password: T@njungPr10k"
    echo ""
    echo "To use WITHOUT password, update .env:"
    echo "  DB_PASSWORD = "
    echo ""
    echo "To use WITH password, keep .env as is:"
    echo "  DB_PASSWORD = T@njungPr10k"
    echo ""
else
    echo "❌ Connection failed. Please check PostgreSQL logs:"
    echo "  tail -f /opt/homebrew/var/log/postgresql@14.log"
fi
