const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { DEV_SERVER_PORTS } = require("./webpack.constants");

module.exports = {
  entry: "./src/game.ts",
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    // Complete solution for Three.js deduplications
    alias: {
      three: path.resolve(__dirname, "node_modules/three"),
    },
  },
  output: {
    filename: "[name].bundle.js", // Use [name] placeholder to avoid conflicts
    path: path.resolve(__dirname, "dist"),
    clean: true, // Clean the output directory before emit
    publicPath: "./",
  },
  plugins: [
    // Generate index.html in the dist folder
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
      inject: "body", // Inject all javascript resources in body
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
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: DEV_SERVER_PORTS.DEFAULT,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  optimization: {
    // Ensure modules are shared properly
    moduleIds: "deterministic",
    // Specify which modules should be considered for splitting
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Bundle Three.js into a single file
        three: {
          test: /[\\/]node_modules[\\/]three[\\/]/,
          name: "three",
          chunks: "all",
          priority: 20,
        },
        // Bundle React into a separate chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          chunks: "all",
          priority: 15,
        },
        // Bundle other common vendors
        vendors: {
          test: /[\\/]node_modules[\\/](?!(three|react|react-dom)[\\/])/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
      },
    },
  },
};
