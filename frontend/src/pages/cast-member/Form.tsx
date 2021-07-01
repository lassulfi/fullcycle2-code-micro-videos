// @flow 
import { makeStyles, ButtonProps, Theme, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import castMemberHttp from '../../utils/http/cast-member-http';

const castMemberTypeMap = {
    'director': 1,
    'actor': 2
}

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
        variant: 'outlined',
    };

    const {register, getValues, handleSubmit, control} = useForm({
        defaultValues: {
            type: 'director'
        }
    });

    const [type, setType] = useState("director");

    const onSubmit = (formData) => {
        const data = {...formData};
        data['type'] = castMemberTypeMap[type];
        castMemberHttp
            .create(data)
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
                <FormLabel component="legend">Tipo</FormLabel>
                <Controller 
                    name="type-controller"
                    rules={{ required: true }}
                    control={control}
                    onChange={(e) => {setType(e[1])}}
                    valueName="type"
                    as={
                        <RadioGroup
                            aria-label="tipo"
                            value={type}
                            defaultValue="director"
                        >
                            <FormControlLabel 
                                value={'director'} 
                                control={<Radio />} 
                                label="Diretor"
                            />
                            <FormControlLabel 
                                value={'actor'} 
                                control={<Radio />} 
                                label="Ator"
                            />
                        </RadioGroup>
                    }
                />
            </FormControl>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues())}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;