# Node Version Switcher

A Visual Studio Code extension that allows you to quickly switch Node.js versions directly from within VSCode.

## Features

✅ Show current Node version in the status bar  
✅ Dropdown menu to easily switch between installed versions  
✅ Add new Node versions from VS Code  
✅ Supports **macOS**, **Linux**, and **Windows (nvm-windows)** 

## Installation

### From Marketplace

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Node Version Switcher"
4. Click Install

### Install locally using `.vsix`

```bash
code --install-extension node-version-switcher-1.0.0.vsix
```

## Usage

1. Click Node version from status bar
2. Select your desired Node.js version from the list
3. The extension will switch to the selected version

  Or

1. Open Command Palette (Ctrl+Shift+P)
2. Type "Node: Select Node Version"
3. Select your desired Node.js version from the list
4. The extension will switch to the selected version

## Requirements

- Visual Studio Code 1.80.0 or higher

## Commands

| Command | Description |
|---------|-------------|
| `Node: Select Node Version` | Opens a quick pick menu to select and switch Node.js versions |

## Configuration

Currently, no additional configuration is required. The extension automatically detects available Node.js versions from your system.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development

### Prerequisites

- Node.js (version 16 or higher)
- Visual Studio Code
- Git

### Setup Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/Subhendu1990/vs-code-node-version-switcher-extension.git
   cd vs-code-node-version-switcher-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

#### Running the Extension in Development Mode

1. Open the project in VS Code:
   ```bash
   code .
   ```

2. Compile the project:
    ```bash
    npm run compile
    ```
    or
    Run in watch mode:
    ```bash
    npm run watch
    ```

2. Press `F5` or go to `Run and Debug` panel and click `Run Extension`
   - This will open a new Extension Development Host window
   - The extension will be loaded and ready for testing

#### Packaging the Extension

1. Install vsce (Visual Studio Code Extension manager):
   ```bash
   npm install -g vsce
   ```

2. Package the extension:
   ```bash
   vsce package
   ```
   This creates a `.vsix` file that can be installed locally.

#### Publishing Locally

1. **Install from .vsix file:**
   ```bash
   code --install-extension node-version-switcher-1.0.0.vsix
   ```

2. **Install using VS Code UI:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click the "..." menu → "Install from VSIX..."
   - Select your `.vsix` file

3. **Uninstall for testing:**
   ```bash
   code --uninstall-extension your-publisher.node-version-switcher
   ```

#### Testing

```bash
npm test
```

#### Linting

```bash
npm run lint
```

## Repository

[GitHub Repository](https://github.com/Subhendu1990/vs-code-node-version-switcher-extension)

## License

ISC

## Author

Subhendu Patra

---

**Enjoy switching Node.js versions effortlessly!**
