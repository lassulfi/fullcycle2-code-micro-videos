// @flow 
import * as React from 'react';
// import { Box, Fab, PropTypes } from '@material-ui/core';
import { Link } from 'react-router-dom';
// import { Page } from '../../components/Page';
// import AddIcon from '@material-ui/icons/Add';
// import Table from './Table';
import Page from '../../components/PageList';
import { FabProps, TableProps } from '../../components/PageList/PageList.interface';
import MuiChip from '../../components/Chip';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { PropTypes } from '@material-ui/core';

type MuiChipPropsType = {
    label: string;
    color: Exclude<PropTypes.Color, 'inherit'>
}

type IsActiveValue = {
    [key: string]: MuiChipPropsType
}

const typeValue: IsActiveValue = {
    'true': {
        label: 'Sim',
        color: 'primary'
    }, 
    'false': {
        label: 'Não',
        color: 'secondary'
    }, 
}

const renderChip = (value: string) => {
    const props = typeValue[value];
    return <MuiChip 
        label={props.label} 
        color={props.color}
    />
    }

const fab: FabProps = {
    title: 'Adicionar categoria',
    component: Link,
    to: '/categories/create',
    size: 'small'
}

const table: TableProps = {
    title: 'Listagem de categorias',
    route: 'categories',
    columnsDefinition: [
        {
            name: "name",
            label: "Nome"
        }, {
            name: "is_active",
            label: "Ativo?",
            options: {
                customBodyRender(value, tableMeta, updateValue) {
                    return renderChip(String(value));
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
            pageTitle={'Listagem categorias'}
            boxDirection={'rtl'}
            fab={fab}
            table={table}
        />
    );
}

// const PageList = () => {
//     return (
//         <Page title={'Listagem categorias'}>
//             <Box dir={'rtl'}>
//                 <Fab
//                     title={'Adicionar categoria'}
//                     size={'small'}
//                     component={Link}
//                     to={'/categories/create'}
//                 >
//                     <AddIcon/>
//                 </Fab>
//             </Box>
//             <Box>
//                 <Table/>
//             </Box>
//         </Page>
//     );
// };

export default PageList;