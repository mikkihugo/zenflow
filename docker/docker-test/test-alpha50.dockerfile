FROM node:20-alpine

WORKDIR /app

# Install required packages
RUN apk add --no-cache \
    git \
    bash \
    curl \
    jq

# Install claude-zen alpha.50
RUN npm install -g claude-zen@alpha

# Create test script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "=== Testing Claude Flow alpha.50 ==="\n\
echo ""\n\
echo "1. Version check:"\n\
claude-zen --version\n\
echo ""\n\
echo "2. Help text:"\n\
claude-zen --help | head -20\n\
echo ""\n\
echo "3. Hive-mind help:"\n\
claude-zen hive-mind help\n\
echo ""\n\
echo "4. Initialize hive-mind:"\n\
claude-zen hive-mind init\n\
echo ""\n\
echo "5. Spawn a test session:"\n\
claude-zen hive-mind spawn "Test Docker environment" --queen-type strategic --max-workers 3\n\
echo ""\n\
echo "6. List sessions:"\n\
claude-zen hive-mind sessions\n\
echo ""\n\
echo "7. Get session ID and test resume:"\n\
SESSION_ID=$(claude-zen hive-mind sessions --json | jq -r ".[0].session_id" || echo "no-session")\n\
if [ "$SESSION_ID" != "no-session" ]; then\n\
  echo "Resuming session: $SESSION_ID"\n\
  claude-zen hive-mind resume "$SESSION_ID"\n\
else\n\
  echo "No session found to resume"\n\
fi\n\
echo ""\n\
echo "=== All tests passed! ==="\n\
' > /test-alpha50.sh && chmod +x /test-alpha50.sh

CMD ["/test-alpha50.sh"]