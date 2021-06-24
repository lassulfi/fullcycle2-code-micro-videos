// @flow 
import * as React from 'react';
import { PropTypes } from '@material-ui/core';
import { Link } from 'react-router-dom';
import MuiChip from '../../components/Chip';
import Page from '../../components/PageList';
import { FabProps, TableProps } from '../../components/PageList/PageList.interface';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

type MuiChipPropsType = {
    label: string;
    color: Exclude<PropTypes.Color, 'inherit'>
}

type TypeValue = {
    [key: number]: MuiChipPropsType
}

const typeValue: TypeValue = {
    0: {
        label: 'Diretor',
        color: 'secondary'
    }, 
    1: {
        label: 'Ator',
        color: 'primary'
    }, 
}

const renderChip = (value: number) => {
    const props = typeValue[value];
    return <MuiChip 
        label={props.label} 
        color={props.color}
    />
    }

const fab: FabProps = {
    title: 'Adicionar membro do elenco',
    component: Link,
    to: '/cast_members/create',
    size: 'small'
}

const table: TableProps = {
    title: 'Listagem de membros do elenco',
    route: 'cast_members',
    columnsDefinition: [
        {
            name: "name",
            label: "Nome"
        }, {
            name: "type",
            label: "Tipo",
            options: {
                customBodyRender(value, tableMeta, updateValue) {
                    return renderChip(value);
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
            pageTitle={'Listagem de membros do elenco'}
            boxDirection={'rtl'}
            fab={fab}
            table={table}
        />
    );
};

export default PageList;