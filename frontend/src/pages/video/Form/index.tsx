// @flow 
import {  Card, CardContent, makeStyles, Theme, useMediaQuery, useTheme } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Checkbox, FormControlLabel, Grid, TextField } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { createRef, MutableRefObject, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router';
import DefaultForm from '../../../components/DefaultForm';
import { InputFileComponent } from '../../../components/InputFile';
import SubmitActions from '../../../components/SubmitActions';
import videoHttp from '../../../utils/http/video-http';
import { Video, VideoFileFieldsMap } from '../../../utils/models';
import * as yup from '../../../utils/vendor/yup';
import RatingField from './RatingField';
import UploadField from './UploadField';
import GenreField, { GenreFieldComponent } from './GenreField';
import CategoryField, { CategoryFieldComponent } from './CategoryField';
import { useForm } from 'react-hook-form';
import CastMemberField, { CastMemberFieldComponent } from './CastMemberField';
import { omit, zipObject } from 'lodash';
import useSnackbarFormError from '../../../hooks/useSnackbarFormError';
import LoadingContext from '../../../components/loading/LoadingContext';
import SnackbarUpload from '../../../components/SnackbarUpload';
import { useDispatch } from 'react-redux';
import { FileInfo } from '../../../store/upload/types';
import { Creators } from '../../../store/upload';

type FormData = {
    title: string;
    description: string;
    year_launched: number;
    duration: number;
    rating: string;
    genres: any[];
    categories: any[];
    cast_members: any[];
    thumb_file: any;
    banner_file: any;
    trailer_file: any;
    video_file: any;
    opened: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: '4px',
        backgroundColor: '#f5f5f5'
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important',
    },
}));

const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Título')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup.number()
        .label('Duração')
        .required()
        .min(1),
    genres: yup.array()
        .label('Gêneros')
        .required()
        .test({
            message: 'Cada gênero escolhido preisa ter ao menos uma categoria selecionada',
            test(value) {
                return (value as any).every(
                    v => v.categories.filter(
                        cat => this.parent.categories.map(c => c.id)
                        .includes(cat.id)
                    ).length !== 0
                );
            }
        }),
    rating: yup.string()
        .label('Classificação')
        .required(),
    categories: yup.array()
        .label('Categorias')
        .required(),
    cast_members: yup.array()
        .label('Membros de Elenco')
        .required(),
});

const fileFields = Object.keys(VideoFileFieldsMap);

