// @flow 
import { makeStyles, ButtonProps, Theme, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Button, FormHelperText } from '@material-ui/core';
import { watch } from 'fs';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import castMemberHttp from '../../utils/http/cast-member-http';
import * as yup from '../../utils/vendor/yup';

type FormData = {
    name: string,
    type: number,
}

type CastMemberId = {
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
            .max(255),
    type: yup.number()
            .label('tipo')
            .required()
});

const Form = () => {
    
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
    };
    const snackbar = useSnackbar();
    const history = useHistory();
    const {id}: CastMemberId = useParams();
    const [castMember, setCastMember] = useState<CastMemberId | null>(null)
    const [loading, setLoading] = useState<boolean>(false);

    const {register, getValues, handleSubmit, setValue, errors, reset, watch} = useForm<FormData>({
        validationSchema
    });
    useEffect(() => {
        register({name: 'type'})
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        setLoading(true);
        castMemberHttp
            .get(id)
            .then(({data}) => {
                setCastMember(data.data);
                reset(data.data);
            })
            .finally(() => setLoading(false));

    }, [])

    const onSubmit = (formData, event) => {
        setLoading(true);
        const http = !castMember
            ? castMemberHttp.create(formData)
            : castMemberHttp.update(castMember.id, formData);
        http
            .then(({data}) => {
                snackbar.enqueueSnackbar(
                    'Membro de elenco salvo com sucesso',
                    {
                        variant: 'success'
                    }
                );
                setTimeout(() => {
                    event 
                        ? (
                            id 
                                ? history.replace(`/cast-members/${data.data.id}/edit`)
                                : history.push(`/cast-members/${data.data.id}/edit`)
                        ) 
                        : history.push('/cast-members')
                })
            })
            .catch((error) => {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Erro ao salvar membro de elenco',
                    {
                        variant: 'error'
                    }
                )
            })
            .finally(() => setLoading(false))
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
            <FormControl 
                margin="normal"
                disabled={loading}
                error={errors.type !== undefined}
                component="fieldset"
            >
                <FormLabel style={{paddingTop: 16}} component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    aria-label="tipo"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value))
                    }}
                    value={watch('type') + ""}
                >
                    <FormControlLabel value="1" control={<Radio color="primary"/>} label="Diretor"/>
                    <FormControlLabel value="2" control={<Radio color="primary" />} label="Ator" />
                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>
                }
            </FormControl>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;