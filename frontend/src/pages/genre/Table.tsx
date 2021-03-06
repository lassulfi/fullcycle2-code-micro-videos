// @flow 
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableMeta } from 'mui-datatables';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Navbar/Badge';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from '../../components/Table';
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';
import { Category, Genre, ListResponse } from '../../utils/models';
import genreHttp from '../../utils/http/genre-http';
import useFilter from '../../hooks/useFilter';
import * as yup from '../../utils/vendor/yup';
import categoryHttp from '../../utils/http/category-http';
import FilterResetButton from '../../components/Table/FilterResetButton';
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID', 
        width: '30%',
        options: {
            sort: false,
            filter: false,
        }
    }, {
        name: "name",
        label: "Nome",
        width: '15%',
        options: {
            filter: false,
        }
    }, {
        name: "categories",
        label: "Categorias",
        width: '28%',
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ')
            }
        }
    }, {
        name: "is_active",
        label: "Ativo?",
        width: '4%',
        options: {
            filterOptions: {
                names: ['Sim', 'Não']
            },
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: '10%',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    }, {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta: MUIDataTableMeta) => {
                return (
                    <IconButton
                        color="secondary"
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    }
];

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {
    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Genre[]>([]);
    const loading = useContext(LoadingContext);
    const [categories, setCategories] = useState<Category[]>();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => (
        {
            createValidationSchema: () => {
                return yup.object().shape({
                    type: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null)
                })
            }, 
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter 
                ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                            {categories: debouncedState.extraFilter.categories.join(',')}
                    )
                } 
                : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    categories: queryParams.get('categories')
                }
            }
        }
    ), []);
    const {
        columns,
        filterManager,
        cleanSearchText,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter
    });
    const searchText = cleanSearchText(debouncedFilterState.search);

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue
        ? categoriesFilterValue
        : [];
    const serverSideFilterList = columns.map(column => []);
    if (categoriesFilterValue) {
        serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
    }

    const getCategories = useCallback(async () => {
        try {
            const {data} = await categoryHttp.list({queryParams: {all: ''}});
            if (subscribed.current) {
                setCategories(data.data);
                (columnCategories.options as any).filterOptions.names = 
                    data.data.map(category => category.name);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                'Não foi possível carregar as informações',
                {
                    variant: 'error'
                }
            );
        }
    }, [columnCategories.options, enqueueSnackbar]);

    useEffect(() => {
        subscribed.current = true;
        getCategories();

        return () => {
            subscribed.current = false
        }
    }, [getCategories]);

    const getData = useCallback(async ({search, page, per_page, sort, dir, categories}) => {
        try {
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(
                        categories &&
                        {categories: categories.join(',')}
                    )
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            };
        } catch (error) {
            console.error(error);
            if (genreHttp.isRequestCancelled(error)) {
                return;
            }
            enqueueSnackbar(
                'Não foi possível carregar as informações',
                {
                    variant: 'error'
                }
            );
        }
    }, [setTotalRecords, enqueueSnackbar]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
            ...(
                debouncedFilterState.extraFilter &&
                debouncedFilterState.extraFilter.categories &&
                {categories: debouncedFilterState.extraFilter.categories}
            )
        });  
        return () => {
            subscribed.current = false;
        }
    }, [
        getData,
        searchText,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        debouncedFilterState.extraFilter,
    ]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title=""
                data={data}
                columns={columnsDefinition}
                loading={loading}
                debouncedSearchTime={debouncedSearchTime}
                options={{
                    serverSideFilterList,
                    serverSide: true,
                    responsive: 'scrollMaxHeight',
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton 
                            handleClick={() => filterManager.resetFilter()}
                        />
                        ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changeColumn: string, direction: string) => 
                        filterManager.changeColumnSort(changeColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;