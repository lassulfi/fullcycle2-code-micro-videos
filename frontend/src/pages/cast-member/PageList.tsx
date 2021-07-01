// @flow 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../../components/PageList';
import { FabProps } from '../../components/PageList/PageList.interface';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableColumn } from 'mui-datatables';
import castMemberHttp from '../../utils/http/cast-member-http';

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

interface CastMember {
    id: string, 
    name: string,
    type: number
}

const PageList = () => {
    const [data, setData] = useState<CastMember[]>([]);

    castMemberHttp
        .list<{ data: CastMember[] }>()
        .then(({data}) => setData(data.data))

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