// @flow 
import { Typography } from '@material-ui/core';
import * as React from 'react';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import genreHttp from '../../../utils/http/genre-http';

interface CategoryFieldProps {

}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const autocompleteHttp = useHttpHandled();
    const fetchOptions = (searchText) => autocompleteHttp(
        genreHttp
            .list({
                queryParams: {
                    search: searchText,
                    all: ""
                },
            })
    )
        .then(data => data.data)
        .catch(error => console.error(error));

    return (
        <>
            <AsyncAutocomplete 
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: true,
                    getOptionLabel: option => option.name
                }}
                TextFieldProps={{
                    label: 'Categorias'
                }}
            />
            <GridSelected>
                <GridSelectedItem onClick={() => {}} xs={6}>
                    <Typography noWrap={true}>Categoria 1</Typography>
                </GridSelectedItem>
            </GridSelected>
        </>
    );
};

export default CategoryField;