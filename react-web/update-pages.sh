#!/bin/bash

# List of page files to update
files=(
  "src/pages/forgot-password.tsx"
  "src/pages/reset-password.tsx"
  "src/pages/oauth-callback.tsx"
  "src/pages/home.tsx"
  "src/pages/life.tsx"
  "src/pages/time.tsx"
  "src/pages/people.tsx"
  "src/pages/profile.tsx"
  "src/pages/search.tsx"
  "src/pages/component-demo.tsx"
  "src/pages/icon-demo.tsx"
  "src/pages/calendar-components-demo.tsx"
)

# Loop through each file
for file in "${files[@]}"; do
  # Get the component name from the file path
  component_name=$(basename "$file" .tsx)
  
  # Convert to PascalCase
  component_name=$(echo "$component_name" | sed -E 's/(^|-)([a-z])/\U\2/g')
  
  # Special case for component-demo
  if [ "$component_name" == "ComponentDemo" ]; then
    import_path="../components/ComponentDemo"
  else
    import_path="../pages/${component_name}Page"
  fi
  
  # Update the file
  cat > "$file" << EOF
import React from 'react';
import ${component_name}Page from '${import_path}';
import { NextPage } from 'next';

const ${component_name}: NextPage = () => {
  return <${component_name}Page />;
};

export default ${component_name};
EOF

  echo "Updated $file"
done

echo "All files updated successfully!"
