const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { one: './src/problem-1/index.ts', two: './src/problem-2/index.ts' },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'one.html',
      template: path.join(__dirname, 'src', 'problem-1', 'index.html'),
      chunks: ['one'],
    }),
    new HtmlWebpackPlugin({
      filename: 'two.html',
      template: path.join(__dirname, 'src', 'problem-2', 'index.html'),
      chunks: ['two'],
    })
  ],
};
