// webpack.config.js - Configuration for building the Chrome extension

import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import Dotenv from "dotenv-webpack";

// Get the directory name using ES modules approach
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path constants for improved readability
const PATHS = {
  src: path.resolve(__dirname, "src"),
  build: path.resolve(__dirname, "build"),
  nodeModules: path.resolve(__dirname, "node_modules"),
  public: path.resolve(__dirname, "public"),
};

/**
 * Webpack configuration
 * @type {import('webpack').Configuration}
 */
const config = {
  // Build configuration
  mode: "development",
  devtool: "inline-source-map",

  // Entry points for different parts of the extension
  entry: {
    background: `${PATHS.src}/background.js`,
    popup: `${PATHS.src}/popup.js`,
    content: `${PATHS.src}/content.js`,
  },

  // Output configuration
  output: {
    path: PATHS.build,
    filename: "[name].js",
    chunkLoading: false, // Prevents "Uncaught ReferenceError: document is not defined"
  },

  // Plugins
  plugins: [
    // Generate HTML files
    new HtmlWebpackPlugin({
      template: `${PATHS.src}/popup.html`,
      filename: "popup.html",
    }),

    // Copy static files
    new CopyPlugin({
      patterns: [
        {
          from: PATHS.public,
          to: ".", // Copies to build folder
        },
        {
          from: `${PATHS.src}/popup.css`,
          to: "popup.css",
        },
        {
          from: `${PATHS.src}/content.css`,
          to: "content.css",
        },
      ],
    }),

    // Load environment variables from .env file
    new Dotenv(),
  ],
};

export default config;
