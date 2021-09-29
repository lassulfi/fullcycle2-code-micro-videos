// @flow 
import { CircularProgress, Fade, makeStyles, Theme } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import React from 'react';
import UploadAction from './SnackbarUpload/UploadAction';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

type UploadProgressProps = {
    size: number;
};

const UploadProgress: React.FC<UploadProgressProps> = (props) => {
    const classes = useStyles();
    const { size } = props;
    return (
        <Fade in={true} timeout={{enter: 100, exit: 2000}}>
            <div className={classes.progressContainer}>
                <CircularProgress
                    variant="static"
                    value={100}
                    className={classes.progressBackground}
                    size={size}
                />
                <CircularProgress
                    className={classes.progress}
                    value={50}
                    variant="static"
                    size={size}
                />
                <UploadAction />
            </div>
        </Fade>
    );
};

export default UploadProgress;