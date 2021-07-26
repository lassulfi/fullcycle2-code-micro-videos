// @flow 
import * as React from 'react';
import { Box, Fab } from '@material-ui/core';
import { Page } from '../Page';
import AddIcon from '@material-ui/icons/Add';
import { PageListProps } from './PageList.interface';
import Table from './Table';

const PageList: React.FC<PageListProps> = (props) => {
    return (
        <Page title={props.pageTitle}>
            <Box dir={props.boxDirection} paddingBottom={2}>
                <Fab
                    title={props.fab.title}
                    size={props.fab.size}
                    color="secondary"
                    component={props.fab.component}
                    to={props.fab.to}
                >
                    <AddIcon/>
                </Fab>
            </Box>
            <Box>
                <Table 
                    title={props.tableTitle}
                    data={props.data}
                    columnsDefinition={props.columnsDefinition}
                />
            </Box>
        </Page>
    );
};

export default PageList;