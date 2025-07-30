module.exports = {
  presets: [

      '@babel

        targets: {
          node: '20' },
        modules } ] ], // eslint-disable-line
  plugins: ['@babel
  env: {
    test: {
      presets: [

          '@babel

            targets: {
              node: '20' },
            modules: 'auto' } ] ] } } };
