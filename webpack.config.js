const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/index.ts',
    content: './src/content/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/types': path.resolve(__dirname, 'src/types')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true
        },
        {
          from: 'icons',
          to: 'icons'
        }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^https:\/\/apis\.google\.com\/js\/api\.js$/,
      'data:text/javascript,export default {}'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^https:\/\/www\.google\.com\/recaptcha\/api\.js$/,
      'data:text/javascript,export default {}'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^https:\/\/www\.google\.com\/recaptcha\/enterprise\.js$/,
      'data:text/javascript,export default {}'
    ),
    new webpack.BannerPlugin({
      banner: `
        // Prevent external script loading
        if (typeof window !== 'undefined') {
          const originalCreateElement = document.createElement;
          document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName.toLowerCase() === 'script') {
              const originalSetAttribute = element.setAttribute;
              element.setAttribute = function(name, value) {
                if (name === 'src' && (value.includes('apis.google.com') || value.includes('recaptcha'))) {
                  console.warn('External script loading blocked:', value);
                  return;
                }
                return originalSetAttribute.call(this, name, value);
              };
            }
            return element;
          };
        }
      `,
      raw: true
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 150000, // 150KB max per chunk
      cacheGroups: {
        firebase: {
          test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
          name: 'firebase',
          chunks: 'all',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 10,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 5,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 1,
        }
      }
    }
  },
  externals: {
    // Prevent external script loading
    'https://apis.google.com/js/api.js': 'undefined',
    'https://www.google.com/recaptcha/api.js': 'undefined',
    'https://www.google.com/recaptcha/enterprise.js': 'undefined'
  }
};

