#!/usr/bin/env python3
import subprocess
import time

def test_repl():
    print("Testing Claude-Flow REPL...")
    
    # Start the REPL process
    proc = subprocess.Popen(
        ['./bin/claude-flow', 'repl'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )
    
    # Helper function to send command and read response
    def send_command(cmd):
        print(f"\n> Sending: {cmd}")
        proc.stdin.write(cmd + '\n')
        proc.stdin.flush()
        time.sleep(0.5)  # Give it time to process
    
    try:
        # Send test commands
        commands = [
            'help',
            'status', 
            'agent spawn researcher bot1',
            'agent list',
            'task create research "test task"',
            'memory store test "hello world"',
            'memory list',
            '!echo "Shell test"',
            'exit'
        ]
        
        for cmd in commands:
            send_command(cmd)
            
        # Wait for process to complete
        proc.wait(timeout=5)
        
        # Read all output
        output, errors = proc.communicate()
        print("\nOutput:")
        print(output)
        
        if errors:
            print("\nErrors:")
            print(errors)
            
    except subprocess.TimeoutExpired:
        print("\nTimeout reached, terminating...")
        proc.terminate()
    except Exception as e:
        print(f"\nError: {e}")
        proc.terminate()

if __name__ == "__main__":
    test_repl()