// pages/sales.jsx
import { useEffect, useState } from 'react';
import { fetchPumpSnos, fetchSaleData } from '../services/sales';
import { Box, Typography, Button, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Paper, FormControl, InputLabel } from '@mui/material';
import { format } from 'date-fns';

export default function SalesCalculator() {
  const [pumps, setPumps] = useState([]);
  const [selectedPump, setSelectedPump] = useState('');
  const [saleData, setSaleData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPumps = async () => {
      try {
        const data = await fetchPumpSnos();
        setPumps(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadPumps();
  }, []);

  const handleFetch = async () => {
    if (!selectedPump) return;
    setError('');
    try {
      const data = await fetchSaleData(selectedPump);
      setSaleData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Fuel Sale Calculator
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Select Pump</InputLabel>
          <Select
            value={selectedPump}
            onChange={(e) => setSelectedPump(e.target.value)}
            label="Select Pump"
          >
            {pumps.map((p, idx) => (
              <MenuItem key={idx} value={p.pump_sno}>
                {p.pump_sno}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleFetch}>
          Get Sale
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {saleData && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sale Data for Pump <strong>{saleData.pump_sno}</strong>
          </Typography>
          <Typography>
            <strong>Latest Entry:</strong>{' '}
            {saleData.latest_date
              ? format(new Date(saleData.latest_date), 'dd/MM/yyyy HH:mm:ss')
              : '-'}
          </Typography>
          <Typography>
            <strong>Previous Entry:</strong>{' '}
            {saleData.previous_date
              ? format(new Date(saleData.previous_date), 'dd/MM/yyyy HH:mm:ss')
              : '-'}
          </Typography>

          <Table size="small" sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nozzle</TableCell>
                <TableCell>Latest</TableCell>
                <TableCell>Previous</TableCell>
                <TableCell>Sale (Litres)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(saleData.sales).map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{val.latest ?? '-'}</TableCell>
                  <TableCell>{val.previous ?? '-'}</TableCell>
                  <TableCell>{val.sale ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
