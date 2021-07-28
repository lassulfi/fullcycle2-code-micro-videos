// @flow 
import { MenuItem, TextField} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import DefaultForm from '../../components/DefaultForm';
import SubmitActions from '../../components/SubmitActions';
import categoryHttp from '../../utils/http/category-http';
import genreHttp from '../../utils/http/genre-http';
import { Category, Genre } from '../../utils/models';
import * as yup from '../../utils/vendor/yup';

type GenreId = {
    id: string
}

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
    const {
        register, 
        watch, 
        getValues, 
        handleSubmit, 
        setValue, 
        errors, 
        reset, 
        triggerValidation} = useForm<{name, categories_id}>({
        validationSchema,
        defaultValues: {
            categories_id: []
        }
    });
    
    const snackbar = useSnackbar();
    const history = useHistory();
    const [categories, setCategories] = useState<Category[]>([])
    const [genre, setGenre] = useState<Genre | null>(null);
    const {id}:GenreId = useParams();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        register({name: 'categories_id'})
    }, [register])

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            const promises = [categoryHttp.list()];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                if (isSubscribed) {
                    setCategories(categoriesResponse.data.data);
                    if (id) {
                        setGenre(genreResponse.data.data);
                        const categories_id = genreResponse.data.data.categories.map(category => category.id); 
                        reset({
                            ...genreResponse.data.data,
                            categories_id
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível recuperar os dados',
                    {
                        variant: 'error'
                    }
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, [id, reset]);

    async function onSubmit (formData, event) {
        setLoading(true)
        try {
            const http = !genre
            ? genreHttp.create(formData)
            : genreHttp.update(genre.id, formData)
            const {data} = await http;
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
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Erro ao salvar gênero',
                {
                    variant: 'error'
                }
            );
        } finally {
            setLoading(false);
        }
    };

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