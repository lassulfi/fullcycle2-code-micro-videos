// @flow 
import React, { useEffect, useState } from 'react';
import { Chip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Page, { FabProps } from '../../components/PageList';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import genreHttp from '../../utils/http/genre-http';
import { Genre, ListResponse } from '../../utils/models';
import { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';

const fabProps: FabProps = {
    title: 'Adicionar gênero',
    component: Link,
    to: '/genres/create',
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
        width: '15%'
    }, {
        name: "categories",
        label: "Categorias",
        width: '28%',
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ')
            }
        }
    }, {
        name: "is_active",
        label: "Ativo?",
        width: '4%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <Chip label={'Sim'} color={'primary'}/> : <Chip label={'Não'} color={'secondary'}/>;
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
]

const PageList = () => {
    const snackbar = useSnackbar();
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await genreHttp.list<ListResponse<Genre>>();
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
            pageTitle={'Listagem de gêneros'}
            boxDirection={'rtl'}
            fab={fabProps}
            tableTitle={'Listagem de gêneros'}
            data={data}
            columnsDefinition={columnsDefinition} 
            loading={loading}
        />
    );
};

export default PageList;