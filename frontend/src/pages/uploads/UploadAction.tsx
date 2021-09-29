// @flow 
import React from 'react';
import { Divider, Fade, IconButton, makeStyles, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main,
        marginLeft: theme.spacing(1),
    },
    errorIcon: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(1),
    },
    divider: {
        height: '20px',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));

type UploadActionProps = {
    
};

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const classes = useStyles();
    
    return (
        <Fade in={true} timeout={{enter: 1000}}>
            <>
                <CheckCircleIcon className={classes.successIcon} />
                <ErrorIcon className={classes.errorIcon} />
                <>
                    <Divider className={classes.divider} orientation="vertical">
                        <IconButton>
                            <DeleteIcon color="primary" />
                        </IconButton>
                        <IconButton
                            component={Link}
                            to={`/videos/uuid/delete`}
                        >
                            <EditIcon color="primary" />
                        </IconButton>
                    </Divider>
                </>
            </>
        </Fade>
    );
};

export default UploadAction;