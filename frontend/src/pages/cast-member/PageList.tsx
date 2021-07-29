// @flow 
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Page, { FabProps } from '../../components/PageList';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import castMemberHttp from '../../utils/http/cast-member-http';
import { CastMember, ListResponse } from '../../utils/models';
import { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';

const castMemberTypeMap = {
    0: 'Diretor',
    1: 'Ator'
}

const fab: FabProps = {
    title: 'Adicionar membro de elencos',
    component: Link,
    to: '/cast-members/create',
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
        width: '42%'
    }, {
        name: "type",
        label: "Tipo",
        width: '5%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return castMemberTypeMap[value];
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
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
            pageTitle={'Listagem de membros do elenco'}
            boxDirection={'rtl'}
            fab={fab}
            tableTitle={'Listagem de membros de elencos'}
            data={data}
            columnsDefinition={columnsDefinition}
            loading={loading}
        />
    );
};

export default PageList;