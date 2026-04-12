import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import { storageService } from '../src/services/StorageService';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);

describe('FileController API - File Deletion Integration', () => {
	const userName = 'deleteuser';
	const headers = { 'x-user-name': userName };
	const fileName = 'deletefile';

	beforeEach(() => {
		storageService.deleteAllUserFiles(userName);
	});

	it('should remove file from memory and disk when deleted', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const filePath = path.join(process.cwd(), 'data', userName, `${fileName}.json`);
		expect(fs.existsSync(filePath)).toBe(true);
		const res = await request(app)
			.delete(`/file/${fileName}`)
			.set(headers);
		expect(res.status).toBe(200);
		expect(fs.existsSync(filePath)).toBe(false);
		const listRes = await request(app)
			.get(`/file/list`)
			.set(headers);
		expect(listRes.body).not.toContain(fileName);
	});
});
