import * as os from "os";
import fs from "fs";

function htmlEncode(value){
    return value.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'\\n');
}

export function stringEscape(s) {
    return s ? s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/[\x00-\x1F\x80-\x9F]/g,hex) : s;
    function hex(c) { var v = '0'+c.charCodeAt(0).toString(16); return '\\x'+v.substr(v.length-2); }
}

function isFileExists(installedPath) {
    try {
        fs.accessSync(installedPath, fs.constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

export default function writeJsonFile(items){
    fs.writeFileSync(`../micronicfilter/urls.json`, JSON.stringify(items), (err) => {
        console.log(items)
        console.log(items.length)
        if (err) throw err;
    })
}
function getChromeProfilePath() {
    const homePath = os.homedir();
    switch (os.platform()) {
        case 'win32': // Windows
            return `${homePath}\\AppData\\Local\\Google\\Chrome\\User Data\\Default`;
        case 'darwin': // macOS
            return `${homePath}/Library/Application Support/Google/Chrome/Default`;
        case 'linux': // Linux
            return `${homePath}/.config/google-chrome/Default`;
        default:
            throw new Error('Unsupported platform');
    }
}
//https://github.com/18520339/puppeteer-ecommerce-scraper/blob/main/src/helpers.js
