export default defineNitroConfig({
  srcDir: 'fake3p/server',
  routeRules: {
    'cors-3p-script.json': { cors: true },
  },
});
