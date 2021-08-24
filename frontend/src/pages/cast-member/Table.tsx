// @flow 
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit'
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { MUIDataTableMeta } from 'mui-datatables';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import castMemberHttp from '../../utils/http/cast-member-http';
import { CastMember, ListResponse } from '../../utils/models';

const castMemberTypeMap = {
    0: 'Diretor',
    1: 'Ator'
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
        width: '13%',
        options: {
            sort: false,
            customBodyRender: (value, tableMeta: MUIDataTableMeta) => {
                return (
                    <IconButton
                        color="secondary"
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    }
];

const Table = () => {
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
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title=""
                data={data}
                columns={columnsDefinition}
                loading={loading}
            />
        </MuiThemeProvider>
    );
};

export default Table;