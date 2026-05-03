
import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import userController from '../src/Controllers/UserController';
import { storageService } from '../src/services/StorageService';
import { authHeadersFor } from './testAuth';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);
app.use('/api/users', userController);

describe('FileController API - User File Array Consistency', () => {
	const userName = 'arrayuser';
	const headers = authHeadersFor(userName);
	const fileName = 'arrayfile';
	const userApi = '/api/users';

	beforeEach(async () => {
		storageService.deleteAllUserFiles(userName);
		await request(app)
			.post(userApi)
			.send({ userName, email: 'array@example.com', password: 'arraypass' });
	});

	it('should add file to user files array on creation', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.get(`${userApi}/${userName}`)
			.set(headers);
		expect(res.body.files).toContain(fileName);
	});

	it('should remove file from user files array on deletion', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.delete(`/file/${fileName}`)
			.set(headers);
		const res = await request(app)
			.get(`${userApi}/${userName}`)
			.set(headers);
		expect(res.body.files).not.toContain(fileName);
	});
});
