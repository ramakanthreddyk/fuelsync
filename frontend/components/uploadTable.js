import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const columns = [
  { field: 'original_filename', headerName: 'File Name', flex: 1 },
  { field: 'pump_sno', headerName: 'Pump Sno', flex: 1 },
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'time', headerName: 'Time', flex: 1 },
  { field: 'nozzle_1', headerName: 'Nozzle 1', flex: 1 },
  { field: 'nozzle_2', headerName: 'Nozzle 2', flex: 1 },
  { field: 'nozzle_3', headerName: 'Nozzle 3', flex: 1 },
  { field: 'nozzle_4', headerName: 'Nozzle 4', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
];

export default function UploadTable({ data }) {
  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.upload_id}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        pagination
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
