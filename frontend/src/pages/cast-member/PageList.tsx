// @flow 
import { Box, Fab } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';
import Table from './Table';
import AddIcon from '@material-ui/icons/Add'

const PageList = () => {

    return (
        <Page title={'Listagem de membros de elencos'}>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title="Adicionar membro de elenco"
                    color={'secondary'}
                    size="small"
                    component={Link}
                    to="/cast-members/create"
                >
                    <AddIcon/>
                </Fab>
            </Box>
            <Box>
                <Table/>
            </Box>
        </Page>
    );
};

export default PageList;