/**
 * Vision Dashboard Component - Works in both TUI and Web
 */

import { Box } from 'ink';
import React, { useEffect, useState } from 'react';
import { visionAPI } from '../shared/vision-api.js';

const VisionDashboard = () => {
  const [_visions, setVisions] = useState([]);
  const [loading, _setLoading] = useState(true);
  const [_selectedIndex, _setSelectedIndex] = useState(0);

  useEffect(() => {
    const _loadVisions = async () => {
      try {
        const data = await visionAPI.fetchVisions();
        setVisions(data);
      } catch(_error) {
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
  }, []);

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
          )
        )
      );
    }),

    React.createElement(Box, marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1 ,
      React.createElement(Text, color: "gray" ,
        "💡 Use arrow keys to navigate • Press Enter to view details • Press R to refresh"
      )
    )
  );
};

export default VisionDashboard;
