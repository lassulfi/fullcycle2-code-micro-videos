// @flow 
import * as React from 'react';
import { Box, Fab, MuiThemeProvider } from '@material-ui/core';
import { Page } from '../Page';
import AddIcon from '@material-ui/icons/Add';
import Table, { makeActionStyles } from '../Table';
import { MUIDataTableColumn } from 'mui-datatables';
import FilterResetButton from '../Table/FilterResetButton';
import { State } from '../../store/search/types';
import { Creators } from '../../store/search';

interface SearchStateProps {
    searchState: State;
    totalRecords: number;
    dispatch: React.Dispatch<any>;
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
                        debouncedSearchTime={500}
                        options={{
                            serverSide: true,
                            responsive: 'scrollMaxHeight',
                            searchText: (props.searchStateProps as any).searchState.search,
                            page: (props.searchStateProps as any).searchState.pagination.page - 1,
                            rowsPerPage: (props.searchStateProps as any).searchState.pagination.per_page,
                            count: (props.searchStateProps as any).totalRecords,
                            customToolbar: () => (
                                <FilterResetButton 
                                    handleClick={() => (props.searchStateProps as any).dispatch(Creators.setReset())}
                                />
                                ),
                            onSearchChange: (value) => (props.searchStateProps as any).dispatch(Creators.setSearch({search: value})),
                            onChangePage: (page) => (props.searchStateProps as any).dispatch(Creators.setPage({page: page + 1})),
                            onChangeRowsPerPage: (perPage) => (props.searchStateProps as any).dispatch(Creators.setPerPage({per_page: perPage})),
                            onColumnSortChange: (changeColumn: string, direction: string) => (props.searchStateProps as any)
                                .dispatch(Creators.setOrder({
                                    sort: changeColumn,
                                    dir: direction.includes('desc') ? 'desc': 'asc'
                                }))
                        }}
                    />
                </MuiThemeProvider> 
            </Box>
        </Page>
    );
};

export default PageList;