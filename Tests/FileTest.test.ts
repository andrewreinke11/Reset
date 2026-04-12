
import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import { storageService } from '../src/services/StorageService';
import fs from 'fs';
import path from 'path';
import userController from '../src/Controllers/UserController';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);
app.use('/api/users', userController);

const userName = 'testuser';
const headers = { 'x-user-name': userName };
const fileName = 'testfile';

beforeEach(() => {
	storageService.deleteAllUserFiles(userName);
});

describe('FileController API', () => {
	it('creates a new file', async () => {
		const res = await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		console.log(res.body);
		expect(res.status).toBe(201);
		expect(res.body.fileName).toBe(fileName);
		expect(res.body.model).toBeDefined();
	});

	it('adds a color to the palette', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 100, green: 150, blue: 200, alpha: 255 });
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
		expect(res.body.canUndo).toBeDefined();
		expect(res.body.canRedo).toBeDefined();
	});

	it('updates a palette color', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 100, green: 150, blue: 200, alpha: 255 });
		const res = await request(app)
			.put(`/file/${fileName}/palette/0`)
			.set(headers)
			.send({ red: 50, green: 50, blue: 50, alpha: 255 });
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
	});

	it('recolors a pixel', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 100, green: 150, blue: 200, alpha: 255 });
		const res = await request(app)
			.put(`/file/${fileName}/pixel`)
			.set(headers)
			.send({ x: 0, y: 0, colorIndex: 0 });
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
	});

	it('undoes and redoes', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 100, green: 150, blue: 200, alpha: 255 });
		await request(app)
			.put(`/file/${fileName}/pixel`)
			.set(headers)
			.send({ x: 0, y: 0, colorIndex: 0 });
		const undoRes = await request(app)
			.post(`/file/${fileName}/undo`)
			.set(headers)
			.send();
		expect(undoRes.status).toBe(200);
		expect(undoRes.body.model).toBeDefined();
		const redoRes = await request(app)
			.post(`/file/${fileName}/redo`)
			.set(headers)
			.send();
		expect(redoRes.status).toBe(200);
		expect(redoRes.body.model).toBeDefined();
	});

	it('gets file state', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.get(`/file/${fileName}`)
			.set(headers)
			.send();
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
	});

	it('deletes a file', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.delete(`/file/${fileName}`)
			.set(headers)
			.send();
		expect(res.status).toBe(200);
		expect(res.body.message).toContain('deleted');
	});

	it('lists all files for user', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.get('/file/')
			.set(headers)
			.send();
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.files)).toBe(true);
	});
});

describe('FileController API - Edge Cases & Error Handling', () => {
	const userName = 'testuser';
	const headers = { 'x-user-name': userName };
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

	it('should return 404 when updating a non-existent file', async () => {
		const res = await request(app)
			.put('/file/nonexistent/palette/0')
			.set(headers)
			.send({ red: 10, green: 10, blue: 10, alpha: 10 });
		expect(res.status).toBe(400);
	});

	it('should return 404 when deleting a non-existent file', async () => {
		const res = await request(app)
			.delete('/file/nonexistent')
			.set(headers);
		expect(res.status).toBe(400);
	});

	it('should return 400 for palette color with invalid values', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: -1, green: 300, blue: 256, alpha: -10 });
		expect(res.status).toBe(400);
	});

	it('should allow duplicate palette colors', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 10, green: 10, blue: 10, alpha: 10 });
		const res = await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 10, green: 10, blue: 10, alpha: 10 });
		expect(res.status).toBe(200);
	});
});

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

	it('should not redo when nothing to redo', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		const res = await request(app)
			.post(`/file/${fileName}/redo`)
			.set(headers);
		expect(res.status).toBe(200);
		expect(res.body.model).toBeDefined();
		expect(res.body.canRedo).toBe(false);
	});

	it('should handle multiple undos and redos in sequence', async () => {
		await request(app)
			.post('/file/create')
			.set(headers)
			.send({ fileName, width: 5, height: 5 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 10, green: 20, blue: 30, alpha: 255 });
		await request(app)
			.post(`/file/${fileName}/palette/add`)
			.set(headers)
			.send({ red: 40, green: 50, blue: 60, alpha: 255 });
		// Undo twice
		let res = await request(app)
			.post(`/file/${fileName}/undo`)
			.set(headers);
		expect(res.body.canUndo).toBe(true);
		res = await request(app)
			.post(`/file/${fileName}/undo`)
			.set(headers);
		expect(res.body.canUndo).toBe(false);
		// Redo twice
		res = await request(app)
			.post(`/file/${fileName}/redo`)
			.set(headers);
		expect(res.body.canRedo).toBe(true);
		res = await request(app)
			.post(`/file/${fileName}/redo`)
			.set(headers);
		expect(res.body.canRedo).toBe(false);
	});
});

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
		// Confirm file exists on disk
		const filePath = path.join(process.cwd(), 'data', userName, `${fileName}.json`);
		expect(fs.existsSync(filePath)).toBe(true);
		// Delete file
		const res = await request(app)
			.delete(`/file/${fileName}`)
			.set(headers);
		expect(res.status).toBe(200);
		// Confirm file is gone from disk
		expect(fs.existsSync(filePath)).toBe(false);
		// Confirm file is gone from API list
		const listRes = await request(app)
			.get(`/file/list`)
			.set(headers);
		expect(listRes.body).not.toContain(fileName);
	});
});

describe('FileController API - User File Array Consistency', () => {
	const userName = 'arrayuser';
	const headers = { 'x-user-name': userName };
	const fileName = 'arrayfile';
	const userApi = '/api/users';

	beforeEach(async () => {
		storageService.deleteAllUserFiles(userName);
		// Ensure user exists
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
			.get(`${userApi}/${userName}`);
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
			.get(`${userApi}/${userName}`);
		expect(res.body.files).not.toContain(fileName);
	});
});
