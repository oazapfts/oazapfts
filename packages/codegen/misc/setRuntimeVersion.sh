#!/bin/bash

# Determine the current git branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Fetch the latest version for 'latest' tag
latest_version=$(npm view @oazapfts/runtime@latest version)

# Initialize variable for selected version
selected_version=$latest_version

# Check if the current branch is alpha or beta and fetch the respective version
if [[ "$current_branch" == "alpha" || "$current_branch" == "beta" ]]; then
    alpha_beta_version=$(npm view @oazapfts/runtime@$current_branch version)

    # Compare major versions
    latest_major=$(echo "$latest_version" | cut -d. -f1)
    alpha_beta_major=$(echo "$alpha_beta_version" | cut -d. -f1)

    if [ "$alpha_beta_major" -ge "$latest_major" ]; then
        selected_version=$alpha_beta_version
    fi
fi

# Determine version pinning strategy
if [[ "$selected_version" == *"-alpha"* || "$selected_version" == *"-beta"* ]]; then
    # Pin the version explicitly for alpha/beta
    new_version="$selected_version"
else
    # Use a caret range for stable versions, including the major and minor version
    major_minor=$(echo "$selected_version" | grep -o '^[0-9]\+\.[0-9]\+')
    new_version="^$major_minor"
fi

# Path to your package.json file
package_json_path="./packages/codegen/package.json"

# Replace the version in package.json
# Note: For GNU sed (common in Linux), you might need to remove the '' after -i
sed -i '' "s/\"@oazapfts\/runtime\": \"[^\"]*\"/\"@oazapfts\/runtime\": \"$new_version\"/" $package_json_path

echo "Updated @oazapfts/runtime version to $new_version in $package_json_path"
