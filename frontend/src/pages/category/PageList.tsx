// @flow 
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Page, { FabProps, SearchState } from '../../components/PageList';
import { BadgeYes, BadgeNo } from '../../components/Navbar/Badge';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../utils/http/category-http';
import { Category, ListResponse } from '../../utils/models';
import { useEffect } from 'react';
import { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';
import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { MUIDataTableMeta } from 'mui-datatables';

const fab: FabProps = {
    title: 'Adicionar categoria',
    component: Link,
    to: '/categories/create',
    size: 'small'
}

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID', 
        width: '30%',
        options: {
            sort: false
        }
    }, {
        name: "name",
        label: "Nome",
        width: "43%"
    }, {
        name: "is_active",
        label: "Ativo?",
        width: '4%',
        options: {
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

const PageList = () => {
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>({
        search: '', 
        pagination: {
            page: 1,
            total: 0,
            per_page: 10,
        }
    });
    
    useEffect(() => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page
    ]);

    async function getData() {
        setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>({
                    queryParams: {
                        search: searchState.search,
                        page: searchState.pagination.page,
                        per_page: searchState.pagination.per_page,
                    }
                });
                if (subscribed.current) {
                    setData(data.data);
                    setSearchState(prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            total: data.meta.total
                        }
                    }))
                }
            } catch (error) {
                console.error(error);
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
        <Page 
            pageTitle={'Listagem categorias'}
            boxDirection={'rtl'}
            data = {data}
            fab={fab}
            tableTitle={'Listagem categorias'}
            columnsDefinition={columnsDefinition}
            loading={loading}
            searchStateProps={{
                searchState,
                setSearchState
            }}
        />
    );
}

export default PageList;