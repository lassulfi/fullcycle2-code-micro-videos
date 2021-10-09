// @flow 
import React, { useMemo } from 'react';
import { Card, CardContent, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, List, makeStyles, Theme, Typography } from '@material-ui/core';
import { Page } from '../../components/Page';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UploadItem from './UploadItem';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, UploadModule } from '../../store/upload/types';
import { VideoFileFieldsMap } from '../../utils/models';
import { Creators } from '../../store/upload';

const useStyles = makeStyles((theme: Theme) => ({
    panelSummary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    expandedIcon: {
        color: theme.palette.primary.contrastText,
    }
}));

const Uploads = (props) => {
    const classes = useStyles();

    const uploads = useSelector<UploadModule, Upload[]>(
        (state) => state.upload.uploads
    );
    const dispatch = useDispatch();

    useMemo(() => {
        setTimeout(() => {
            const obj: any = {
                video: {
                    id: '1',
                    title: 'E o Vento Levou'
                }, 
                files: [
                    {
                        file: new File([""], "teste.mp4"),
                        fileField: 'trailer_mp4',
                    },
                    {
                        file: new File([""], "teste.mp4"),
                        fileField: 'video_mp4',
                    }
                ]
            }
    
            dispatch(Creators.addUpload(obj));
            const progress1 = {
                fileField: 'trailer_file',
                progress: 10,
                video: { id: '1' }
            } as any;
            dispatch(Creators.updateProgress(progress1));
            const progress2 = {
                fileField: 'video_file',
                progress: 20,
                video: { id: 1 }
            } as any;
            dispatch(Creators.updateProgress(progress2));
        }, 1000)
    }, [true]);

    return (
        <Page title="Uploads">
            {
                uploads.map((upload, key) => (
                    <Card elevation={5} key={key}>
                        <CardContent>
                            <UploadItem uploadOrFile={upload}>
                                {upload.video.title}
                            </UploadItem>
                            <ExpansionPanel style={{margin: 0}}>
                                <ExpansionPanelSummary
                                    className={classes.panelSummary}
                                    expandIcon={<ExpandMoreIcon className={classes.expandedIcon}/>}
                                >
                                    <Typography>Ver detalhes</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{padding: '0px'}}>
                                    <Grid item xs={12}>
                                        <List dense={true} style={{padding: '0px'}}>
                                            {
                                                upload.files.map((file, key) => (
                                                    <React.Fragment key={key}>
                                                        <Divider />
                                                        <UploadItem uploadOrFile={file}>
                                                            {`${VideoFileFieldsMap[file.fileField]} - ${file.filename}`}
                                                        </UploadItem>
                                                    </React.Fragment>
                                                ))
                                            }
                                        </List>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </CardContent>
                    </Card>
                ))
            }
        </Page>
    );
};

export default Uploads