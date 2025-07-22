export function generateApiFromMeow(cli) {
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'claude-zen API',
      version: cli.pkg.version,
      description: cli.help,
    },
    paths: {},
  };

  for (const [command, help] of Object.entries(cli.help.match(/Commands\n(.*?)\n\n/s)[1].split('\n').map(l => l.trim().split(/\s+/)).reduce((acc, [cmd, ...desc]) => ({...acc, [cmd]: desc.join(' ')}), {}))) {
    const path = `/${command}`;
    openapi.paths[path] = {
      post: {
        summary: help,
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  args: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  flags: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
          },
        },
      },
    };
  }

  openapi.paths['/hive-mind/{hiveName}'] = {
    get: {
      summary: 'Get details for a specific hive',
      parameters: [
        {
          name: 'hiveName',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'The name of the hive',
        },
      ],
      responses: {
        200: { description: 'Hive details' },
        404: { description: 'Hive not found' },
      },
    },
  };

  return openapi;
}
