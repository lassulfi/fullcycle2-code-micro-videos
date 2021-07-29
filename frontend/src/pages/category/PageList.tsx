// @flow 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Page, { FabProps } from '../../components/PageList';
import { BadgeYes, BadgeNo } from '../../components/Navbar/Badge';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../utils/http/category-http';
import { Category, ListResponse } from '../../utils/models';
import { useEffect } from 'react';
import { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';

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
        width: '13%'
    }
];

const PageList = () => {
    const snackbar = useSnackbar();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>();
                if (isSubscribed) setData(data.data);
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
        })();

        return () => {
            isSubscribed = false;
        }
    }, [])

    return (
        <Page 
            pageTitle={'Listagem categorias'}
            boxDirection={'rtl'}
            data = {data}
            fab={fab}
            tableTitle={'Listagem categorias'}
            columnsDefinition={columnsDefinition}
            loading={loading}
        />
    );
}

export default PageList;