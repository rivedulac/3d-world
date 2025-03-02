const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/game.ts",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  devtool: "inline-source-map",

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./"),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
  },
  // Plugins
  plugins: [
    // Automatically generate an HTML file with webpack bundles
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: "body",
    }),
  ],

  mode: "development",
};
