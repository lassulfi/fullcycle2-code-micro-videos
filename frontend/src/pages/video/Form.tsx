// @flow 
import { TextField } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useHistory } from 'react-router';
import DefaultForm from '../../components/DefaultForm';
import videoHttp from '../../utils/http/video-http';
import { Video } from '../../utils/models';
import * as yup from '../../utils/vendor/yup';

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
        .required(),
    duration: yup.number()
        .label('Duração')
        .required().min(1),
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
                is_active: true
            }
        });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

    //TODO: finalizar implementação (tempo de vídeo 08:56)
    return (
        <DefaultForm GridItemProps={{xs: 12, md: 6}} onSubmit={handleSubmit(onSubmit)}>
            <TextField
                        name="name"
                        label="Nome"
                        fullWidth
                        variant={'outlined'}
                        inputRef={register}
                        disabled={loading}
                        error={errors.name !== undefined}
                        helperText={errors.name && errors.name.message}
                        InputLabelProps={{shrink: true}}
                    />
                    <TextField
                        name="description"
                        label="Descrição"
                        multiline
                        rows={'4'}
                        fullWidth
                        variant={'outlined'}
                        margin={'normal'}
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                    />
                    <FormControlLabel
                        disabled={loading}
                        control={
                            <Checkbox
                                name={'is_active'}
                                color="primary"
                                onChange={
                                    () => setValue('is_active', !getValues()['is_active'])
                                }
                                checked={watch('is_active')}
                            />
                        }
                        label="Ativo?"
                        labelPlacement="end"
                    />
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