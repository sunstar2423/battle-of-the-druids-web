#!/usr/bin/env python3
"""
Script to add MIT license headers to JavaScript files
"""

import os
import glob

LICENSE_HEADER = '''/*
 * Battle of the Druids - Web Edition
 * {filename}
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

'''

def add_license_header(file_path):
    """Add license header to a JavaScript file if it doesn't already exist"""
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if license header already exists
    if 'Copyright (c) 2025 TitanBlade Games' in content:
        print(f"✓ {file_path} already has license header")
        return
    
    # Get relative filename for header
    filename = os.path.basename(file_path)
    
    # Remove any existing simple comments at the start
    lines = content.split('\n')
    start_idx = 0
    
    # Skip initial comments that aren't license headers
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('//') and 'Copyright' not in line:
            start_idx = i + 1
        elif stripped == '':
            if start_idx == i:  # Empty line right after comments
                start_idx = i + 1
        else:
            break
    
    # Reconstruct content without old simple comments
    remaining_content = '\n'.join(lines[start_idx:])
    
    # Add license header
    header = LICENSE_HEADER.format(filename=filename)
    new_content = header + remaining_content
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added license header to {file_path}")

def main():
    """Add license headers to all JavaScript files in the project"""
    
    # Battle of the Druids JS files
    js_files = glob.glob('battle-of-the-druids/js/**/*.js', recursive=True)
    
    # Isle of Adventure JS files  
    js_files.extend(glob.glob('isle-of-adventure/js/**/*.js', recursive=True))
    
    print(f"Found {len(js_files)} JavaScript files")
    
    for js_file in js_files:
        add_license_header(js_file)
    
    print(f"\n✅ License headers added to {len(js_files)} JavaScript files")

if __name__ == '__main__':
    main()