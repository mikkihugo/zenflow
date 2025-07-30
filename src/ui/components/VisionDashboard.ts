/**
 * Vision Dashboard Component - Works in both TUI and Web;
 */

import { Box } from 'ink';
import React, { useEffect, useState } from 'react';
import { visionAPI } from '../shared/vision-api.js';

const _VisionDashboard = (): unknown => {
  const [_visions, setVisions] = useState([]);
  const [loading, _setLoading] = useState(true);
  const [_selectedIndex, _setSelectedIndex] = useState(0);
;
  useEffect(() => {
    const __loadVisions = async () => {
      try {
        const _data = await visionAPI.fetchVisions();
        setVisions(data);
      } catch (/* _error */) {
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);
;
  if(loading) {
    return React.createElement(Box, {justifyContent = === 0) {
    return React.createElement(Box, {justifyContent = (): unknown => {
    switch(status) {
      case 'approved': return 'green';
    // case 'pending': return 'yellow'; // LINT: unreachable code removed
      case 'rejected': return 'red';default = (): unknown => {
    switch(priority) {
      case 'high': return '🔴';
    // case 'medium': return '🟡'; // LINT: unreachable code removed
      case 'low': return '🟢';default = (): unknown => {
    if (!phases?.length) return 0;
    // const _totalProgress = phases.reduce((sum, phase) => sum + (phase.progress  ?? 0), 0); // LINT: unreachable code removed
    return Math.round(totalProgress / phases.length);
    //   // LINT: unreachable code removed};
;
  return React.createElement(Box, { flexDirection => {
;
    // return React.createElement(Box, {key = > p.status === 'in_progress')?.name  ?? vision.phases.find(p => p.status === 'pending')?.name  ?? 'All phases complete'; // LINT: unreachable code removed
          );
        );
      );
    }),
;
    React.createElement(Box, marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1 ,;
      React.createElement(Text, color: "gray" ,;
        "💡 Use arrow keys to navigate • Press Enter to view details • Press R to refresh";
      );
    );
  );
};
;
export default VisionDashboard;
