// @flow 
import { useMediaQuery, useTheme } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Checkbox, FormControlLabel, Grid, TextField } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useHistory } from 'react-router';
import DefaultForm from '../../../components/DefaultForm';
import InputFile from '../../../components/InputFile';
import Rating from '../../../components/Rating';
import SubmitActions from '../../../components/SubmitActions';
import videoHttp from '../../../utils/http/video-http';
import { Video } from '../../../utils/models';
import * as yup from '../../../utils/vendor/yup';
import RatingField from './RatingField';

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
    rating: yup.string()
        .label('Classificação')
        .required()
});

const Form = () => {
    const {register, 
        getValues,
        setValue, 
        handleSubmit, 
        errors, 
        reset, 
        watch, 
        triggerValidation} = useForm({
            validationSchema,
            defaultValues: {
            }
        });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id}: {id: string} = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterThenMd = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        ['rating', 'opened'].forEach(name => register({name: name}));
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {
                        variant: 'error'
                    }
                );
            } finally {
                setLoading(false);
            }
        })()

        return () => {
            isSubscribed = false;
        }
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video 
            ? videoHttp.create(formData)
            : videoHttp.update(video.id, formData)
            const {data} = await http;
            snackbar.enqueueSnackbar(
                'Categoria salva com sucesso',
                {
                    variant: 'success'
                }
            );
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
            snackbar.enqueueSnackbar(
                'Erro ao salvar vídeo',
                {
                    variant: 'error'
                }
            );
        } finally {
            setLoading(false);
        }
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
                                label="Ano de lançamento"
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
                    Elenco
                    <br />
                    Gêneros e Categorias
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
                    <InputFile />
                    <br />

                    <FormControlLabel
                        disabled={loading}
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