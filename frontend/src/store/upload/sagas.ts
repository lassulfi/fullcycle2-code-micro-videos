import { Types } from './index';
import { actionChannel, take } from 'redux-saga/effects';
import { AddUploadAction } from './types';

export function* uploadWatcherSaga() {
    const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);
    while (true) {
        const { payload }: AddUploadAction = yield take(newFilesChannel);
        console.log(payload);
    }
}