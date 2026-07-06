const { mkdtemp } = require("fs/promises");
const { tmpdir } = require("os");
const { join } = require("path");
const { spawn } = require("child_process");

async function main() {
    const [, , url, mode = "desktop"] = process.argv;

    if (!url) {
        console.log(`
Usage:
  node chrome.js <url> [desktop|mobile]

Examples:
  node chrome.js https://example.com
  node chrome.js https://example.com mobile
`);
        process.exit(1);
    }

    const profile = await mkdtemp(join(tmpdir(), "chrome-profile-"));

    const args = [
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-sync",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-features=Translate",
        "--new-window",
        `--app=${url}`,
    ];

    if (mode === "mobile") {
        args.push(
            // "--window-size=390,844",
            // "--force-device-scale-factor=2.75",
            "--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0 Mobile Safari/537.36"
        );
    } else {
        args.push("--window-size=1440,900");
    }

    const chrome = spawn("google-chrome-stable", args, {
        stdio: "ignore",
        detached: true,
    });

    chrome.unref();

    console.log(`Launched Chrome (PID ${chrome.pid})`);
    console.log(`Temporary profile: ${profile}`);
}

main().catch(console.error);