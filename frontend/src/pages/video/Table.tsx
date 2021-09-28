// @flow 
import React, { useContext, useEffect, useRef, useState } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableMeta } from 'mui-datatables';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from '../../components/Table';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit'
import { Category, Genre, ListResponse, Video } from '../../utils/models';
import videoHttp from '../../utils/http/video-http';
import { useSnackbar } from 'notistack';
import categoryHttp from '../../utils/http/category-http';
import useFilter from '../../hooks/useFilter';
import * as yup from '../../utils/vendor/yup';
import FilterResetButton from '../../components/Table/FilterResetButton';
import genreHttp from '../../utils/http/genre-http';
import { ServerSideFilteredListUtils } from '../../utils/server-side-filter-list';
import { union } from 'lodash';
import DeleteDialog from '../../components/DeleteDialog';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import LoadingContext from '../../components/loading/LoadingContext';

const columnDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%', 
        options: {
            sort: false,
            filter: false,
        }
    }, {
        name: 'title',
        label: 'Título',
        width: '20%',
        options: {
            filter: false
        }
    }, {
        name: 'genres',
        label: 'Gêneros',
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ');
            }
        }
    }, {
        name: 'categories',
        label: 'Categorias', 
        width: '16%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ');
            }
        }
    }, {
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
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    }
];

const errorLoadingDataMessage: string = 'Não foi possível carregar as informações';

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {
    const subscribed = useRef(true);
    const snackbar = useSnackbar();
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const {
        columns, 
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef
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
        try {
            const {data} = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total)
                if(openDeleteDialog) {
                    setOpenDeleteDialog(false);
                }
            }
        } catch (error) {
            console.error(error);
            if (videoHttp.isRequestCancelled(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                errorLoadingDataMessage,
                {
                    variant: 'error',
                }
            )
        }
    }

    function deleteRows(confirmed: boolean) {
        if(!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',');
        videoHttp
            .deleteCollection({ids})
            .then(response => {
                snackbar.enqueueSnackbar(
                    'Registros(s) excluído(s) com sucesso!',
                    {variant: 'success'}
                );
                if(
                    rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page - 2;
                    filterManager.changePage(page);
                } else {
                    getData().then(() => setOpenDeleteDialog(false));
                }
            })
            .catch(error => {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível excluir os registros',
                    {variant: 'error'}
                )
            });
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                title=""
                data={data}
                columns={columnDefinition}
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
                        filterManager.changeColumnSort(changeColumn, direction),
                    onRowsDelete: (rowsDeleted: any) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;
                    },
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;