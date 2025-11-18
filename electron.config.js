const path = require("path");

module.exports = {
  appId: "com.do365.camlytx.ai",
  productName: "Camlytx AI",

  directories: {
    output: "dist-app",
    buildResources: "assets",
  },

  files: [
    {
      from: "dist",
      to: "dist",
      filter: ["**/*"],
    },
    {
      from: "electron",
      to: "electron",
      filter: ["**/*"],
    },
    "package.json",
    "!node_modules/*/{test,__tests__}/**",
  ],

  extraResources: [
    {
      from: "./.env",
      to: ".env",
    },
  ],

  asar: true,

  mac: {
    category: "public.app-category.utilities",
    target: ["dmg"],
    hardenedRuntime: false,
    icon: path.join(__dirname, "assets", "icon.icns"),
  },

  win: {
    target: ["nsis"],
    icon: path.join(__dirname, "assets", "icon.ico"),
    artifactName: "CamlytxAI_Setup_${version}.exe",
  },

  linux: {
    target: ["deb", "AppImage"],
    category: "Utility",
    icon: path.join(__dirname, "assets", "icons"),
  },

  publish: [],

  extraMetadata: {
    description: "A desktop app for video analytics",
    author: {
      name: "Do365 Technologies Private Limited",
      email: "support@do365tech.com",
    },
  },

  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
};
