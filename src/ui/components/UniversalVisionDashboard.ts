
/** Universal Vision Dashboard - Works in TUI(Ink) and Web(React DOM)
/** Same component, automatically adapts rendering based on environment

import React, { useEffect, useState  } from 'react';'
import { UniversalBox as Box  } from '../adapters/render-adapter.js';
import { visionAPI  } from '../shared/vision-api.js';

const _UniversalVisionDashboard = () => { // eslint-disable-line
  const [visions, setVisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Same logic for both TUI and Web
  useEffect(() => {
    const __loadVisions = async() => {
      try {
// const _data = awaitvisionAPI.fetchVisions();
        setVisions(data);
      } catch(/* _error */) {
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);'
    // return() => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);

  // Universal input handling(works in both TUI and Web)
  useUniversalInput((input, key) => {
  if(key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if(key.downArrow && selectedIndex < visions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if(input === 'r') {'
      setLoading(true);
      visionAPI.fetchVisions().then(setVisions).finally(() => setLoading(false));
    //     }
  });
  if(loading) {
    return React.createElement(Box, {justifyContent = === 0) {
    // return React.createElement(Box, {justifyContent = () => {
  switch(status) {
      case 'approved': return 'green';'
    // case 'pending': return 'yellow'; // LINT: unreachable code removed'
      case 'rejected': return 'red';default = () => {'
  switch(priority) {
      case 'high': return '';'
    // case 'medium': return ''; // LINT: unreachable code removed'
      case 'low': return '';default = () => {'
    if(!phases?.length) return 0;
    // const _totalProgress = phases.reduce((sum, phase) => sum + (phase.progress  ?? 0), 0); // LINT: unreachable code removed
    return Math.round(totalProgress / phases.length);
    //   // LINT: unreachable code removed};

  return React.createElement(Box, { flexDirection => {

    // return React.createElement(Box, {key = > p.status === 'in_progress')?.name  ?? vision.phases.find(p => p.status === 'pending')?.name  ?? 'All phases complete'; // LINT: unreachable code removed'
          ),
          isWeb() && React.createElement("div", {style = > React.createElement("div", {key = === 'completed' ? '#00ff00' :'
                  phase.status === 'in_progress' ? '#ffff00' : '#333';'
              //               }/g))
            }));
          );
        ),
        isWeb() && React.createElement(Box, marginTop = > console.warn('Generate roadmap for:', vision.id), " Generate Roadmap"),"
          React.createElement("button", style = > console.warn('Edit vision:', vision.id), " Edit");"
        );
      );
    }),
    React.createElement(Box, { marginTop, borderStyle: "single", borderColor: "gray", paddingX},"
      React.createElement(Text, { color: "gray" },"))
        isTUI() && ' TUI: [] Navigate  [R] Refresh  [Enter] Details','
        isWeb() && ' Web: Click buttons  Keyboard shortcuts active';'
      );
    );
  );

};

// export default UniversalVisionDashboard;

}}}}}}}}}}}}
