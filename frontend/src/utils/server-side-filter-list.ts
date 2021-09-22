import { TableColumn } from "../components/Table";
import { State } from "../store/filter/types";

interface ServerSideFilterListOptions {
    tableColumns: TableColumn[];
    filterState: State;
}

export class ServerSideFilteredListUtils {
    columnIndex: number = null as any;
    tableColumns: TableColumn[];
    filterState: State;
    tableColumn: TableColumn = null as any;
    serverSideFilterList;
    
    constructor(options: ServerSideFilterListOptions) {
        const {tableColumns, filterState} = options;
        this.tableColumns = tableColumns;
        this.filterState = filterState;
        this.serverSideFilterList = this.tableColumns.map(column => []);
    }

    getFilteredColumn(columnName: string): TableColumn {
        const columnIndex = this.getFilteredColumnIndex(columnName);
        this.columnIndex = columnIndex;
        return this.tableColumns[columnIndex];
    }

    filterListByColumnName(columnName: string) {
        const tableColumn = this.getFilteredColumn(columnName);

        const filterValue = this.filterState.extraFilter 
            && this.filterState.extraFilter[columnName];

        (tableColumn.options as any).filterList = filterValue ? filterValue : [];
        if (filterValue) {
            this.serverSideFilterList[this.columnIndex] = filterValue;
        }

        return this;
    }

    private getFilteredColumnIndex(columnName: string): number {
        return this.tableColumns.findIndex(c => c.name === columnName);
    }

    get ServerSideFilteredList() {
        return this.serverSideFilterList;
    }
}