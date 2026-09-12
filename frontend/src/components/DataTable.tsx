import React from 'react';
import { DataTable as BaseDataTable } from '../visuals/DataTable';
import type { DataTableProps } from '../visuals/types';

export const DataTable: React.FC<DataTableProps> = (props) => {
  return <BaseDataTable {...props} />;
};
export default DataTable;
