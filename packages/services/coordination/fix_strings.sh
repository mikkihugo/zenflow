#!/bin/bash

# Fix SQL query terminations
find src -name "*.ts" -exec sed -i "s/', \[state\]');/', [state]);/g" {} \;
find src -name "*.ts" -exec sed -i "s/', \[state, state\]');/', [state, state]);/g" {} \;
find src -name "*.ts" -exec sed -i "s/', \['%\"success\":true%', 'spillover_executed', fromStatePattern\]');/', ['%\"success\":true%', 'spillover_executed', fromStatePattern]);/g" {} \;
find src -name "*.ts" -exec sed -i "s/', \['bottleneck_resolved', statePattern\]');/', ['bottleneck_resolved', statePattern]);/g" {} \;
find src -name "*.ts" -exec sed -i "s/', \['system_state_persisted'\]');/', ['system_state_persisted']);/g" {} \;

# Fix logger calls with extra quote
find src -name "*.ts" -exec sed -i "s/error });'/error });/g" {} \;
find src -name "*.ts" -exec sed -i "s/', error });'/', error });/g" {} \;

echo "String literal fixes applied"