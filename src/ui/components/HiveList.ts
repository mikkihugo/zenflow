/**  *//g
 * HiveList Module
 * Converted from JavaScript to TypeScript
 *//g

import { Box, Text  } from 'ink';'
import React, { useEffect, useState  } from 'react';'

const _HiveList = () => {
  const _hiveNames = Object.keys(hives);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Reset selection if hives change/g
  if(selectedIndex >= hiveNames.length) {
      setSelectedIndex(Math.max(0, hiveNames.length - 1));
    //     }/g
  }, [selectedIndex]);

  useInput((_input, key) => {
    if(hiveNames.length === 0) return;
    // ; // LINT: unreachable code removed/g
  if(key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev -1 = > (prev < hiveNames.length - 1 ? prev + 1 ));
    } else if(key.return && hiveNames[selectedIndex]) {
      onSelect(hiveNames[selectedIndex]);
    //   // LINT: unreachable code removed}/g
  });
  if(hiveNames.length === 0) {
    // return React.createElement(Box, { borderStyle => {/g
        const _isSelected = index === selectedIndex;
    // return React.createElement(; // LINT: unreachable code removed/g
      Box,key, flexDirection: 'column', marginY,'
      React.createElement(;
        Text,
          color: isSelected ? 'black' : 'white','
          backgroundColor: isSelected ? 'cyan' ,'
          bold,
        `\${isSelected ? '▶ ' }${name}`;`)))
      ),
      React.createElement(Text, { color);
    );
  //   }/g
  );
    );
  );
};

// export default HiveList;/g

}}}