/* Site-wide settings. Edit this file when the GitHub org/repo or the extension changes. */
window.FLAGFORGE = {
        siteName: "Flag Forge",

        launcher: {
                releasesPage: "https://github.com/tmvoid/flagforge-test/releases/tag/launcher-v0.1.0",
                downloads: {
                        linux: "https://github.com/tmvoid/flagforge-test/releases/download/launcher-v0.1.0/silentproxy-linux",
                        macos: "https://github.com/tmvoid/flagforge-test/releases/download/launcher-v0.1.0/silentproxy-macos",
                        windows: "https://github.com/tmvoid/flagforge-test/releases/download/launcher-v0.1.0/silentproxy-windows.exe"
                },
                fileNames: { linux: "silentproxy-linux", macos: "silentproxy-macos", windows: "silentproxy-windows.exe" }
        },

        extension: {
                firefox: "https://github.com/tmvoid/flagforge-test/releases/download/launcher-v0.1.0/silentproxy-firefox.xpi",
                chrome: "https://github.com/tmvoid/flagforge-test/releases/latest",
                /* Printed by silentproxy-extension/tools/make_key.py. Passed to `silentproxy install --chrome-id`. */
                chromeId: "enekoeifnnaobnefccfijkkdbnaleleg"
        }
};
