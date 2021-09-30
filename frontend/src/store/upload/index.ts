import * as Typings from './types';
import { createActions, createReducer } from "reduxsauce";
import update from 'immutability-helper';

export const { Types, Creators } = createActions<{
    ADD_UPLOAD: string,
}, {
    addUpload(payload: Typings.AddUploadAction['payload']): Typings.AddUploadAction,
}> ({
   addUpload: ['payload'], 
});

export const INITIAL_STATE: Typings.State = {
    uploads: [],
};

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
    [Types.ADD_UPLOAD]: addUpload as any,
});

export default reducer;

function addUpload(state = INITIAL_STATE, action: Typings.AddUploadAction): Typings.State {
    if (!action.payload.files.length) {
        return state;
    }

    const index = findIndexUpload(state, action.payload.video.id);

    if (index !== -1 && state.uploads[index].progress < 1) {
        return state;
    }

    const uploads = index === -1 
        ? state.uploads
        : update(state.uploads, {
            $splice: [[index, 1]]
        }); 

    return {
        uploads: [
            ...uploads,
            {
                video: action.payload.video,
                progress: 0,
                files: action.payload.files.map(file => ({
                    fileField: file.fileField,
                    filename: file.file.name,
                    progress: 0
                })),
            }
        ]
    };
}

function findIndexUpload(state: Typings.State, id: string) {
    return state.uploads.findIndex(upload => upload.video.id === id);
}