import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import { storageService } from '../src/services/StorageService';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);

describe('FileController API - Undo/Redo Functionality', () => {
	const userName = 'undouser';
	const headers = { 'x-user-name': userName };
	const fileName = 'undofile';

	beforeEach(() => {
		storageService.deleteAllUserFiles(userName);
	});

	it('should not undo when nothing to undo', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.post(`/file/${fileName}/undo`)
			.set(headers);
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
		expect(res.body.canUndo).toBe(false);
	});

	// ...other undo/redo tests
});
