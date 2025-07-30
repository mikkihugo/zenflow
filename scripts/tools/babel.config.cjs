module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '20' },
        modules } ] ], // eslint-disable-line
  plugins: ['@babel/plugin-syntax-import-attributes'],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '20' },
            modules: 'auto' } ] ] } } };
