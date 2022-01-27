// @flow 
import { CircularProgress, Fade, makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import React from 'react';
import { hasError } from '../store/upload/getters';
import { FileUpload, Upload } from '../store/upload/types';

const useStyles = makeStyles({
    progressContainer: {
        position: 'relative',
    },
    progressBackground: {
        color: grey[300],
    },
    progress: {
        position: 'absolute',
        left: 0,
    },
});

type UploadProgressProps = {
    uploadOrFile: Upload | FileUpload;
    size: number;
};

const UploadProgress: React.FC<UploadProgressProps> = (props) => {
    const classes = useStyles();
    const { uploadOrFile, size } = props;
    const error = hasError(uploadOrFile);
    return (
        <Fade in={uploadOrFile.progress < 1} timeout={{enter: 100, exit: 2000}}>
            <div className={classes.progressContainer}>
                <CircularProgress
                    variant="static"
                    value={100}
                    className={classes.progressBackground}
                    size={size}
                />
                <CircularProgress
                    className={classes.progress}
                    value={error ? 0 : uploadOrFile.progress * 100}
                    variant="static"
                    size={size}
                />
            </div>
        </Fade>
    );
};

export default UploadProgress;