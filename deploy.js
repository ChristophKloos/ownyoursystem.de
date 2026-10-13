import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import ftp from 'basic-ftp';
import 'dotenv/config';

const { Client } = ftp;

const localRoot = path.join(import.meta.dirname, 'build');
const remoteRoot = '/httpdocs/';

const config = {
	host: process.env.FTP_HOST,
	user: process.env.FTP_USER,
	password: process.env.FTP_PASSWORD,
	secure: true,
	secureOptions: { rejectUnauthorized: false }
};

function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

async function uploadFileWithRetry(client, localPath, remotePath, attempt = 1) {
	try {
		await client.uploadFrom(localPath, remotePath);
	} catch (err) {
		if (attempt < 5) {
			client.close();
			await client.access(config);
			await client.cd(path.dirname(remotePath));
			return uploadFileWithRetry(client, localPath, remotePath, attempt + 1);
		}
		throw err;
	}
}

async function uploadDirectory(client, localDir, remoteDir) {
	const files = fs.readdirSync(localDir);

	try {
		await client.ensureDir(remoteDir);
	} catch {
		// The remote directory may already exist — nothing to do.
	}

	for (const file of files) {
		const localPath = path.join(localDir, file);
		const remotePath = remoteDir + file;
		const stat = fs.statSync(localPath);

		if (stat.isDirectory()) {
			await uploadDirectory(client, localPath, remotePath + '/');
		} else {
			await uploadFileWithRetry(client, localPath, remotePath);
		}
	}
}

async function run() {
	const client = new Client(5000);
	client.ftp.verbose = false;

	try {
		await runCommand('npm run build');
		await client.access(config);
		await client.cd(remoteRoot);
		await client.clearWorkingDir();
		await uploadDirectory(client, localRoot, remoteRoot);
	} catch {
		process.exit(1);
	} finally {
		client.close();
	}
}

run();
