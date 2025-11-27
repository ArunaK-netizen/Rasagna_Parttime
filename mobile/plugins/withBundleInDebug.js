const { withAppBuildGradle } = require('@expo/config-plugins');

const withBundleInDebug = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = config.modResults.contents.replace(
                /project\.ext\.react = \[/,
                `project.ext.react = [
    bundleInDebug: true,`
            );
        }
        return config;
    });
};

module.exports = withBundleInDebug;
