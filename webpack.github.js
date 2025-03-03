const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const baseConfig = require("./webpack.config.js");

// Extend the base webpack config with GitHub Pages specific settings
module.exports = {
  ...baseConfig,
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "./", // Ensure relative paths for GitHub Pages
  },
  plugins: [
    // Generate index.html with corrected paths
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
      inject: "body",
      scriptLoading: "defer",
    }),
    // Copy other static assets
    new CopyWebpackPlugin({
      patterns: [
        { from: "styles.css", to: "" },
        { from: "src/favicon.ico", to: "" },
        { from: ".nojekyll", to: "" },
        { from: "assets", to: "assets" },
      ],
    }),
    ...(baseConfig.plugins || []).filter(
      (plugin) =>
        !(plugin instanceof HtmlWebpackPlugin) &&
        !(plugin instanceof CopyWebpackPlugin)
    ),
  ],
};
