const { withAppBuildGradle } = require('@expo/config-plugins');

const withBundleInDebug = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const contents = config.modResults.contents;
            if (contents.includes('project.ext.react = [')) {
                config.modResults.contents = contents.replace(
                    /project\.ext\.react = \[/,
                    `project.ext.react = [
    bundleInDebug: true,`
                );
            } else {
                // If not found, add it after the first apply plugin
                config.modResults.contents = contents.replace(
                    /apply plugin: "com\.android\.application"/,
                    `apply plugin: "com.android.application"

project.ext.react = [
    bundleInDebug: true
]`
                );
            }
        }
        return config;
    });
};

module.exports = withBundleInDebug;
