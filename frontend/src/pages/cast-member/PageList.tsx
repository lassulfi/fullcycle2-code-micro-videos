// @flow 
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../../components/PageList';
import { FabProps } from '../../components/PageList/PageList.interface';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableColumn } from 'mui-datatables';
import castMemberHttp from '../../utils/http/cast-member-http';
import { CastMember, ListResponse } from '../../utils/models';

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

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    }, {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return castMemberTypeMap[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    }
];

const PageList = () => {
    const [data, setData] = useState<CastMember[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                if (isSubscribed) setData(data.data);
            } catch (error) {
                console.error(error);
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
        />
    );
};

export default PageList;