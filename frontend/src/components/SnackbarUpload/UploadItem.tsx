// @flow 
import React from 'react';
import { Divider, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import MovieIcon from '@material-ui/icons/Movie';
import UploadProgress from '../UploadProgress';

const useStyles = makeStyles((theme: Theme) => ({
    listItem: {
        paddingTop: '7px',
        paddingBottom: '7px',
        height: '53px',
    },
    movieIcon: {
        color: theme.palette.error.main,
        minWidth: '40px',
    },
    listItemText: {
        marginLeft: '6px',
        marginRight: '24px',
        color: theme.palette.text.secondary,
    },
}));

type UploadItemProps = {

};

const UploadItem: React.FC<UploadItemProps> = (props) => {
    const classes = useStyles();
    return (
        <>
            <Tooltip
                title="Não foi possível fazer o upload. Clique para saber mais detalhes."
                placement="left"
            >
                <ListItem
                    className={classes.listItem}
                    button
                >
                    <ListItemIcon className={classes.movieIcon}>
                        <MovieIcon />
                    </ListItemIcon>
                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap={true} variant="subtitle2" color="inherit">
                                E o Vento Levou
                            </Typography>
                        }
                    />
                    <UploadProgress size={30}/>
                </ListItem>
            </Tooltip>
            <Divider component="li" />
        </>
    );
};

export default UploadItem;