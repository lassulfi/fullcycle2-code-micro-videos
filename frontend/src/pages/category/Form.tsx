// @flow 
import { Box, Button, ButtonProps, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useHistory } from 'react-router';
import categoryHttp from '../../utils/http/category-http';
import * as yup from '../../utils/vendor/yup';

type FormData = {
    name: string,
    description: string,
    is_active: boolean
}

type CategoryId = {
    id: string
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    };
});

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255)
});

const Form = () => {

    const classes = useStyles();

    const {register, 
        getValues,
        setValue, 
        handleSubmit, 
        errors, 
        reset, 
        watch} = useForm<FormData>({
            validationSchema,
            defaultValues: {
                is_active: true
            }
        });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id}: CategoryId = useParams();
    const [category, setCategory] = useState<CategoryId | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading,
    };

    useEffect(() => {
        register({name: 'is_active'})
    }, [register])

    useEffect(() => {
        if (!id) {
            return;
        }
        setLoading(true);
        categoryHttp
            .get(id)
            .then(({data}) => {
                setCategory(data.data);
                reset(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    function onSubmit(formData, event) {
        setLoading(true);
        const http = !category 
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData)
        http
            .then(({data}) => {
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
            })
            .catch((error) => {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Erro ao salvar categoria',
                    {
                        variant: 'error'
                    }
                );
            })
            .finally(() => setLoading(false));
    }

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
            <Box dir={'rtl'}>
                <Button 
                    color="primary"
                    {...buttonProps} 
                    onClick={() => onSubmit(getValues(), null)}
                >
                    Salvar
                </Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;