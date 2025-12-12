const FtpDeploy = require("ftp-deploy");
const path = require("path");
require("dotenv").config();

const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: path.join(__dirname, "dist"),
    remoteRoot: "/httpdocs/",
    include: ["*", "**/*"],
    deleteRemote: false,
    forcePasv: true,
    secure: true,
    secureOptions: {
        rejectUnauthorized: false
    }
};

ftpDeploy.on("uploading", (data) => {
    console.log("Upload: " + data.filename);
});

ftpDeploy.on("log", (data) => {
    console.log("Log: " + data);
});

ftpDeploy.deploy(config)
    .then(res => console.log("Finished"))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
