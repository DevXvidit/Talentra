module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv'],
    '@babel/plugin-transform-export-namespace-from'
  ],
};
