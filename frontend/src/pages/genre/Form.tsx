// @flow 
import { Box, Button, ButtonProps, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import categoryHttp from '../../utils/http/category-http';
import genreHttp from '../../utils/http/genre-http';
import * as yup from '../../utils/vendor/yup';

type GenreId = {
    id: string
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255),
    categories_id: yup.array()
                    .label('Categorias')
                    .required()
})

const Form = () => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
    };
    
    const snackbar = useSnackbar();
    const history = useHistory();
    const [categories, setCategories] = useState<any[]>([])
    const [genre, setGenre] = useState<GenreId | null>(null);
    const {id}:GenreId = useParams();
    const [loading, setLoading] = useState<boolean>(false)
    const {register, watch, getValues, handleSubmit, setValue, errors, reset} = useForm<{name, categories_id}>({
        validationSchema,
        defaultValues: {
            categories_id: []
        }
    });

    useEffect(() => {
        register({name: 'categories_id'})
    }, [register])

    useEffect(() => {
        setLoading(true)
        categoryHttp
            .list()
            .then(({data}) => setCategories(data.data))
            .finally(() => setLoading(false))
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }
        setLoading(true);
        genreHttp
            .get(id)
            .then(({data}) => {
                console.log(data.data);
                setGenre(data.data);
                const categories_id = data.data.categories.map(category => category.id);
                reset({...data.data, categories_id})
            })
            .finally(() => setLoading(false));
    }, [id, reset]);

    const onSubmit = (formData, event) => {
        setLoading(true)
        const http = !genre
            ? genreHttp.create(formData)
            : genreHttp.update(genre.id, formData)
        http
            .then(({data}) => {
                snackbar.enqueueSnackbar(
                    'Gênero salvo com sucesso',
                    {
                        variant: 'success'
                    }
                );
                setTimeout(() => {
                    event
                        ? (
                            id
                                ? history.replace(`/genres/${data.data.id}/edit`)
                                : history.push(`/genres/${data.data.id}/edit`)
                        )
                        : history.push('/genres')
                })
            })
            .catch((error) => {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Erro ao salvar gênero',
                    {
                        variant: 'error'
                    }
                )
            })
            .finally(() => setLoading(false));
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={'normal'}
                variant={'outlined'}
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value as any);
                }}
                SelectProps={{
                    multiple: true
                }}
                disabled={loading}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
                InputLabelProps={{shrink: true}}
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {categories.map((category, key) => (
                        <MenuItem 
                            key={key} 
                            value={category.id}
                        >
                            {category.name}
                        </MenuItem>
                    ))}
            </TextField>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;