/**
 * Universal Vision Dashboard - Works in TUI (Ink) and Web (React DOM)
 * Same component, automatically adapts rendering based on environment
 */
import React, { useEffect, useState } from 'react';
import { UniversalBox as Box, useUniversalInput } from '../adapters/render-adapter.js';
import { visionAPI } from '../shared/vision-api.js';

const UniversalVisionDashboard = () => {
  const [visions, setVisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Same logic for both TUI and Web
  useEffect(() => {
    const _loadVisions = async () => {
      try {
        const data = await visionAPI.fetchVisions();
        setVisions(data);
      } catch(_error) {
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Universal input handling (works in both TUI and Web)
  useUniversalInput((input, key) => {
    if(key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if(key.downArrow && selectedIndex < visions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if(input === 'r') {
      setLoading(true);
      visionAPI.fetchVisions().then(setVisions).finally(() => setLoading(false));
    }
  });

  if(loading) {
    return React.createElement(Box, {justifyContent = === 0) {
    return React.createElement(Box, {justifyContent = (status) => {
    switch(status) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';default = (priority) => {
    switch(priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';default = (phases) => {
    if (!phases?.length) return 0;
    const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
    return Math.round(totalProgress / phases.length);
  };

  return React.createElement(Box, { flexDirection => {

      return React.createElement(Box, {key = > p.status === 'in_progress')?.name || 
            vision.phases.find(p => p.status === 'pending')?.name ||
            'All phases complete'
          ),
          
          isWeb() && React.createElement("div", {style = > React.createElement("div", {key = == 'completed' ? '#00ff00' :
                  phase.status === 'in_progress' ? '#ffff00' : '#333'
              }
            }))
          )
        ),

        isWeb() && React.createElement(Box, marginTop = > console.warn('Generate roadmap for:', vision.id), "📋 Generate Roadmap"),
          React.createElement("button", style = > console.warn('Edit vision:', vision.id), "✏️ Edit")
        )
      );
    }),

    React.createElement(Box, { marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1 },
      React.createElement(Text, { color: "gray" },
        isTUI() && '💡 TUI: [↑↓] Navigate • [R] Refresh • [Enter] Details',
        isWeb() && '💡 Web: Click buttons • Keyboard shortcuts active'
      )
    )
  );

};

export default UniversalVisionDashboard;
