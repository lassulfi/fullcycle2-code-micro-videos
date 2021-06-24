// @flow 
import { Chip } from '@material-ui/core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Page from '../../components/PageList';
import { FabProps, TableProps } from '../../components/PageList/PageList.interface';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

const fab: FabProps = {
    title: 'Adicionar gênero',
    component: Link,
    to: '/genres/create',
    size: 'small'
}

const table: TableProps = {
    title: 'Listagem de gêneros',
    route: 'genres',
    columnsDefinition: [
        {
            name: "name",
            label: "Nome"
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
}

const PageList = () => {
    return (
        <Page 
            pageTitle={'Listagem de gêneros'}
            boxDirection={'rtl'}
            fab={fab}
            table={table}      
        />
    );
};

export default PageList;