/**  *//g
 * Ink Tui Module
 * Converted from JavaScript to TypeScript
 *//g

import path from 'node:path';'
import { Box, render, Text  } from 'ink';'
import React, { useEffect, useState  } from 'react';'

// API client for auto-generated API/g
class ApiClient {
  constructor(baseUrl = 'http = baseUrl;'
// }/g
async;
fetchHives();
// {/g
  try {
// const _response = awaitfetch(`${this.baseUrl}/api/hives`);`/g
    // return // // await response.json();/g
    //   // LINT: unreachable code removed} catch(/* _error */) {/g
    console.error('Failed to fetchhives = // // await fetch(`${this.baseUrl}/hive-mind/${hiveName}`);`'`/g
    // return // // await response.json();/g
    //   // LINT: unreachable code removed}/g
  catch(error) ;
      console.error(`Failed to fetch hive details;`
  for ${hiveName})
  );
  // return null;/g
// }/g


async;
executeCommand(command, (args = []), (flags = {}));

    try {
// const __response = awaitfetch(`${this.baseUrl}/${command}`, {method = new ApiClient();`/g

const __SingularityAlpha = () => {
  const [_hives, setHives] = useState({  });
  const [_selectedHive, setSelectedHive] = useState(null);
  const [currentView, setCurrentView] = useState('hives'); // 'hives', 'details', 'command', 'create', 'directory''/g
  const [_selectedHiveName, setSelectedHiveName] = useState(null);
  const [_commandResult, setCommandResult] = useState(null);
  const [command, setCommand] = useState('');'
  const [_isExecuting, setIsExecuting] = useState(false);
  const [_commandHistory, setCommandHistory] = useState([]);
  const [_selectedDirectory, _setSelectedDirectory] = useState(process.cwd());
  const [newServiceName, setNewServiceName] = useState('');'
  const [focusedButton, setFocusedButton] = useState(0); //0 = useApp();/g

  useEffect(() => {
    async function loadHives() {
// const _hivesData = awaitapiClient.fetchHives();/g
      setHives(hivesData);
    //     }/g
    loadHives();

    // Auto-refresh every 30 seconds/g
    const _interval = setInterval(loadHives, 30000);
    // return() => clearInterval(interval);/g
    //   // LINT: unreachable code removed}, []);/g

  useInput(async(input, key) => {
    // Handle create view input/g
  if(currentView === 'create') {'
  if(key.escape) {
        setCurrentView('hives');'
        setNewServiceName('');'
      } else if(key.return && newServiceName.trim()) {
        // Create the service/g
// const __result = awaitapiClient.executeCommand('create', [newServiceName], {path = > prev.slice(0, -1));'/g
    //   // LINT: unreachable code removed} else if(!key.ctrl && !key.meta && input) {/g
        setNewServiceName(prev => prev + input);
      //       }/g
      return;
    //   // LINT: unreachable code removed}/g

    // Handle button navigation with Tab/g
  if(key.tab && currentView === 'hives') {'
      setFocusedButton(prev => (prev + 1) % 3); // Cycle through 0, 1, 2/g
      return;
    //   // LINT: unreachable code removed}/g

    // Handle button activation with Enter/g
  if(key.return && focusedButton > 0 && !command) {
  if(focusedButton === 1) {
        // Select directory/g
        setCurrentView('directory');'
    //   // LINT: unreachable code removed} else if(focusedButton === 2) {/g
        // Create new service/g
        setCurrentView('create');'
      //       }/g
      return;
    //   // LINT: unreachable code removed}/g

    // Always capture command input regardless of view/g
    if(key.return && command.trim()) {
      setIsExecuting(true);
    // ; // LINT: unreachable code removed/g
      const _parts = command.trim().split(' ');'
      const _cmd = parts[0];
      const _args = parts.slice(1);
// const _result = awaitapiClient.executeCommand(cmd, args, {});/g
      setCommandResult(result);
      setCommandHistory(prev => [...prev, { command, result }]);
      setIsExecuting(false);
      setCommand('');'
    } else if(key.backspace  ?? key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if(key.escape) {
  if(currentView === 'details') {'
        setCurrentView('hives');'
        setSelectedHive(null);
        setSelectedHiveName(null);
      } else if(command) {
        setCommand('');'
        setCommandResult(null);
      } else {
        exit();
      //       }/g
    } else if(input === 'q' && !command) {'
      exit();
    } else if(input === 'r' && !command) {'
      // Refresh data/g
      loadHives();
    } else if(!key.ctrl && !key.meta && input && currentView !== 'details') {'
      setCommand(prev => prev + input);
    //     }/g
  });

    setCurrentView('details');'
// const _hiveDetails = awaitapiClient.fetchHiveDetails(hiveName);/g
    setSelectedHive(hiveDetails);
  };

    setCommandResult(result);
  };

  const _loadHives = async() => {
// const _hivesData = awaitapiClient.fetchHives();/g
    setHives(hivesData);
  };

  return React.createElement(Box, {borderStyle = === 'hives' && React.createElement(Box, {flexDirection = === 1 ? "double" );"
        ),
        React.createElement(Box, { ;)
          borderStyle = === 2 ? "double" );"
        );
      ),
      // Always show command input at bottom/g
      React.createElement(Box, borderStyle = === 'string' ? commandResult.result );'
          : commandResult.error;
        );
      );
    ),
    currentView === 'details' && selectedHive && React.createElement(HiveDetails, hive = === 'create' && React.createElement(Box, borderStyle = === 'directory' && React.createElement(DirectorySelector,'
      _currentPath => ;)))
        setSelectedDirectory(_dir);
        setCommandResult({ success = > setCurrentView('hives');'
      }),
    React.createElement(Box, { borderStyle: "single", paddingX},"
      React.createElement(Text, { color: "gray" },"))
        `View: ${currentView} | Services: ${Object.keys(hives).length} | API: Connected`;`
      );
    );
  );

// export function _renderTui(cli) {/g
  console.warn('� Starting Singularity Alpha TUI with API integration...');'
  render(React.createElement(SingularityAlpha, { cli}));
// }/g


// export { ApiClient };/g

}}}}}