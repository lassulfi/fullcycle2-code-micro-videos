// @flow 
import { Typography } from '@material-ui/core';
import * as React from 'react';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import genreHttp from '../../../utils/http/genre-http';

interface GenreFieldProps {

}

const GenreField: React.FC<GenreFieldProps> = (props) => {
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
                    label: 'Gêneros'
                }}
            />
            <GridSelected>
                <GridSelectedItem onClick={() => {}} xs={6}>
                    <Typography noWrap={true}>Gênero 1</Typography>
                </GridSelectedItem>
            </GridSelected>
        </>
    );
};

export default GenreField;