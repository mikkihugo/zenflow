/**
 * Ink Tui Module
 * Converted from JavaScript to TypeScript
 */

import path from 'node:path';
import { Box, render, Text, useInput } from 'ink';
import React, { useEffect, useState } from 'react';

// API client for auto-generated API
class ApiClient {
  constructor(baseUrl = 'http = baseUrl;
}

async;
fetchHives();
{
  try {
    const response = await fetch(`${this.baseUrl}/api/hives`);
    return await response.json();
  } catch (_error) {
    console.error('Failed to fetchhives = await fetch(`${this.baseUrl}/hive-mind/${hiveName}`);
    return await response.json();
  }
  catch(error) 
      console.error(`Failed to fetch hive details
  for ${hiveName}
  :`, error)
  return null;
}

async;
executeCommand(command, (args = []), (flags = {}));
: any
{
    try {
      const _response = await fetch(`${this.baseUrl}/${command}`, {method = new ApiClient();

const _SingularityAlpha = ({ cli }) => {
  const [_hives, setHives] = useState({});
  const [_selectedHive, setSelectedHive] = useState(null);
  const [currentView, setCurrentView] = useState('hives'); // 'hives', 'details', 'command', 'create', 'directory'
  const [_selectedHiveName, setSelectedHiveName] = useState(null);
  const [_commandResult, setCommandResult] = useState(null);
  const [command, setCommand] = useState('');
  const [_isExecuting, setIsExecuting] = useState(false);
  const [_commandHistory, setCommandHistory] = useState([]);
  const [_selectedDirectory, _setSelectedDirectory] = useState(process.cwd());
  const [newServiceName, setNewServiceName] = useState('');
  const [focusedButton, setFocusedButton] = useState(0); //0 = useApp();

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
    if(currentView === 'create') {
      if(key.escape) {
        setCurrentView('hives');
        setNewServiceName('');
      } else if (key.return && newServiceName.trim()) {
        // Create the service
        const _result = await apiClient.executeCommand('create', [newServiceName], {path = > prev.slice(0, -1));
      } else if(!key.ctrl && !key.meta && input) {
        setNewServiceName(prev => prev + input);
      }
      return;
    }
    
    // Handle button navigation with Tab
    if(key.tab && currentView === 'hives') {
      setFocusedButton(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
      return;
    }
    
    // Handle button activation with Enter
    if(key.return && focusedButton > 0 && !command) {
      if(focusedButton === 1) {
        // Select directory
        setCurrentView('directory');
      } else if(focusedButton === 2) {
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
    } else if(key.backspace || key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if(key.escape) {
      if(currentView === 'details') {
        setCurrentView('hives');
        setSelectedHive(null);
        setSelectedHiveName(null);
      } else if(command) {
        setCommand('');
        setCommandResult(null);
      } else {
        exit();
      }
    } else if(input === 'q' && !command) {
      exit();
    } else if(input === 'r' && !command) {
      // Refresh data
      loadHives();
    } else if(!key.ctrl && !key.meta && input && currentView !== 'details') {
      setCommand(prev => prev + input);
    }
  });

    setCurrentView('details');
    const hiveDetails = await apiClient.fetchHiveDetails(hiveName);
    setSelectedHive(hiveDetails);
  };

    setCommandResult(result);
  };

  const loadHives = async () => {
    const hivesData = await apiClient.fetchHives();
    setHives(hivesData);
  };

  return React.createElement(Box, {borderStyle = === 'hives' && React.createElement(Box, {flexDirection = === 1 ? "double" : "single",
          borderColor = === 1 ? "cyan" : "gray",paddingX = === 1 ? "cyan" : "white" }, 
            "📁 Select Directory"
          )
        ),
        React.createElement(Box, { 
          borderStyle = === 2 ? "double" : "single",
          borderColor = === 2 ? "cyan" : "gray",paddingX = === 2 ? "cyan" : "white" }, 
            "➕ Create New Service"
          )
        )
      ),
      
      // Always show command input at bottom
      React.createElement(Box, borderStyle = == 'string' ? commandResult.result : 'Success')
          : commandResult.error
        )
      )
    ),
    
    currentView === 'details' && selectedHive && React.createElement(HiveDetails, hive = == 'create' && React.createElement(Box, borderStyle = === 'directory' && React.createElement(DirectorySelector, 
      _currentPath => {
        setSelectedDirectory(_dir);
        setCommandResult({success = > setCurrentView('hives')
    }),
    
    React.createElement(Box, { borderStyle: "single", paddingX: 2 },
      React.createElement(Text, { color: "gray" },
        `View: ${currentView} | Services: ${Object.keys(hives).length} | API: Connected`
      )
    )
  );;

export function _renderTui(cli: any): any {
  console.warn('🚀 Starting Singularity Alpha TUI with API integration...');
  render(React.createElement(SingularityAlpha, { cli: cli }));
}

export { ApiClient };
