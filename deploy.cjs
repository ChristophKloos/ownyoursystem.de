const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const localRoot = path.join(__dirname, "dist");
const remoteRoot = "/httpdocs/";

const config = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: true,
    secureOptions: { rejectUnauthorized: false }
};

function runCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                reject(error);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
}

async function uploadFileWithRetry(client, localPath, remotePath, attempt = 1) {
    try {
        console.log(`Up: ${path.relative(localRoot, localPath)}`);
        await client.uploadFrom(localPath, remotePath);
    } catch (err) {
        console.error(`Error uploading ${path.basename(localPath)}: ${err.message}`);
        if (attempt < 5) {
            console.log("Reconnecting and retrying...");
            client.close();
            await client.access(config);
            await client.cd(path.dirname(remotePath)); 
            return uploadFileWithRetry(client, localPath, remotePath, attempt + 1);
        } else {
            throw err;
        }
    }
}

async function uploadDirectory(client, localDir, remoteDir) {
    const files = fs.readdirSync(localDir);

    try {
        await client.ensureDir(remoteDir);
    } catch (e) {
        // ignore
    }

    for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = remoteDir + file;
        const stat = fs.statSync(localPath);

        if (stat.isDirectory()) {
            await uploadDirectory(client, localPath, remotePath + "/");
        } else {
            await uploadFileWithRetry(client, localPath, remotePath);
        }
    }
}

async function run() {
    const client = new ftp.Client(5000); 
    client.ftp.verbose = false; 

    try {
        await runCommand("git pull");

        console.log("Connecting to FTP...");
        await client.access(config);
        
        console.log("Starting upload...");
        await uploadDirectory(client, localRoot, remoteRoot);
        
        console.log("Deployment finished.");
    } catch (err) {
        console.error("Deployment failed:", err);
        process.exit(1);
    } finally {
        client.close();
    }
}

run();