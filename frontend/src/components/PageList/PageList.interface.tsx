import * as React from 'react';
import { MUIDataTableColumn } from "mui-datatables";

export interface FabProps {
    title: string;
    size?: "small" | "medium" | "large";
    component: React.ElementType;
    to: string;
}

export interface TableProps {
    title: string;
    route: string;
    columnsDefinition: MUIDataTableColumn[];
}

export interface PageListProps {
    pageTitle: string;
    boxDirection: string;
    fab: FabProps;
    table: TableProps;
}