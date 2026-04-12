import fs from "fs";
import path from "path";
import { storageService } from "../src/services/StorageService";
import type { Model } from "../src/models/Model";

const testUser = "__testuser__";
const testFile = "testfile";
const testModel: Model = {
	width: 2,
	height: 2,
	pixels: [
		[
			{ red: 1, green: 2, blue: 3, alpha: 4 },
			{ red: 5, green: 6, blue: 7, alpha: 8 },
		],
		[
			{ red: 9, green: 10, blue: 11, alpha: 12 },
			{ red: 13, green: 14, blue: 15, alpha: 16 },
		],
	],
	palette: [
		{ red: 1, green: 2, blue: 3, alpha: 4, pixels: [] },
		{ red: 5, green: 6, blue: 7, alpha: 8, pixels: [] },
	],
};

function cleanup() {
	// Remove test file and user dir if they exist
	const userDir = path.join(process.cwd(), "data", testUser);
	if (fs.existsSync(userDir)) {
		fs.rmSync(userDir, { recursive: true, force: true });
	}
}

beforeEach(() => {
	cleanup();
});

afterAll(() => {
	cleanup();
});

describe("StorageService", () => {
	it("saves and loads a model", () => {
		storageService.saveModel(testUser, testFile, testModel);
		const loaded = storageService.loadModel(testUser, testFile);
		expect(loaded).toEqual(testModel);
	});

	it("returns null for missing file", () => {
		const loaded = storageService.loadModel(testUser, "doesnotexist");
		expect(loaded).toBeNull();
	});

	it("checks file existence", () => {
		expect(storageService.userFileExists(testUser, testFile)).toBe(false);
		storageService.saveModel(testUser, testFile, testModel);
		expect(storageService.userFileExists(testUser, testFile)).toBe(true);
	});

	it("lists user files", () => {
		expect(storageService.listUserFiles(testUser)).toEqual([]);
		storageService.saveModel(testUser, testFile, testModel);
		expect(storageService.listUserFiles(testUser)).toContain(testFile);
	});

	it("deletes a user file", () => {
		storageService.saveModel(testUser, testFile, testModel);
		expect(storageService.userFileExists(testUser, testFile)).toBe(true);
		storageService.deleteUserFile(testUser, testFile);
		expect(storageService.userFileExists(testUser, testFile)).toBe(false);
	});

	it("deletes all user files", () => {
		storageService.saveModel(testUser, testFile, testModel);
		storageService.saveModel(testUser, "anotherfile", testModel);
		expect(storageService.listUserFiles(testUser).length).toBe(2);
		storageService.deleteAllUserFiles(testUser);
		expect(storageService.listUserFiles(testUser)).toEqual([]);
	});

	it("loads all user files as a map", () => {
		storageService.saveModel(testUser, testFile, testModel);
		storageService.saveModel(testUser, "anotherfile", testModel);
		const all = storageService.loadAllUserFiles(testUser);
		expect(all.size).toBe(2);
		expect(all.has(testFile)).toBe(true);
		expect(all.has("anotherfile")).toBe(true);
	});
});
