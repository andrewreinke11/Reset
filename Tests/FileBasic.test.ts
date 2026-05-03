import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import { storageService } from '../src/services/StorageService';
import fs from 'fs';
import path from 'path';
import { authHeadersFor } from './testAuth';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);

// Basic file API tests (creation, palette, pixel, undo/redo, etc.)
describe('FileController API', () => {
	const userName = 'testuser';
	const headers = authHeadersFor(userName);
	const fileName = 'testfile';

	beforeEach(() => {
		storageService.deleteAllUserFiles(userName);
	});

	it('creates a new file', async () => {
		const res = await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		expect(res.status).toBe(201);
		expect(res.body.fileName).toBe(fileName);
		expect(res.body.model).toBeDefined();
	});

	// ...other basic file API tests (add color, update palette, recolor pixel, undo/redo, etc.)
});
