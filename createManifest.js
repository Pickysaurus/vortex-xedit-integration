const fs = require('fs');

function createManifest() {
    const npmManifest = require('./package.json');
    const vortexManifest = {
        name: npmManifest.name,
        author: npmManifest.author,
        version: npmManifest.version,
        description: npmManifest.description
    }
    return fs.writeFileSync('./dist/info.json', JSON.stringify(vortexManifest, null, 2));
}

createManifest();