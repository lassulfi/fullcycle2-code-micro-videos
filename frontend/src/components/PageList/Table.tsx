// @flow 
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React from 'react';

interface TableProps {
    title: string;
    data?: any;
    columnsDefinition: MUIDataTableColumn[];
}
const Table: React.FC<TableProps> = (props) => {

    return (
        <MUIDataTable
            title={props.title}
            columns={props.columnsDefinition}
            data={props.data}
        />
    );
};

export default Table;