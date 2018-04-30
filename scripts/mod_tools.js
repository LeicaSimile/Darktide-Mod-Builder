
const pfs = require('./lib/pfs');
const path = require('./lib/path');
const config = require('./config');
const reg = require('./lib/reg');

let modTools = {
    validModName(modName) {
        return typeof modName == 'string' && !!modName && modName.match(/^[0-9a-zA-Z_\- %]+$/);
    },

    async getModId(modName) {
        let data = await pfs.readFile(path.combine(config.modsDir, modName, config.cfgFile), 'utf8');
        let modId = data.match(/^published_id *=? *(\d*)\D*$/m);
        modId = modId && modId[1];

        if (!modId) {
            throw (
                `Item ID not found in ${config.cfgFile} file.\n` +
                `You need to publish your mod to workshop before you can build/view it.\n` +
                `Alternatively you can specify the workshop item id with --id param.`
            );
        }

        return modId;
    },

    // Gets mod tools placement from Vermintide Mod Tools install location
    async getModToolsDir() {
        let sdkKey = '"HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App ' + config.toolsId + '"';
        let value = '"InstallLocation"';

        let toolsDir = config.fallbackToolsDir;
        let errorMsg = 'Vermintide mod SDK directory not found, using fallback.';
        let appPath = await reg.get(sdkKey, value).catch(err => {
            console.error(err);
        });

        if (appPath) {
            toolsDir = appPath;
        }
        else {
            console.error(errorMsg);
        }

        toolsDir = path.fix(toolsDir);
        if (!await pfs.accessible(path.combine(toolsDir, config.stingrayDir, config.stingrayExe))) {
            throw 'Mod tools not found. You need to install Vermintide Mod Tools from Steam client or specify valid fallback path.';
        }
        console.log(`Mod tools folder "${toolsDir}"`);
        return toolsDir;
    }
};

module.exports = modTools;
