// Test if WebHtmlGenerator can be imported and used
console.log('Testing WebHtmlGenerator...');

try {
  console.log('1. Importing WebConfig...');
  const { WebConfig } = await import('./src/interfaces/web/web-config');
  console.log('✅ WebConfig imported');

  console.log('2. Importing WebHtmlGenerator...');
  const { WebHtmlGenerator } = await import('./src/interfaces/web/web-html-generator');
  console.log('✅ WebHtmlGenerator imported');

  console.log('3. Creating config...');
  const config = {
    port: 3000,
    host: 'localhost',
    realTime: true,
    cors: true,
    theme: 'dark' as const
  };
  console.log('✅ Config created');

  console.log('4. Creating generator...');
  const generator = new WebHtmlGenerator(config);
  console.log('✅ Generator created');

  console.log('5. Generating HTML...');
  const html = generator.generateDashboardHtml();
  console.log('✅ HTML generated, length:', html.length);

  console.log('🎉 All tests passed!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}