import { useSnackbar } from "notistack";
import { useEffect } from "react";

const useSnackbarFormError = (submitCount, errors) => {
    const snackbar = useSnackbar();
    useEffect(() => {
        const hasErrors = Object.keys(errors).length !== 0;
        if (submitCount > 0 && hasErrors) {
            snackbar.enqueueSnackbar(
                'Formulário inválido. Revise os campos destacados em vermelho',
                { variant: 'error' },
            )
        }
    }, [submitCount])
}

export default useSnackbarFormError;