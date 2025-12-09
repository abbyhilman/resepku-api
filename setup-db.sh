#!/bin/bash

# Script untuk setup PostgreSQL database untuk Recipe API
# Jalankan dengan: bash setup-db.sh

echo "🔧 Setting up PostgreSQL for Recipe API..."
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Path ke PostgreSQL
PSQL_PATH="/opt/homebrew/opt/postgresql@14/bin/psql"
CREATEDB_PATH="/opt/homebrew/opt/postgresql@14/bin/createdb"

# Database name
DB_NAME="food_recipe_db"
DB_USER="$USER"

echo -e "${YELLOW}Database Name:${NC} $DB_NAME"
echo -e "${YELLOW}Database User:${NC} $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! pgrep -x postgres > /dev/null; then
    echo -e "${YELLOW}PostgreSQL is not running. Starting...${NC}"
    brew services start postgresql@14
    sleep 3
fi

# Try to create database
echo -e "${YELLOW}Creating database...${NC}"

# Method 1: Try with createdb (no password)
$CREATEDB_PATH $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '$DB_NAME' created successfully!${NC}"
else
    # Method 2: Try with psql
    $PSQL_PATH -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database '$DB_NAME' created successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Database might already exist or there's a connection issue.${NC}"
        echo -e "${YELLOW}Checking if database exists...${NC}"
        
        # Check if database exists
        DB_EXISTS=$($PSQL_PATH -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)
        
        if [ "$DB_EXISTS" = "1" ]; then
            echo -e "${GREEN}✅ Database '$DB_NAME' already exists!${NC}"
        else
            echo -e "${RED}❌ Failed to create database.${NC}"
            echo ""
            echo "Please try manually:"
            echo "  1. Open Terminal"
            echo "  2. Run: /opt/homebrew/opt/postgresql@14/bin/psql postgres"
            echo "  3. Execute: CREATE DATABASE $DB_NAME;"
            echo "  4. Exit with: \\q"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}✅ PostgreSQL setup complete!${NC}"
echo ""
echo "Your .env configuration:"
echo "  DB_HOST = localhost"
echo "  DB_USER = $DB_USER"
echo "  DB_PASSWORD = (leave empty)"
echo "  DB_NAME = $DB_NAME"
echo "  DB_PORT = 5432"
echo ""
echo "Next steps:"
echo "  1. Run: npm start"
echo "  2. (Optional) Run: npm run seed"
echo ""
