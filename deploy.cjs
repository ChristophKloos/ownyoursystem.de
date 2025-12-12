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
    forcePasv: true
};

ftpDeploy.deploy(config)
    .then(res => console.log("FTP Upload erfolgreich beendet"))
    .catch(err => console.error(err));
