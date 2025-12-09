#!/bin/bash

# Script untuk setup PostgreSQL dengan password
# Jalankan dengan: bash setup-postgres-password.sh

echo "🔧 Setting up PostgreSQL user and database..."
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Path ke PostgreSQL
PSQL_PATH="/opt/homebrew/opt/postgresql@14/bin/psql"

# Database configuration
DB_NAME="food_recipe_db"
DB_USER="hanwhalife"
DB_PASSWORD="T@njungPr10k"

echo -e "${YELLOW}Step 1: Connecting to PostgreSQL (using default connection)...${NC}"

# Try to connect without password first (peer authentication)
$PSQL_PATH postgres << EOF
-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Set password for current user
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Show result
\l $DB_NAME
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ PostgreSQL setup complete!${NC}"
    echo ""
    echo "Database Configuration:"
    echo "  DB_HOST = localhost"
    echo "  DB_USER = $DB_USER"
    echo "  DB_PASSWORD = $DB_PASSWORD"
    echo "  DB_NAME = $DB_NAME"
    echo "  DB_PORT = 5432"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm start"
    echo "  2. (Optional) Run: npm run seed"
else
    echo ""
    echo -e "${RED}❌ Failed to setup PostgreSQL${NC}"
    echo ""
    echo "Please try manually:"
    echo "  1. Run: /opt/homebrew/opt/postgresql@14/bin/psql postgres"
    echo "  2. Execute: CREATE DATABASE $DB_NAME;"
    echo "  3. Execute: ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  4. Exit with: \\q"
fi
