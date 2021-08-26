// @flow 
import { Checkbox, FormControlLabel, Grid, TextField } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useHistory } from 'react-router';
import DefaultForm from '../../components/DefaultForm';
import SubmitActions from '../../components/SubmitActions';
import categoryHttp from '../../utils/http/category-http';
import { Category } from '../../utils/models';
import * as yup from '../../utils/vendor/yup';

type FormData = {
    name: string,
    description: string,
    is_active: boolean
}

type CategoryId = {
    id: string
}

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255)
});

const Form = () => {
    const {register, 
        getValues,
        setValue, 
        handleSubmit, 
        errors, 
        reset, 
        watch, 
        triggerValidation} = useForm<FormData>({
            validationSchema,
            defaultValues: {
                is_active: true
            }
        });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id}: CategoryId = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        register({name: 'is_active'})
    }, [register])

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await categoryHttp.get<{data: Category}>(id);
                if (isSubscribed) {
                    setCategory(data.data);
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
            const http = !category 
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData)
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
                            ? history.replace(`/categories/${data.data.id}/edit`)
                            : history.push(`/categories/${data.data.id}/edit`)
                    )
                    : history.push('/categories');
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Erro ao salvar categoria',
                {
                    variant: 'error'
                }
            );
        } finally {
            setLoading(false);
        }
    }

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