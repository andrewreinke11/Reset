import type { Model } from "./Model";
import type { ResetFile } from "./ResetFile";

export interface User{
    userName: string;
    email: string;
    files: ResetFile[];
    passwordHash: string;
}
export let users: User[] = [];