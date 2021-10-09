// @flow 
import React from 'react';
import { Fade, IconButton, ListItemSecondaryAction, makeStyles, Theme } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import { Upload } from '../../store/upload/types';
import { useDispatch } from 'react-redux';
import { Creators } from '../../store/upload';

const useStyles = makeStyles((theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main,
    },
    errorIcon: {
        color: theme.palette.error.main,
    }
}));

type UploadActionProps = {
    upload: Upload;
};

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const { upload } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    return (
        <Fade in={true} timeout={{ enter: 1000 }}>
            <ListItemSecondaryAction>
                <span>
                    {
                        upload.progress === 1 && (<IconButton 
                            className={classes.successIcon} 
                            edge="end"
                        >
                            <CheckCircleIcon />
                        </IconButton>)
                    }
                    {
                        <IconButton 
                            className={classes.errorIcon} 
                            edge="end"
                        >
                            <ErrorIcon />
                        </IconButton>
                    }
                </span>
                <span>
                    <IconButton 
                        color="primary" 
                        edge="end"
                        onClick={() => dispatch(Creators.removeUpload({id: upload.video.id}))}
                    >
                        <DeleteIcon />
                    </IconButton>
                </span>
            </ListItemSecondaryAction>
        </Fade>
    );
};

export default UploadAction;