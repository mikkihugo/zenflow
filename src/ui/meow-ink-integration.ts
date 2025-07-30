#!/usr/bin/env node
/**
 * 🎯 ENHANCED MEOW + INK INTEGRATION
 * 
 * Modern CLI with advanced TUIfeaturing = ({ progress = 0, label = '', width = 40, color = 'cyan' }) => {
  const filled = Math.floor((progress / 100) * width);
  const empty = width - filled;
  
  return (
    <Box>
      <Text color={color}>
        {label && `${label}: `}
        [{'█'.repeat(filled)}{'░'.repeat(empty)}] {progress.toFixed(1)}%
      </Text>
    </Box>
  );
};

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  useEffect(() => {
    // Auto-completion logic
    if(value.length > 0) {
      listCommands().then(commands => {
        const matches = commands
          .filter(cmd => cmd.name.toLowerCase().startsWith(value.toLowerCase()))
          .slice(0, 5);
        setSuggestions(matches);
        setSelectedSuggestion(-1);
      });
    } else {
      setSuggestions([]);
    }
  }, [value]);
  
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">$ </Text>
        <Text>{value}</Text>
        <Text color="gray">{placeholder && !value ?placeholder = "column" marginLeft={2}>
          {suggestions.map((cmd, index) => (
            <Text 
              key={cmd.name}
              color={index === selectedSuggestion ? 'cyan' : 'gray'}
              backgroundColor={index === selectedSuggestion ? 'blue' : undefined}
            >
              {cmd.name} - {cmd.description}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

const SwarmTopology = ({ swarms = [], connections = [] }) => {
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold color="cyan">🐝 Swarm Topology</Text>
      
      {swarms.length === 0 ? (
        <Text color="gray">No active swarms</Text>
      ) : (
        swarms.map(swarm => (
          <Box key={swarm.id} marginLeft={2}>
            <Text color="yellow">
              {swarm.name} ({swarm.agents} agents) - {swarm.status}
            </Text>
          </Box>
        ))
      )}
      
      {connections.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray">Connections = > (
            <Text key={index} color="blue" marginLeft={2}>
              {conn.from} ←→ {conn.to}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

  return (
    <Box flexDirection="column" borderStyle="single" padding={1} height={height + 2}>
      <Text bold color="cyan">📋 Command Logs</Text>
      
      {visibleLogs.map((log, index) => (
        <Text 
          key={index}
          color={log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : 'white'}
        >
          {new Date(log.timestamp).toLocaleTimeString()} {log.message}
        </Text>
      ))}
      
      {logs.length === 0 && (
        <Text color="gray">No logs yet</Text>
      )}
    </Box>
  );
};

};

const HelpPane = ({ selectedCommand = null }) => {
  const [commandHelp, setCommandHelp] = useState(null);
  
  useEffect(() => {
    if(selectedCommand) {
      // Fetch command help
      listCommands().then(commands => {
        const cmd = commands.find(c => c.name === selectedCommand);
        setCommandHelp(cmd);
      });
    }
  }, [selectedCommand]);
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold color="cyan">📖 Help</Text>
      
      {commandHelp ? (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>{commandHelp.name}</Text>
          <Text color="gray">{commandHelp.description}</Text>
          <Text marginTop={1}>Usage = {1 = "yellow">Examples:</Text>
              {commandHelp.examples.map((example, index) => (
                <Text key={index} color="gray" marginLeft={2}>{example}</Text>
              ))}
            </>
          )}
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray">Keyboard Shortcuts = {2 = {2}>Ctrl+C - Exit</Text>
          <Text marginLeft={2}>↑/↓ - Navigate suggestions</Text>
          <Text marginLeft={2}>F1 - API mode</Text>
          <Text marginLeft={2}>F2 - Monitoring mode</Text>
          <Text marginLeft={2}>F3 - Help mode</Text>
        </Box>
      )}
    </Box>
  );
};

const CLIInterface = ({ initialCommand = null, initialArgs = [], initialFlags = {} }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiServer, setApiServer] = useState(null);
  const [mode, setMode] = useState('cli'); // 'cli', 'api', 'monitoring', 'help'
  const [currentProgress, setCurrentProgress] = useState(0);
  const [longRunningTask, setLongRunningTask] = useState(null);
  const [systemStatus, setSystemStatus] = useState({apiRunning = useState({apiCalls = useState([
    {id = useState([
    {from = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [viewLayout, setViewLayout] = useState('split'); // 'split', 'full'
  
  const { exit } = useApp();

  // Auto-execute initial command
  useEffect(() => {
    if(initialCommand) {
      executeCommandWithOutput(initialCommand, initialArgs, initialFlags);
    }
  }, [initialCommand]);

  // Update system status periodically
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const commands = await listCommands();
        setSystemStatus(prev => ({
          ...prev,commandCount = apiServer.getStatus();
          setMetrics({apiCalls = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [apiServer]);

  // Command auto-completion
  useEffect(() => {
    if(command.length > 0) {
      listCommands().then(commands => {
        const matches = commands
          .filter(cmd => cmd.name.toLowerCase().startsWith(command.toLowerCase()))
          .slice(0, 8);
        setSuggestions(matches);
        setSelectedSuggestion(-1);
      });
    } else {
      setSuggestions([]);
    }
  }, [command]);

  const executeCommandWithOutput = useCallback(async (cmd, args = [], flags = {}) => {
    setIsExecuting(true);
    setCurrentProgress(0);
    const timestamp = new Date().toISOString();

    // Simulate long-running task with progress
    setLongRunningTask({name = setInterval(() => {
        setCurrentProgress(prev => {

          setLongRunningTask(task => task ? { ...task,progress = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        const logEntry = {type = (...args) => {
        const logEntry = { 
          type = {setCurrentProgress = > task ? { ...task, progress });
        }
      };

      // Restore console
      console.log = originalLog;
      console.error = originalError;
      
      clearInterval(progressInterval);
      setCurrentProgress(100);
      
      // Update output with enhanced information
      setOutput(prev => [...prev, 
        {type = > ({ ...prev,executions = > [...prev, 
        {type = useCallback(async () => {
    if(apiServer) {
      setOutput(prev => [...prev, {type = new AutoGeneratedAPI({ 
        port,enableWebSocket = await api.start();
      setApiServer(api);
      setSystemStatus(prev => ({ ...prev,apiRunning = > [...prev, {type = > [...prev, {type = useCallback(async () => {
    if(!apiServer) {
      setOutput(prev => [...prev, {type = > ({ ...prev,apiRunning = > [...prev, {type = > [...prev, {
        type => {
    // Global keyboard shortcuts
    if(key.ctrl && input === 'c') {
      exit();
      return;
    }
    
    // Function keys for mode switching
    if(key.f1) { setMode('api'); return; }
    if(key.f2) { setMode('monitoring'); return; }
    if(key.f3) { setMode('help'); return; }
    if(key.f4) { setMode('cli'); return; }
    
    // Layout switching
    if(key.ctrl && input === 'l') {
      setViewLayout(prev => prev === 'split' ? 'full' : 'split');
      return;
    }
    
    // Command completion navigation
    if(suggestions.length > 0) {
      if(key.upArrow) {
        setSelectedSuggestion(prev => Math.max(-1, prev - 1));
        return;
      }
      if(key.downArrow) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
        return;
      }
      if(key.tab && selectedSuggestion >= 0) {
        setCommand(suggestions[selectedSuggestion].name);
        setSelectedCommand(suggestions[selectedSuggestion].name);
        return;
      }
    }
    
    // Command execution
    if (key.return && command.trim()) {
      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      // Use suggestion if one is selected
      if(selectedSuggestion >= 0) {
        executeCommandWithOutput(suggestions[selectedSuggestion].name, args, {});
        setSelectedCommand(suggestions[selectedSuggestion].name);
      } else {
        executeCommandWithOutput(cmd, args, {});
        setSelectedCommand(cmd);
      }
      setCommand('');
      return;
    }
    
    // Command input
    if(key.backspace || key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if(key.escape) {
      if(command) {
        setCommand('');
        setSelectedCommand(null);
      } else {
        exit();
      }
    } else if(input === 'q' && !command) {
      exit();
    } else if(input === 'r' && !command && mode === 'monitoring') {
      // Refresh monitoring data
      setOutput(prev => [...prev, {type = == 1) {
      setCommand(prev => prev + input);
    }
    
    // Mode-specific inputs
    if(mode === 'api') {
      if (input === 's') startAPIServer();
      if (input === 'x') stopAPIServer();
      if(input === 'e') {
        generateAPIEndpoints().then(endpoints => {
          setOutput(prev => [...prev, {type = (type) => {
    switch(type) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'command': return 'cyan';
      case 'info': return 'yellow';default = (targetMode) => {
    return mode === targetMode ? 'cyan' : 'gray';
  };

  // Main render component with enhanced split-pane layout
  return React.createElement(Box, {flexDirection = == 'cli' }, '[F4] CLI '),
      React.createElement(Text, {color = == 'api' }, '[F1] API '),
      React.createElement(Text, {color = == 'monitoring' }, '[F2] Monitor '),
      React.createElement(Text, {color = == 'help' }, '[F3] Help '),
      React.createElement(Spacer, null),
      React.createElement(Text, {color = == 'split' ? 
      // Split-pane layout
      React.createElement(Box, {flexGrow = == 'cli' && React.createElement(Box, { flexDirection => {
                const parts = cmd.split(' ');
                executeCommandWithOutput(parts[0], parts.slice(1), {});
              }
            }),
            suggestions.length > 0 && React.createElement(Box, {flexDirection = > 
                React.createElement(Text, {key = == selectedSuggestion ? 'cyan' : 'white',backgroundColor = == selectedSuggestion ? 'blue' ,marginLeft = == 'api' && React.createElement(Box, {flexDirection = == 'monitoring' && React.createElement(SwarmTopology, { 
            swarms, 
            connections 
          }),
          
          mode === 'help' && React.createElement(HelpPane, { 
            selectedCommand 
          }),

          // Command input area (always visible)
          React.createElement(Box, {borderStyle = == 'cli' && React.createElement(Box, {flexDirection = == 'monitoring' && React.createElement(Box, {flexDirection = > 
            React.createElement(Text, {key = (command = null, args = [], flags = {}) => {
  render(React.createElement(CLIInterface, {initialCommand = () => {
  const cli = createMeowCLI();
  const { input, flags } = cli;
  
  if(flags.ui || flags.terminal) {
    // Launch TUI interface
    launchMeowInkInterface(input[0], input.slice(1), flags);
  } else {
    // Return parsed command for normal CLI execution
    return {command = == `file => {
    console.warn('\n👋 Claude-Zen interface shutting down...');
    process.exit(0);
  });
}

export default CLIInterface;
