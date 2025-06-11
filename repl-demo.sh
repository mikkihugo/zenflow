#!/bin/bash

echo "==========================================

    Claude-Flow REPL Demo

==========================================

The REPL is now fully functional! Here's what you can do:

1. Start the REPL:
   $ claude-flow repl

2. Available commands:
   - help              : Show all commands
   - status            : Show system status
   - clear             : Clear screen
   - history           : Show command history
   - exit              : Exit REPL

3. Agent Management:
   - agent spawn <type> [name]
   - agent list
   - agent info <id>
   - agent terminate <id>

4. Task Management:
   - task create <type> <description>
   - task list
   - task assign <task-id> <agent-id>
   - task status <id>

5. Memory Operations:
   - memory store <key> <value>
   - memory get <key>
   - memory list
   - memory clear

6. Terminal Sessions:
   - terminal create [name]
   - terminal list
   - terminal exec <command>
   - terminal attach <id>
   - terminal detach

7. Special Features:
   - !<command>        : Execute shell command
   - /<search>         : Search command history

==========================================

Starting interactive REPL now...
"

# Start the REPL
./bin/claude-flow repl