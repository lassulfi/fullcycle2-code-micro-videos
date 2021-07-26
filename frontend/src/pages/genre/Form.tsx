// @flow 
import { Box, Button, ButtonProps, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../utils/http/category-http';
import genreHttp from '../../utils/http/genre-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const Form = () => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
    };
    
    const [categories, setCategories] = useState<any[]>([])
    const {register, watch, getValues, handleSubmit, setValue} = useForm({
        defaultValues: {
            categories_id: []
        }
    });

    useEffect(() => {
        register({name: 'categories_id'})
    }, [register])

    useEffect(() => {
        categoryHttp
            .list()
            .then(({data}) => setCategories(data.data))
    }, []);

    const onSubmit = (formData, event) => {
        genreHttp
            .create(formData)
            .then((response) => console.log(response.data));
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField 
                name="name"
                label="Nome"
                fullWidth
                variant={'outlined'}
                inputRef={register}
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