const Form = () => {
    const classes = useStyles();
    const {register, 
        getValues,
        setValue, 
        handleSubmit, 
        errors, 
        reset, 
        watch, 
        triggerValidation, 
        formState
    } = useForm<FormData>({
            validationSchema,
            defaultValues: {
                genres: [],
                categories: [],
                cast_members: [],
                opened: false,
            }
        });

    useSnackbarFormError(formState.submitCount, errors);

    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id}: {id: string} = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const loading = useContext(LoadingContext);
    const theme = useTheme();
    const isGreaterThenMd = useMediaQuery(theme.breakpoints.up('md'));
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadsRef = useRef(zipObject(fileFields, fileFields.map(() => createRef()))
    ) as MutableRefObject<{[key: string]: MutableRefObject<InputFileComponent>}>;

    const dispatch = useDispatch();

    const resetForm = useCallback((data) => {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);
    }, [uploadsRef, castMemberRef, genreRef, categoryRef, reset]);

    useEffect(() => {
        [
            'rating', 
            'opened', 
            'genres',
            'categories', 
            'cast_members',
            ...fileFields
        ].forEach(name => register({name: name}));
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    resetForm(data.data);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {
                        variant: 'error'
                    }
                );
            }
        })()

        return () => {
            isSubscribed = false;
        }
    }, [id, resetForm, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        const sendData = omit(formData, 
            [...fileFields, 'cast_members', 'genres', 'categories']
        );
        sendData['categories_id'] = formData['categories'].map(category => category.id);  
        sendData['genres_id'] = formData['genres'].map(genres => genres.id);  
        sendData['cast_members_id'] = formData['cast_members'].map(cast_members => cast_members.id);  

        try {
            const http = !video 
            ? videoHttp.create(sendData)
            : videoHttp.update(video.id, sendData);
            const {data} = await http;
            enqueueSnackbar(
                'Video salvo com sucesso',
                {
                    variant: 'success'
                }
            );
            uploadFiles(data.data);
            id && resetForm(video);
            setTimeout(() => {
                event 
                    ? (
                        id
                            ? history.replace(`/videos/${data.data.id}/edit`)
                            : history.push(`/videos/${data.data.id}/edit`)
                    )
                    : history.push('/videos');
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                'Erro ao salvar vídeo',
                {
                    variant: 'error'
                }
            );
        }
    }

    function uploadFiles(video) {
        const files: FileInfo[] = fileFields
            .filter(fileField => getValues()[fileField])
            .map(fileField => ({fileField, file: getValues()[fileField]}));

        if (!files.length) {
            return;
        }

        dispatch(Creators.addUpload({video, files}));

        enqueueSnackbar('', {
            key: 'snackbar-upload',
            persist: true,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            content: (key, message) => {
                const id = key as any;
                return <SnackbarUpload id={id} />;
            }
        });
    }

    return (
        <DefaultForm GridItemProps={{xs: 12}} 
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Título"
                        fullWidth
                        variant={'outlined'}
                        inputRef={register}
                        disabled={loading}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                        InputLabelProps={{shrink: true}}
                    />
                    <TextField
                        name="description"
                        label="Sinpose"
                        multiline
                        rows={'4'}
                        fullWidth
                        variant={'outlined'}
                        margin={'normal'}
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField 
                                name="year_launched"
                                label="Ano de lançamento"
                                type="number"
                                margin="normal"
                                variant={'outlined'}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                name="duration"
                                label="Duração"
                                type="number"
                                margin="normal"
                                variant={'outlined'}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />  
                        </Grid>
                    </Grid>
                    <CastMemberField
                        ref={castMemberRef}
                        castMembers={watch('cast_members')}
                        setCastMembers={(value) => setValue('cast_members', value, true)}
                        error={errors.cast_members}
                        disabled={loading}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField 
                                ref={genreRef}
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value, true)}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                ref={categoryRef}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField 
                        value={watch('rating')}
                        setValue={(value) => setValue('rating', value)}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterThenMd ? 'none' : 'normal',
                        }}
                    />
                    <br/>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField 
                                ref={uploadsRef.current['thumb_file']}
                                accept="image/*"
                                label="Thumb"
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField 
                                ref={uploadsRef.current['banner_file']}
                                accept="image/*"
                                label="Banner"
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Vídeos
                            </Typography>
                        <UploadField 
                            ref={uploadsRef.current['trailer_file']}
                            accept="video/mp4"
                            label="Trailer"
                            setValue={(value) => setValue('trailer_file', value)}
                        />
                        <UploadField 
                            ref={uploadsRef.current['video_file']}
                            accept="video/mp4"
                            label="Principal"
                            setValue={(value) => setValue('video_file', value)}
                        />
                        </CardContent>
                    </Card>
                    <br />
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                    name="opened"
                                    color="primary"
                                    onChange={
                                        () => setValue('opened', !getValues()['opened'])
                                    }
                                    checked={watch('opened')}
                                    />
                                }
                                label={
                                    <Typography color="primary" variant="subtitle2">
                                        Quero que este conteúdo apareça na seção se lançamentos
                                    </Typography>
                                }
                                labelPlacement="end"
                            />
                        </CardContent>
                    </Card>

                </Grid>
            </Grid>
            <SubmitActions 
                disabledButtons={loading} 
                handleSave={() => triggerValidation().then(isValid => {
                    isValid && onSubmit(getValues(), null)
                })}
            />
        </DefaultForm>
    );
};

export default Form;