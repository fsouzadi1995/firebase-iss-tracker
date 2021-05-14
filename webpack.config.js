const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.html',
  output: {
    filename: 'bundle.html',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
