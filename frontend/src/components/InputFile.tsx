// @flow 
import React, { MutableRefObject, useRef } from 'react';
import { Button, InputAdornment, TextField } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

type Props = {
    
};
const InputFile = (props: Props) => {
    const fileRef = useRef() as MutableRefObject<HTMLInputElement>

    return (
        <>
            <input type="file" hidden={true} ref={fileRef}/>
            <TextField 
                variant="outlined"
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button
                                endIcon={<CloudUploadIcon />}
                                variant="contained"
                                color="primary"
                                onClick={() => fileRef.current.click()}
                            >
                                Adicionar
                            </Button>
                        </InputAdornment>
                    )  
                }}

            />
        </>
    );
};

export default InputFile;