const path = require("path");
const entryFile = path.resolve(__dirname, "client", "src", "index.js");
const outputDir = path.resolve(__dirname, "client", "dist");

const webpack = require("webpack");

module.exports = {
  entry: ["@babel/polyfill", entryFile],
  output: {
    publicPath: "/",
    filename: "bundle.js",
    path: outputDir,
    sourceMapFilename: "bundle.map.js"
  },
  devtool: "#source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 10000
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: "./client/dist",
    hot: true,
    proxy: {
      "/api": "http://localhost:3000",
      "/event": "http://localhost:3000",
      "/socket.io/*": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  }
};
