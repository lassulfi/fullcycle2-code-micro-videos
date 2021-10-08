import { Upload } from "./types";

export function countInProgress(uploads: Upload[]) {
    return uploads.filter(upload => !isFinished(upload)).length;
}

export function isFinished(upload: Upload) {
    return upload.progress === 1;
}