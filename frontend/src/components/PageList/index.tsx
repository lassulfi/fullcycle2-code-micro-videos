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
            <Box dir={props.boxDirection}>
                <Fab
                    title={props.fab.title}
                    size={props.fab.size}
                    component={props.fab.component}
                    to={props.fab.to}
                >
                    <AddIcon/>
                </Fab>
            </Box>
            <Box>
                <Table 
                    title={props.table.title} 
                    route={props.table.route} 
                    columnsDefinition={props.table.columnsDefinition}
                />
            </Box>
        </Page>
    );
};

export default PageList;