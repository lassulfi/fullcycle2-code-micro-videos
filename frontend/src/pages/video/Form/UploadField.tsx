// @flow 
import { Button, FormControlProps } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import React, { useRef } from 'react';
import InputFile, { InputFileComponent } from '../../../components/InputFile';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { MutableRefObject } from 'react';

interface UploadFieldProps {
    accept: string;
    label: string;
    setValue: (value) => void;
    error?: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

// TODO: finalizar aula Criando um componente InputFile - parte 4 - tempo do vídeo 07:13
const UploadField: React.FC<UploadFieldProps> = (props) => {
    const fileRef = useRef() as MutableRefObject<InputFileComponent>
    const {accept, label, setValue, error, disabled} = props;
    return (
        <FormControl 
            disabled={disabled === true}
            error={error !== undefined}
            fullWidth
            margin="normal"
            {...props.FormControlProps}
        >
            <InputFile
                ref={fileRef}
                TextFieldProps={{
                    label: label,
                    InputLabelProps: {shrink: true},
                    style: {backgroundColor: "#ffffff"}
                }}
                InputFileProps={{
                    accept,
                    onChange(event) {
                        const files = event.target.files as any;
                        files.length && setValue(files[0]);
                    }
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon />}
                        variant="contained"
                        color="primary"
                        onClick={() => fileRef.current.openWindow()}
                    >
                        Adicionar
                    </Button>
                } 
            />
        </FormControl>
);
};

export default UploadField;