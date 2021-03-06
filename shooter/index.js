const Application = require("spectron").Application;
const path = require("path");
const Promise = require("bluebird");
const { promisify } = Promise;
const writeFile = promisify(require("fs").writeFile);
const plugins = require("../package.json").devDependencies;
const mkdirp = promisify(require("mkdirp"));

const OUTPUT_DIR = path.join(__dirname, "../dist");

const app = new Application({
  path: path.join(__dirname, "../hyper/node_modules/.bin/electron"),
  args: [path.join(__dirname, "../hyper/app")],
  env: {
    LOCAL_PLUGINS_PATH: "../node_modules"
  }
});

const setPlugin = async pluginName => {
  console.log("setPlugin");
  const config = {
    config: {},
    localPlugins: [pluginName]
  };
  const content = `module.exports = ${JSON.stringify(config)}`;
  await writeFile("../hyper/.hyper.js", content);
};

const screenshot = async pluginName => {
  await setPlugin(pluginName);
  console.log("Start app");
  await app.start();
  console.log(await app.client.getMainProcessLogs());
  const img = await app.browserWindow.capturePage();
  const outputFilePath = path.join(OUTPUT_DIR, `${pluginName}.png`);
  writeFile(outputFilePath, img);
  await app.stop();
};

const main = async () => {
  console.log("mkdir");
  await mkdirp(OUTPUT_DIR);
  for (let plugin in plugins) {
    console.log("Plugin", plugin);
    await screenshot(plugin);
  }
};

main();
