import { Types } from './index';
import { actionChannel, take, call } from 'redux-saga/effects';
import { AddUploadAction, FileInfo, FileUpload } from './types';
import { Video } from '../../utils/models';
import videoHttp from '../../utils/http/video-http';

export function* uploadWatcherSaga() {
    const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);
    while (true) {
        const { payload }: AddUploadAction = yield take(newFilesChannel);
        for (const fileInfo of payload.files) {
            yield call(uploadFile, {video: payload.video, fileInfo})
        }
        console.log(payload);
    }
}

function* uploadFile({video, fileInfo}: {video: Video, fileInfo: FileInfo}) {
    yield call(sendUpload, {id: video.id, fileInfo});
}

function* sendUpload({id, fileInfo}: {id: string, fileInfo: FileInfo}) {
    videoHttp.partialUpdate(id, {
        _method: 'PATCH',
        [fileInfo.fileField]: fileInfo.file
    }, {
        http: {
            usePost: true,
        },
        config: {
            onUploadProgress(progressEvent) {
                console.log(progressEvent);
            }
        }
    });
}