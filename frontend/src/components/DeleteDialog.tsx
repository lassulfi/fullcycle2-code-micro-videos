// @flow 
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';
type DeleteDialogProps = {
    open: boolean;
    handleClose: (confirmed: boolean) => void;
};

// TODO: finalizar aula Criando exclusão em blocos de registros com Mui Datatables (tempo do video 08:28)
const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {
    const {open, handleClose} = props;
    return (
        <Dialog
            open={open}
            onClose={() => handleClose(false)}
        >
            <DialogTitle>
                Exclusão de registros
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Deseja realmente excluir este(s) registro(s)?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} color="primary">
                    Cancelar
                </Button>
                <Button onClick={() => handleClose(true)} color="primary" autoFocus>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;