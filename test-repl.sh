#!/bin/bash

# Test REPL functionality
echo "Testing Claude-Flow REPL..."

# Create a temporary expect script
cat > /tmp/test-repl-expect.sh << 'EOF'
#!/usr/bin/expect -f

set timeout 5

spawn ./bin/claude-flow repl

expect "claude-flow>"
send "help\r"

expect "claude-flow>"
send "status\r"

expect "claude-flow>"
send "agent spawn researcher bot1\r"

expect "claude-flow>"
send "agent list\r"

expect "claude-flow>"
send "task create research 'test task'\r"

expect "claude-flow>"
send "memory store test 'hello world'\r"

expect "claude-flow>"
send "memory list\r"

expect "claude-flow>"
send "!echo 'Shell command test'\r"

expect "claude-flow>"
send "exit\r"

expect eof
EOF

# Make it executable
chmod +x /tmp/test-repl-expect.sh

# Check if expect is installed
if command -v expect &> /dev/null; then
    echo "Running REPL test with expect..."
    /tmp/test-repl-expect.sh
else
    echo "expect not found, testing with simple echo commands..."
    # Fallback to simple test
    timeout 5s ./bin/claude-flow repl << EOF
help
status
exit
EOF
fi

# Cleanup
rm -f /tmp/test-repl-expect.sh

echo "REPL test completed."