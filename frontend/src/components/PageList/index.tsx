// @flow 
import * as React from 'react';
import { Box, Fab, MuiThemeProvider } from '@material-ui/core';
import { Page } from '../Page';
import AddIcon from '@material-ui/icons/Add';
import Table, { makeActionStyles } from '../Table';
import { MUIDataTableColumn } from 'mui-datatables';

interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

export interface SearchState {
    search: string;
    pagination: Pagination;
}

interface SearchStateProps {
    searchState: SearchState;
    setSearchState: (value: SearchState) => void
}

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
    searchStateProps?: SearchStateProps
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
                <MuiThemeProvider theme={makeActionStyles(props.columnsDefinition.length - 1)}>
                    <Table 
                        title={props.tableTitle}
                        data={props.data}
                        columns={props.columnsDefinition}
                        loading={isLoading()}
                        options={{
                            serverSide: true,
                            responsive: 'scrollMaxHeight',
                            searchText: (props.searchStateProps as any).searchState.search,
                            page: (props.searchStateProps as any).searchState.pagination.page - 1,
                            rowsPerPage: (props.searchStateProps as any).searchState.pagination.per_page,
                            count: (props.searchStateProps as any).searchState.pagination.total,
                            onSearchChange: (value) => (props.searchStateProps as any).setSearchState(prevState => ({
                                ...prevState,
                                search: value
                            })),
                            onChangePage: (page) => (props.searchStateProps as any).setSearchState(prevState => ({
                                ...prevState,
                                pagination: {
                                    ...prevState.pagination,
                                    page: page + 1
                                }
                            })),
                            onChangeRowsPerPage: (perPage) => (props.searchStateProps as any).setSearchState(prevState => ({
                                ...prevState,
                                pagination: {
                                    ...prevState.pagination,
                                    per_page: perPage
                                }
                            })),
                        }}
                    />
                </MuiThemeProvider> 
            </Box>
        </Page>
    );
};

export default PageList;