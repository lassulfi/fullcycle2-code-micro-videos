import { AxiosError } from "axios";
import { AnyAction } from "redux";
import { Video } from "../../utils/models";

export interface FileUpload {
    fileField: string;
    filename: string;
    progress: number;
    error?: AxiosError;
}

export interface Upload {
    video: Video;
    progress: number;
    files: FileUpload[];
}

export interface State {
    uploads: Upload[];
}

export interface FileInfo {
    file: File;
    fileField: string;
}

export interface AddUploadAction extends AnyAction {
    payload: {
        video: Video;
        files: Array<FileInfo>;
    };
}

export interface RemoveUploadAction extends AnyAction {
    payload: {
        id: string
    };
}

export interface UpdateProgressAction extends AnyAction {
    payload: {
        video: Video;
        fileField: string;
        progress: number;
    };
}

export interface SetUploadErrorAction extends AnyAction {
    payload: {
        video: Video;
        fileField: string;
        error: AxiosError;
    }
}

export type Actions = AddUploadAction | RemoveUploadAction | UpdateProgressAction | SetUploadErrorAction;