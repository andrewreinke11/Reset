import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import { storageService } from '../src/services/StorageService';
import { authHeadersFor } from './testAuth';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);

describe('FileController API - Edge Cases & Error Handling', () => {
	const userName = 'testuser';
	const headers = authHeadersFor(userName);
	const fileName = 'testfile';

	beforeEach(() => {
		storageService.deleteAllUserFiles(userName);
	});

	it('should not create a file with invalid dimensions', async () => {
		const res = await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 0, height: 5 });
		expect(res.status).toBe(400);
	});

	it('should not create a file with missing fields', async () => {
		const res = await request(app)
			.post('/file/create')
			.set(headers)
			.send({ width: 5, height: 5 });
		expect(res.status).toBe(400);
	});

	// ...other edge case and error handling tests
});
