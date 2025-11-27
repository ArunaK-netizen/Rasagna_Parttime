const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join('mobile', 'android', 'app', 'build.gradle');

try {
    const content = fs.readFileSync(buildGradlePath, 'utf8');
    console.log('File length:', content.length);

    const reactBlock = content.match(/project\.ext\.react\s*=\s*\[([\s\S]*?)\]/);
    if (reactBlock) {
        console.log('Found project.ext.react block:');
        console.log(reactBlock[0]);
    } else {
        console.log('project.ext.react block NOT found.');
        // Print first 500 chars to see what's there
        console.log('First 500 chars:');
        console.log(content.substring(0, 500));
    }
} catch (err) {
    console.error('Error reading file:', err);
}
