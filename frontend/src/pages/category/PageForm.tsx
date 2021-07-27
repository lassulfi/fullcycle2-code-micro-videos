// @flow 
import * as React from 'react';
import { useParams } from 'react-router';
import { Page } from '../../components/Page';
import Form from './Form';

const PageForm = () => {
    const params = useParams();
    return (
        <Page title={!params ? 'Criar categoria' : 'Editar categoria'}>
            <Form/>
        </Page>
    );
};

export default PageForm;