// compare webpack dev server with vite
// especially HMR + react-refresh behaviour
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const config = {
  mode: "development",
  entry: "./test-webpack/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    contentBase: "./dist",
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `<div id="app" />`,
    }),
    new ReactRefreshWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [
                "react-refresh/babel",
                "@babel/plugin-proposal-class-properties",
              ],
              presets: [
                "@babel/preset-react",
                "@babel/preset-typescript",
                "@babel/preset-env",
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", "jsx"],
  },
};

module.exports = config;
