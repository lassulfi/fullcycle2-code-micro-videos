// @flow 
import { Chip } from '@material-ui/core';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React, {useEffect, useState} from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../utils/http/category-http';
import { Category, ListResponse } from '../../utils/models';

const columnsDefinition: MUIDataTableColumn[] = [
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

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>();
                if (isSubscribed) setData(data.data);
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, []);

    return (
        <MUIDataTable
            title={'Listagem de categorias'}
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;