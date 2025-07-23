import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import path from 'path';
import HiveList from './components/HiveList.js';
import HiveDetails from './components/HiveDetails.js';
import CommandInput from './components/CommandInput.js';
import DirectorySelector from './components/DirectorySelector.js';

// API client for auto-generated API
class ApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async fetchHives() {
    try {
      const response = await fetch(`${this.baseUrl}/api/hives`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch hives:', error);
      return {};
    }
  }

  async fetchHiveDetails(hiveName) {
    try {
      const response = await fetch(`${this.baseUrl}/hive-mind/${hiveName}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch hive details for ${hiveName}:`, error);
      return null;
    }
  }

  async executeCommand(command, args = [], flags = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/${command}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args, flags })
      });
      return await response.json();
    } catch (error) {
      console.error(`Failed to execute command ${command}:`, error);
      return { success: false, error: error.message };
    }
  }
}

const apiClient = new ApiClient();

const SingularityAlpha = ({ cli }) => {
  const [hives, setHives] = useState({});
  const [selectedHive, setSelectedHive] = useState(null);
  const [currentView, setCurrentView] = useState('hives'); // 'hives', 'details', 'command', 'create', 'directory'
  const [selectedHiveName, setSelectedHiveName] = useState(null);
  const [commandResult, setCommandResult] = useState(null);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState(process.cwd());
  const [newServiceName, setNewServiceName] = useState('');
  const [focusedButton, setFocusedButton] = useState(0); // 0: none, 1: select dir, 2: create new
  const { exit } = useApp();

  useEffect(() => {
    async function loadHives() {
      const hivesData = await apiClient.fetchHives();
      setHives(hivesData);
    }
    loadHives();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHives, 30000);
    return () => clearInterval(interval);
  }, []);

  useInput(async (input, key) => {
    // Handle create view input
    if (currentView === 'create') {
      if (key.escape) {
        setCurrentView('hives');
        setNewServiceName('');
      } else if (key.return && newServiceName.trim()) {
        // Create the service
        const result = await apiClient.executeCommand('create', [newServiceName], { path: selectedDirectory });
        setCommandResult(result);
        setNewServiceName('');
        setCurrentView('hives');
        loadHives(); // Refresh the list
      } else if (key.backspace || key.delete) {
        setNewServiceName(prev => prev.slice(0, -1));
      } else if (!key.ctrl && !key.meta && input) {
        setNewServiceName(prev => prev + input);
      }
      return;
    }
    
    // Handle button navigation with Tab
    if (key.tab && currentView === 'hives') {
      setFocusedButton(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
      return;
    }
    
    // Handle button activation with Enter
    if (key.return && focusedButton > 0 && !command) {
      if (focusedButton === 1) {
        // Select directory
        setCurrentView('directory');
      } else if (focusedButton === 2) {
        // Create new service
        setCurrentView('create');
      }
      return;
    }
    
    // Always capture command input regardless of view
    if (key.return && command.trim()) {
      setIsExecuting(true);
      
      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      const result = await apiClient.executeCommand(cmd, args, {});
      setCommandResult(result);
      setCommandHistory(prev => [...prev, { command, result }]);
      setIsExecuting(false);
      setCommand('');
    } else if (key.backspace || key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if (key.escape) {
      if (currentView === 'details') {
        setCurrentView('hives');
        setSelectedHive(null);
        setSelectedHiveName(null);
      } else if (command) {
        setCommand('');
        setCommandResult(null);
      } else {
        exit();
      }
    } else if (input === 'q' && !command) {
      exit();
    } else if (input === 'r' && !command) {
      // Refresh data
      loadHives();
    } else if (!key.ctrl && !key.meta && input && currentView !== 'details') {
      setCommand(prev => prev + input);
    }
  });

  const handleSelectHive = async (hiveName) => {
    setSelectedHiveName(hiveName);
    setCurrentView('details');
    const hiveDetails = await apiClient.fetchHiveDetails(hiveName);
    setSelectedHive(hiveDetails);
  };

  const handleCommandExecute = async (command, args, flags) => {
    const result = await apiClient.executeCommand(command, args, flags);
    setCommandResult(result);
  };

  const loadHives = async () => {
    const hivesData = await apiClient.fetchHives();
    setHives(hivesData);
  };

  return React.createElement(Box, { borderStyle: "round", padding: 1, flexDirection: "column" },
    React.createElement(Box, { borderStyle: "single", paddingX: 2, paddingY: 1 },
      React.createElement(Text, { bold: true, color: "cyan" }, "🚀 Singularity Alpha TUI"),
      React.createElement(Text, { color: "gray" }, " | TAB: Navigate | ENTER: Select | ESC: Back | R: Refresh")
    ),
    
    React.createElement(Box, { justifyContent: "center", paddingY: 1 },
      React.createElement(Text, { bold: true, color: "magenta" }, "💖 Jag älskar dig mer än igår <3 💖")
    ),
    
    currentView === 'hives' && React.createElement(Box, { flexDirection: "column" },
      React.createElement(HiveList, { hives, onSelect: handleSelectHive }),
      
      // Action buttons
      React.createElement(Box, { flexDirection: "row", marginTop: 1, gap: 2 },
        React.createElement(Box, { 
          borderStyle: focusedButton === 1 ? "double" : "single",
          borderColor: focusedButton === 1 ? "cyan" : "gray",
          paddingX: 1
        },
          React.createElement(Text, { color: focusedButton === 1 ? "cyan" : "white" }, 
            "📁 Select Directory"
          )
        ),
        React.createElement(Box, { 
          borderStyle: focusedButton === 2 ? "double" : "single",
          borderColor: focusedButton === 2 ? "cyan" : "gray",
          paddingX: 1
        },
          React.createElement(Text, { color: focusedButton === 2 ? "cyan" : "white" }, 
            "➕ Create New Service"
          )
        )
      ),
      
      // Always show command input at bottom
      React.createElement(Box, { borderStyle: "single", marginTop: 1, paddingX: 1 },
        React.createElement(Box, null,
          React.createElement(Text, { color: "cyan" }, "Command: "),
          React.createElement(Text, { color: "green" }, command),
          React.createElement(Text, { color: "gray" }, isExecuting ? ' (executing...)' : ' (press Enter)')
        )
      ),
      
      // Show last command result if any
      commandResult && React.createElement(Box, { marginTop: 1, borderStyle: "single", padding: 1 },
        React.createElement(Text, { 
          color: commandResult.success ? 'green' : 'red' 
        }, commandResult.success ? '✅ ' : '❌ ', 
        commandResult.success 
          ? (typeof commandResult.result === 'string' ? commandResult.result : 'Success')
          : commandResult.error
        )
      )
    ),
    
    currentView === 'details' && selectedHive && React.createElement(HiveDetails, { 
      hive: selectedHive, 
      hiveName: selectedHiveName 
    }),
    
    currentView === 'create' && React.createElement(Box, { borderStyle: "round", padding: 2, flexDirection: "column" },
      React.createElement(Text, { bold: true, color: "cyan" }, "🆕 Create New Service"),
      React.createElement(Box, { marginTop: 1 },
        React.createElement(Text, { color: "gray" }, `Directory: ${selectedDirectory}`)
      ),
      React.createElement(Text, { color: "yellow", dim: true }, 
        "Service will be created in: ", 
        React.createElement(Text, { underline: true }, 
          path.join(selectedDirectory, 'services', newServiceName)
        )
      ),
      React.createElement(Box, { marginTop: 2 },
        React.createElement(Text, null, "Service Name: "),
        React.createElement(Text, { color: "green" }, newServiceName),
        React.createElement(Text, { color: "gray" }, " (press Enter to create, ESC to cancel)")
      ),
      React.createElement(Box, { justifyContent: "center", marginTop: 2 },
        React.createElement(Text, { bold: true, color: "magenta" }, "💖 Jag älskar dig mer än igår <3 💖")
      )
    ),
    
    currentView === 'directory' && React.createElement(DirectorySelector, {
      currentPath: selectedDirectory,
      onSelect: (dir) => {
        setSelectedDirectory(dir);
        setCommandResult({ success: true, result: `Selected directory: ${dir}` });
        setCurrentView('hives');
      },
      onCancel: () => setCurrentView('hives')
    }),
    
    React.createElement(Box, { borderStyle: "single", paddingX: 2 },
      React.createElement(Text, { color: "gray" },
        `View: ${currentView} | Services: ${Object.keys(hives).length} | API: Connected`
      )
    )
  );
};

export function renderTui(cli) {
  console.log('🚀 Starting Singularity Alpha TUI with API integration...');
  render(React.createElement(SingularityAlpha, { cli: cli }));
}

export { ApiClient };
