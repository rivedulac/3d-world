const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/game.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // Add alias to ensure Three.js is only loaded once
    alias: {
      three: path.resolve("./node_modules/three"),
    },
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Generate index.html in the dist folder
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
    }),
    // Copy other static assets
    new CopyWebpackPlugin({
      patterns: [{ from: "styles.css", to: "" }],
    }),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    hot: true,
  },
};
