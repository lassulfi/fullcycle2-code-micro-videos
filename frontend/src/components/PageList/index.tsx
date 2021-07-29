// @flow 
import * as React from 'react';
import { Box, Fab } from '@material-ui/core';
import { Page } from '../Page';
import AddIcon from '@material-ui/icons/Add';
import Table from '../Table';
import { MUIDataTableColumn } from 'mui-datatables';

export interface FabProps {
    title: string;
    size?: "small" | "medium" | "large";
    component: React.ElementType;
    to: string;
}

interface PageListProps<T = any> {
    pageTitle: string;
    boxDirection: string;
    data: T;
    fab: FabProps;
    tableTitle: string;
    columnsDefinition: MUIDataTableColumn[];
    loading?: boolean,
}

const PageList: React.FC<PageListProps> = (props) => {
    const isLoading = (): boolean => props.loading 
        ? props.loading
        : false

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
                    columns={props.columnsDefinition}
                    loading={isLoading()}
                    options={{responsive: 'scrollMaxHeight'}}
                />
            </Box>
        </Page>
    );
};

export default PageList;