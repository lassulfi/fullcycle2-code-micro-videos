// @flow 
import { makeStyles, ButtonProps, Theme, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Button } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import castMemberHttp from '../../utils/http/cast-member-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    };
});

const Form = () => {
    
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
    };

    const {register, getValues, handleSubmit, setValue} = useForm();
    useEffect(() => {
        register({name: 'type'})
    }, [register]);

    const onSubmit = (formData, event) => {
        console.log(formData);
        castMemberHttp
            .create(formData)
            .then((response) => console.log(response));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField 
                name="name"
                label="Nome"
                fullWidth
                variant={'outlined'}
                inputRef={register}
            />
            <FormControl component="fieldset">
                <FormLabel style={{paddingTop: 16}} component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    aria-label="tipo"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value))
                    }}
                >
                    <FormControlLabel value="1" control={<Radio color="primary" />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio color="primary" />} label="Ator" />
                </RadioGroup>
            </FormControl>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;