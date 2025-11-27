const { withAppBuildGradle } = require('@expo/config-plugins');

const withBundleInDebug = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const contents = config.modResults.contents;
            if (contents.includes('project.ext.react = [')) {
                console.log('withBundleInDebug: Found existing project.ext.react, updating...');
                config.modResults.contents = contents.replace(
                    /project\.ext\.react = \[/,
                    `project.ext.react = [
    bundleInDebug: true,`
                );
            } else {
                console.log('withBundleInDebug: project.ext.react not found, creating new block...');
                // Match 'apply plugin: "com.android.application"' or with single quotes
                const match = contents.match(/apply plugin: ["']com\.android\.application["']/);
                if (match) {
                    console.log(`withBundleInDebug: Found plugin application at index ${match.index}`);
                    config.modResults.contents = contents.replace(
                        /apply plugin: ["']com\.android\.application["']/,
                        `apply plugin: "com.android.application"

project.ext.react = [
    bundleInDebug: true
]`
                    );
                } else {
                    console.error('withBundleInDebug: CRITICAL - Could not find "apply plugin: com.android.application" to inject config!');
                }
            }
        }
        return config;
    });
};

module.exports = withBundleInDebug;
