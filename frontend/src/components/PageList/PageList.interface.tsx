import * as React from 'react';
import { MUIDataTableColumn } from "mui-datatables";

export interface FabProps {
    title: string;
    size?: "small" | "medium" | "large";
    component: React.ElementType;
    to: string;
}

export interface PageListProps {
    pageTitle: string;
    boxDirection: string;
    data: any;
    fab: FabProps;
    tableTitle: string;
    columnsDefinition: MUIDataTableColumn[];
}