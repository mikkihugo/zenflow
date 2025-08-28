#!/bin/bash

echo "Fixing extensive syntax corruption in kanban module..."

# Find all TypeScript files in kanban directory
find src/kanban -name "*.ts" -type f | while read -r file; do
  echo "Fixing $file..."
  
  # Fix import statements - missing closing quotes
  sed -i "s/} from '[^']*;/&'/g" "$file"
  sed -i "s/'$/'/g" "$file"
  
  # Fix unterminated string literals - common patterns
  sed -i "s/';$/'/g" "$file"
  sed -i "s/\`';/'/g" "$file"
  sed -i "s/\`;/'/g" "$file"
  
  # Fix double semicolons
  sed -i 's/;;/;/g' "$file"
  
  # Fix catch blocks with extra semicolons
  sed -i 's/} catch (error) {;/} catch (error) {/g' "$file"
  
  # Fix if statements with extra semicolons
  sed -i 's/) {;/) {/g' "$file"
  
  # Fix template literal corruption
  sed -i 's/\${([^}]*)\`/\${\1}/g' "$file"
  sed -i 's/\$\([^{]\)/\${\1}/g' "$file"
  
  # Fix comment lines ending with semicolons
  sed -i 's/events;$/events/g' "$file"
  
  # Fix specific export patterns
  sed -i "s/export \* from '[^']*;/&'/g" "$file"
  
  echo "Fixed $file"
done

echo "Kanban module syntax fixes completed."