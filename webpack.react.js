const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = require("./webpack.config.js");

module.exports = {
  ...baseConfig,
  entry: "./src/scripts/game.tsx",
  output: {
    ...baseConfig.output,
    filename: "react.[name].bundle.js",
  },
  plugins: [
    // Generate index.html in the dist folder
    new HtmlWebpackPlugin({
      template: "./index.react.html",
      filename: "index.react.html",
      inject: "body",
      scriptLoading: "defer",
    }),
    // Keep the CopyWebpackPlugin from the base config
    ...baseConfig.plugins.slice(1),
  ],
  devServer: {
    ...baseConfig.devServer,
    port: 9001, // Use a different port for the React version
  },
};
