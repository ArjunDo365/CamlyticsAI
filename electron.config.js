const path = require('path');

module.exports = {
  appId: 'com.yourcompany.Camlytics-ai',
  productName: 'Camlytx Ai',

  directories: {
    output: 'dist-app',
    buildResources: 'assets' // icons & extra resources
  },

  files: [
  {
    from: "dist",
    to: "dist",
    filter: ["**/*"]
  },
  {
    from: "electron",
    to: "electron",
    filter: ["**/*"]
  },
  "package.json",
  "!node_modules/*/{test,__tests__}/**"
],

  extraResources: [
     {
    from: "./.env",
    to: ".env"
  }
  ],

  asar: true,

  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg'],
    defaultArch: 'universal'
  },

  win: {
    target: ['nsis'],
    defaultArch: 'x64'
  },

  linux: {
    target: ['AppImage'],
    defaultArch: 'x64',
    category: 'Utility'
  },

  // Icons must exist: icon.ico (win), icon.icns (mac), icon.png (linux)
  icon: path.join(__dirname, 'assets', 'icon.png'),


  publish: [],

  extraMetadata: {
    description: 'A desktop application for extracting text from PDF files using OCR',
    author: 'Your Name <youremail@example.com>'
  },

  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: true
  }
};
