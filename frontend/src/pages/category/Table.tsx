// @flow 
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { MUIDataTableMeta } from 'mui-datatables';
import React, {useEffect, useRef, useState} from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../utils/http/category-http';
import { Category, ListResponse } from '../../utils/models';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from '../../components/Table';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit'
import { useSnackbar } from 'notistack';
import FilterResetButton from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import { BadgeNo, BadgeYes } from '../../components/Navbar/Badge';

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
        width: "43%",
        options: {
            filter: false,
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
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
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
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const {
        columns,
        filterManager,
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
    });
  
    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        filterManager.cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order
    ]);

    async function getData() {
        setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>({
                    queryParams: {
                        search: filterManager.cleanSearchText(debouncedFilterState.search),
                        page: debouncedFilterState.pagination.page,
                        per_page: debouncedFilterState.pagination.per_page,
                        sort: debouncedFilterState.order.sort,
                        dir: debouncedFilterState.order.dir,
                    }
                });
                if (subscribed.current) {
                    setData(data.data);
                    setTotalRecords(data.meta.total);
                }
            } catch (error) {
                console.error(error);
                if (categoryHttp.isRequestCancelled(error)) {
                    return;
                }
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {
                        variant: 'error'
                    }
                );
            } finally {
                setLoading(false);
            }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
                    <DefaultTable 
                        title=""
                        data={data}
                        columns={columns}
                        loading={loading}
                        debouncedSearchTime={debouncedSearchTime}
                        options={{
                            serverSide: true,
                            responsive: 'scrollMaxHeight',
                            searchText: filterState.search as any,
                            page: filterState.pagination.page - 1,
                            rowsPerPage: filterState.pagination.per_page,
                            rowsPerPageOptions,
                            count: totalRecords,
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