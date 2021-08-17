// @flow 
import * as React from 'react';
import { Box, Fab, MuiThemeProvider } from '@material-ui/core';
import { Page } from '../Page';
import AddIcon from '@material-ui/icons/Add';
import Table, { makeActionStyles } from '../Table';
import { MUIDataTableColumn } from 'mui-datatables';
import FilterResetButton from '../Table/FilterResetButton';
import { State } from '../../store/filter/types';
import { Creators } from '../../store/filter';
import useFilter from '../../hooks/useFilter';

interface FilterStateProps {
    filterState: State;
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
    filterStateProps?: FilterStateProps
}

const PageList: React.FC<PageListProps> = (props) => {
    const isLoading = (): boolean => props.loading 
        ? props.loading
        : false;

    const {filterManager} = useFilter({
        columns: props.columnsDefinition,
        debounceTime: 500,
        rowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 50]
    }); 

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
                            searchText: (props.filterStateProps as any).filterState.search,
                            page: (props.filterStateProps as any).filterState.pagination.page - 1,
                            rowsPerPage: (props.filterStateProps as any).filterState.pagination.per_page,
                            count: (props.filterStateProps as any).totalRecords,
                            customToolbar: () => (
                                <FilterResetButton 
                                    handleClick={() => (props.filterStateProps as any).dispatch(Creators.setReset())}
                                />
                                ),
                            onSearchChange: (value) => filterManager.changeSearch({search: value}),
                            onChangePage: (page) => filterManager.changePage({page: page + 1}),
                            onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage({per_page: perPage}),
                            onColumnSortChange: (changeColumn: string, direction: string) => 
                                filterManager.changeColumnSort(changeColumn, direction)
                        }}
                    />
                </MuiThemeProvider> 
            </Box>
        </Page>
    );
};

export default PageList;