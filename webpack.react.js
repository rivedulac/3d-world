const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = require("./webpack.config.js");
const { DEV_SERVER_PORTS } = require("./webpack.constants");

module.exports = {
  ...baseConfig,
  entry: "./src/core/engine/Game.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "react.[name].bundle.js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.react.html",
      filename: "index.html",
      inject: true,
    }),
    ...baseConfig.plugins.slice(1),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: DEV_SERVER_PORTS.REACT,
    hot: true,
  },
};
