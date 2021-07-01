// @flow 
import React, { useState } from 'react';
import { Chip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Page from '../../components/PageList';
import { FabProps } from '../../components/PageList/PageList.interface';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableColumn } from 'mui-datatables';
import genreHttp from '../../utils/http/genre-http';
import Genre from './genre-interface';

const fab: FabProps = {
    title: 'Adicionar gênero',
    component: Link,
    to: '/genres/create',
    size: 'small'
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    }, {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ')
            }
        }
    }, {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <Chip label={'Sim'} color={'primary'}/> : <Chip label={'Não'} color={'secondary'}/>;
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
]

const PageList = () => {
    const [data, setData] = useState<Genre[]>([]);

    genreHttp
        .list<{ data: Genre[] }>()
        .then(({data}) => setData(data.data));
    

    return (
        <Page 
            pageTitle={'Listagem de gêneros'}
            boxDirection={'rtl'}
            fab={fab}
            tableTitle={'Listagem de gêneros'}
            data={data}
            columnsDefinition={columnsDefinition} 
        />
    );
};

export default PageList;