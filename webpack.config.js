const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mode: 'development',
  entry: {
    frontoffice: './src/frontoffice/index.tsx',
    backoffice: './src/backoffice/index.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel')].filter(Boolean),
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/frontoffice.html',
      filename: 'frontoffice.html',
      chunks: ['frontoffice'],
    }),
    new HtmlWebpackPlugin({
      template: './src/backoffice.html',
      filename: 'backoffice.html',
      chunks: ['backoffice'],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/admin_assets', to: 'admin_assets' }],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    process.env.NODE_ENV === 'development' && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    headers: {
      'Cache-Control': 'no-cache',
    },
    compress: true,
    port: 9000,
    open: true,
    hot: true,
    watchFiles: ['src/**/*', 'src/**/*.tsx'],
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin/, to: '/backoffice.html' },
        { from: /./, to: '/frontoffice.html' },
      ],
    },
  },
};
