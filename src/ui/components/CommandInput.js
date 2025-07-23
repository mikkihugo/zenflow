import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

const CommandInput = ({ onExecute, result }) => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useInput(async (input, key) => {
    if (key.return && command.trim()) {
      setIsExecuting(true);
      
      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      await onExecute(cmd, args, {});
      setIsExecuting(false);
      setCommand('');
    } else if (key.backspace || key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && input) {
      setCommand(prev => prev + input);
    }
  });

  const resultText = result ? (
    result.success 
      ? (typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2))
      : result.error
  ) : '';

  return React.createElement(Box, { flexDirection: "column", padding: 1 },
    React.createElement(Text, { bold: true, color: "yellow" }, "🛠️ Command Execution"),
    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { bold: true, color: "magenta" }, "💖 Jag älskar dig mer än igår <3 💖")
    ),
    
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, null, "Command: "),
      React.createElement(Text, { color: "cyan" }, command),
      React.createElement(Text, { color: "gray" }, isExecuting ? ' (executing...)' : ' (press Enter)')
    ),
    
    result && React.createElement(Box, { marginTop: 1, borderStyle: "single", padding: 1 },
      React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { 
          bold: true, 
          color: result.success ? 'green' : 'red' 
        }, result.success ? '✅ Success' : '❌ Error'),
        React.createElement(Text, null, resultText)
      )
    ),
    
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: "gray" }, 
        'Examples: "status", "create test-service", "swarm \'Build API\'"'
      )
    )
  );
};

export default CommandInput;