import { MUIDataTableColumn } from "mui-datatables";
import React, { Dispatch, Reducer, useEffect, useReducer, useState } from "react";
import reducer, { Creators } from "../store/filter";
import { Actions as FilterActions, State as FilterState } from "../store/filter/types";
import { useDebounce } from 'use-debounce';
import { useHistory } from "react-router";
import { History } from 'history';
import { isEqual } from 'lodash';
import * as yup from '../utils/vendor/yup';
import { MuiDataTableRefComponent } from "../components/Table";

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>,
    extraFilter?: ExtraFilter
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any,
    formatSearchParams: (debounceState: FilterState) => any,
    createValidationSchema: () => any,
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {

}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const filterManager = new FilterManager({...options, history});
    
    const INITIAL_STATE = filterManager.getStateFromURL();
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    filterManager.state = filterState;
    filterManager.dispatch = dispatch;
    filterManager.applyOrderInColumns();

    useEffect(() => {
        filterManager.replaceHistory();
    }, []);

    return {
        columns: filterManager.columns,
        filterManager,
        filterState, 
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema;
    state: FilterState = null as any;
    debouncedState: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter;

    constructor(options: FilterManagerOptions) {
        const {columns, rowsPerPage, rowsPerPageOptions, history, tableRef, extraFilter} = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.history = history;
        this.tableRef = tableRef;
        this.extraFilter = extraFilter;
        this.createValidationSchema();
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({search: value}))  
    } 
        
    changePage(page) {
        this.dispatch(Creators.setPage({page: page + 1})); 
    }

    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({per_page: perPage}))  
    }
    
    changeColumnSort(changeColumn: string, direction: string) {
        this.dispatch(Creators.setOrder({
                sort: changeColumn,
                dir: direction.includes('desc') ? 'desc': 'asc'
            })
        );
        // this.resetTablePagination();
    }

    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data));
    }

    resetFilter() {
        const INITIAL_STATE = {
            ...this.schema.cast({}),
            search: {value: null, update: true}
        };
        this.dispatch(Creators.setReset({
            state: INITIAL_STATE
        }));
        // this.resetTablePagination();
    }

    applyOrderInColumns() {
        this.columns = this.columns.map(column => {
            return column.name === this.state.order.sort 
            ? {
                ...column,
                options: {
                    ...column.options,
                    sortDirection: this.state.order.dir as any
                }
            } 
            : column;
        });
    }

    cleanSearchText (text) {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }

        return newText;
    }

    replaceHistory() {
        this.history.replace({
            pathname: this.history.location.pathname,
            search: '?' + new URLSearchParams(this.formatSearchParams() as any),
            state: this.debouncedState,
        })
    }

    pushHistory() {
        const newLocation = {
            pathName: this.history.location.pathname,
            search: '?' + new URLSearchParams(this.formatSearchParams() as any),
            state: {
                ...this.debouncedState,
                search: this.cleanSearchText(this.state.search)
            }
        };
        const oldState = this.history.location.state;
        const nextState = this.state;
        if(isEqual(oldState, nextState)) {
            return;
        }

        this.history.push(newLocation);
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.state.search);
        return {
            ...(search && search !== '' && {search: search}),
            ...(this.state.pagination.page !== 1 && {page: this.state.pagination.page}),
            ...(this.state.pagination.per_page !== 15 && {per_page: this.state.pagination.per_page}),
            ...(
                this.state.order.sort && {
                    sort: this.state.order.sort,
                    dir: this.state.order.dir
                }
            ),
            ...(this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)),
        }
    }

    getStateFromURL() {
        const queryParams = new URLSearchParams(this.history.location.search.substr(1));
        return this.schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page'),
            },
            order: {
                sort: queryParams.get('sort'),
                dir: queryParams.get('dir'),
            }, 
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromURL(queryParams)
                }
            )
        })
    }

    private createValidationSchema() {
        this.schema = yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .oneOf(this.rowsPerPageOptions)
                    .transform(value => isNaN(value) ? undefined : value)
                    .default(this.rowsPerPage),
            }),
            order: yup.object().shape({
                sort: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                dir: yup.string()
                    .nullable()
                    .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null),
            }), 
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            ),
        });
    }
}