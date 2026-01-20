#!/bin/bash

# Wait for Keycloak
echo "Waiting for Keycloak to start..."
until curl -s http://localhost:8080/health; do
  printf '.'
  sleep 5
done
echo "Keycloak is up."

# Login to Keycloak Admin CLI
docker exec echosight-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin

# Create Realm
echo "Creating Realm 'echosight'..."
docker exec echosight-keycloak /opt/keycloak/bin/kcadm.sh create realms -s realm=echosight -s enabled=true

# Create Client
echo "Creating Client 'echosight-frontend'..."
docker exec echosight-keycloak /opt/keycloak/bin/kcadm.sh create clients -r echosight \
  -s clientId=echosight-frontend \
  -s enabled=true \
  -s publicClient=true \
  -s "redirectUris=[\"http://localhost:5173/*\"]" \
  -s "webOrigins=[\"+\"]" \
  -s standardFlowEnabled=true

# Create Test User
echo "Creating User 'testuser'..."
docker exec echosight-keycloak /opt/keycloak/bin/kcadm.sh create users -r echosight \
  -s username=testuser \
  -s enabled=true
  
docker exec echosight-keycloak /opt/keycloak/bin/kcadm.sh set-password -r echosight \
  --username testuser \
  --new-password password

echo "Keycloak configured successfully!"
