// @flow 
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React, {useEffect, useState} from 'react';
import { httpVideo } from '../../utils/http';

interface TableProps {
    title: string;
    route: string;
    columnsDefinition: MUIDataTableColumn[];
}

const Table: React.FC<TableProps> = (props) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get(props.route).then(
            response => setData(response.data.data)
        )
    }, []);

    return (
        <MUIDataTable
            title={props.title}
            columns={props.columnsDefinition}
            data={data}
        />
    );
};

export default Table;