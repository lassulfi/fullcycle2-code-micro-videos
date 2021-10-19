// @flow 
import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import DefaultForm from '../../components/DefaultForm';
import LoadingContext from '../../components/loading/LoadingContext';
import SubmitActions from '../../components/SubmitActions';
import castMemberHttp from '../../utils/http/cast-member-http';
import { CastMember } from '../../utils/models';
import * as yup from '../../utils/vendor/yup';

type CastMemberId = {
    id: string
}

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255),
    type: yup.number()
            .label('Tipo')
            .required()
});

const Form = () => {
    const {register, 
        getValues, 
        handleSubmit, 
        setValue, 
        errors, 
        reset, 
        watch, 
        triggerValidation} = useForm<{name, type}>({
        validationSchema
    });
    
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id}: CastMemberId = useParams();
    const [castMember, setCastMember] = useState<CastMember | null>(null)
    const loading = useContext(LoadingContext);

    useEffect(() => {
        register({name: 'type'})
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await castMemberHttp.get<{data: CastMember}>(id);
                if (isSubscribed) {
                    setCastMember(data.data);
                    reset(data.data);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {
                        variant: 'error',
                    }
                )
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, [id, reset, enqueueSnackbar]);

    async function onSubmit (formData, event) {
        try {
            const http = !castMember
            ? castMemberHttp.create(formData)
            : castMemberHttp.update(castMember.id, formData);
            const {data} = await http;
            enqueueSnackbar(
                'Membro de elenco salvo com sucesso',
                {
                    variant: 'success',
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
            });
        } catch (error) {
            console.error(error);
                enqueueSnackbar(
                    'Erro ao salvar membro de elenco',
                    {
                        variant: 'error'
                    }
                );
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