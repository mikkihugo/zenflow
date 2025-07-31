
/** Ink Tui Module
/** Converted from JavaScript to TypeScript

import path from 'node:path';'
import { Box, render, Text  } from 'ink';'
import React, { useEffect, useState  } from 'react';'

// API client for auto-generated API
class ApiClient {
  constructor(baseUrl = 'http = baseUrl;';
// }
async;
fetchHives();
// {
  try {
// const _response = awaitfetch(`${this.baseUrl}/api/hives`);`
    // return // // await response.json();
    //   // LINT: unreachable code removed} catch(/* _error */) {
    console.error('Failed to fetchhives = // // await fetch(`${this.baseUrl}/hive-mind/${hiveName}`);`'`
    // return // // await response.json();
    //   // LINT: unreachable code removed}
  catch(error) ;
      console.error(`Failed to fetch hive details;`;
  for ${hiveName})
  );
  // return null;
// }

async;
executeCommand(command, (args = []), (flags = {}));

    try {
// const __response = awaitfetch(`${this.baseUrl}/${command}`, {method = new ApiClient();`

const __SingularityAlpha = () => {
  const [_hives, setHives] = useState({  });
  const [_selectedHive, setSelectedHive] = useState(null);
  const [currentView, setCurrentView] = useState('hives'); // 'hives', 'details', 'command', 'create', 'directory''
  const [_selectedHiveName, setSelectedHiveName] = useState(null);
  const [_commandResult, setCommandResult] = useState(null);
  const [command, setCommand] = useState('');';
  const [_isExecuting, setIsExecuting] = useState(false);
  const [_commandHistory, setCommandHistory] = useState([]);
  const [_selectedDirectory, _setSelectedDirectory] = useState(process.cwd());
  const [newServiceName, setNewServiceName] = useState('');';
  const [focusedButton, setFocusedButton] = useState(0); //0 = useApp();

  useEffect(() => {
    async function loadHives() {
// const _hivesData = awaitapiClient.fetchHives();
      setHives(hivesData);
    //     }
    loadHives();
;
    // Auto-refresh every 30 seconds
    const _interval = setInterval(loadHives, 30000);
    // return() => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);

  useInput(async(input, key) => {
    // Handle create view input
  if(currentView === 'create') {'
  if(key.escape) {
        setCurrentView('hives');';
        setNewServiceName('');';
      } else if(key.return && newServiceName.trim()) {
        // Create the service
// const __result = awaitapiClient.executeCommand('create', [newServiceName], {path = > prev.slice(0, -1));'
    //   // LINT: unreachable code removed} else if(!key.ctrl && !key.meta && input) {
        setNewServiceName(prev => prev + input);
      //       }
      return;
    //   // LINT: unreachable code removed}

    // Handle button navigation with Tab
  if(key.tab && currentView === 'hives') {'
      setFocusedButton(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
      return;
    //   // LINT: unreachable code removed}

    // Handle button activation with Enter
  if(key.return && focusedButton > 0 && !command) {
  if(focusedButton === 1) {
        // Select directory
        setCurrentView('directory');';
    //   // LINT: unreachable code removed} else if(focusedButton === 2) {
        // Create new service
        setCurrentView('create');';
      //       }
      return;
    //   // LINT: unreachable code removed}

    // Always capture command input regardless of view
    if(key.return && command.trim()) {
      setIsExecuting(true);
    // ; // LINT: unreachable code removed
      const _parts = command.trim().split(' ');';
      const _cmd = parts[0];
      const _args = parts.slice(1);
// const _result = awaitapiClient.executeCommand(cmd, args, {});
      setCommandResult(result);
      setCommandHistory(prev => [...prev, { command, result }]);
      setIsExecuting(false);
      setCommand('');';
    } else if(key.backspace ?? key.delete) {
      setCommand(prev => prev.slice(0, -1));
    } else if(key.escape) {
  if(currentView === 'details') {'
        setCurrentView('hives');';
        setSelectedHive(null);
        setSelectedHiveName(null);
      } else if(command) {
        setCommand('');';
        setCommandResult(null);
      } else {
        exit();
      //       }
    } else if(input === 'q' && !command) {'
      exit();
    } else if(input === 'r' && !command) {'
      // Refresh data
      loadHives();
    } else if(!key.ctrl && !key.meta && input && currentView !== 'details') {'
      setCommand(prev => prev + input);
    //     }
  });

    setCurrentView('details');';
// const _hiveDetails = awaitapiClient.fetchHiveDetails(hiveName);
    setSelectedHive(hiveDetails);
  };

    setCommandResult(result);
  };

  const _loadHives = async() => {
// const _hivesData = awaitapiClient.fetchHives();
    setHives(hivesData);
  };

  return React.createElement(Box, {borderStyle = === 'hives' && React.createElement(Box, {flexDirection = === 1 ? "double" );"
        ),
        React.createElement(Box, { ;)
          borderStyle = === 2 ? "double" );";
        );
      ),
      // Always show command input at bottom
      React.createElement(Box, borderStyle = === 'string' ? commandResult.result );';
          : commandResult.error;
        );
      );
    ),
    currentView === 'details' && selectedHive && React.createElement(HiveDetails, hive = === 'create' && React.createElement(Box, borderStyle = === 'directory' && React.createElement(DirectorySelector,';
      _currentPath => ;)));
        setSelectedDirectory(_dir);
        setCommandResult({ success = > setCurrentView('hives');'
      }),
    React.createElement(Box, { borderStyle: "single", paddingX},"
      React.createElement(Text, { color: "gray" },"))
        `View: ${currentView} | Services: ${Object.keys(hives).length} | API: Connected`;`
      );
    );
  );

// export function _renderTui(cli) {
  console.warn(' Starting Singularity Alpha TUI with API integration...');';
  render(React.createElement(SingularityAlpha, { cli}));
// }

// export { ApiClient };

}}}}}

*/*/