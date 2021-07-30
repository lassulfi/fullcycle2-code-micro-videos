// @flow 
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps} from 'mui-datatables'; 
import {merge, omit, cloneDeep} from 'lodash';
import { MuiThemeProvider, Theme, useMediaQuery, useTheme } from '@material-ui/core';

export interface TableColumn extends MUIDataTableColumn {
    width?: string
}

const defaultOptions: MUIDataTableOptions = {
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: 'Nenhum registro encontrado',
            toolTip: 'Classificar'
        }, 
        pagination: {
            next: 'Próxima página',
            previous: 'Página anterior',
            rowsPerPage: 'Por página:',
            displayRows: 'de',
        }, 
        toolbar: {
            search: 'Busca',
            downloadCsv: 'Download CSV',
            print: 'Imprimir',
            viewColumns: 'Ver Colunas',
            filterTable: 'Filtrar Tabelas',
        }, 
        filter: {
            all: 'Todos',
            title: 'FILTROS',
            reset: 'LIMPAR'
        }, 
        viewColumns: {
            title: 'Ver Colunas',
            titleAria: 'Ver/Esconder Colunas da Tabela'
        }, 
        selectedRows: {
            text: 'registro(s) selecionados',
            delete: 'Excluir',
            deleteAria: 'Excluir registros selecionados'
        },
    },
}

export interface TableProps extends MUIDataTableProps {
    columns: TableColumn[];
    loading?: boolean;
}

export const makeActionStyles = (column) => {
    return theme => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testid^="MuiDataTableBodyCell-${column}"]`;
        (copyTheme.overrides as any).MUIDataTableBodyCell.root[selector] = {
            paddingTop: '0px',
            paddingBottom: '0px'
        };
        
        return copyTheme;
    }
}

const Table: React.FC<TableProps> = (props) => {
    
    const extractDataTableColumns = (columns: TableColumn[]): MUIDataTableColumn[] => {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'));
    }

    const setColumnsWidth = (columns: TableColumn[]): void => {
        columns.forEach((column, key) => {
            if (column.width) {
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key + 2})`] = {
                    width: column.width
                }
            }
        })
    }

    const applyLoading = (): void => {
        const textLabels =  (newProps.options as any).textLabels;
        textLabels.body.noMatch = newProps.loading === true
                ? 'Carregando...'
                : textLabels.body.noMatch;
    }

    const applyResponsive = (): void => {
        newProps.options.responsive = isSmOrDown ? 'scrollMaxHeight' : 'stacked';
    }

    const getOriginalMuiDataTableProps = () => omit(newProps, 'loading')
    
    const theme = cloneDeep<Theme>(useTheme());
    const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));
    const newProps = merge(
        {options: cloneDeep(defaultOptions)}, 
        props, 
        {columns: extractDataTableColumns(props.columns)});

    applyLoading();
    applyResponsive();

    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps}/>
        </MuiThemeProvider>
    );
};

export default Table;