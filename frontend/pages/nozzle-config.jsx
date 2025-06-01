// frontend/pages/nozzle-config.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Box, Typography, Button, Paper, Grid, Snackbar, Alert } from '@mui/material';
import FuelPrices from './fuel-prices';

export default function NozzleConfigPage() {
  const [pumps, setPumps] = useState([]);
  const [selectedPump, setSelectedPump] = useState(null);
  const [config, setConfig] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showFuelPrices, setShowFuelPrices] = useState(false);

  useEffect(() => {
    const fetchPumps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/sales/pumps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pumpOptions = res.data.map(p => ({ value: p.pump_sno, label: `Pump ${p.pump_sno}` }));
        setPumps(pumpOptions);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPumps();
  }, []);

  const handleConfigChange = (nozzle, fuelType) => {
    setConfig(prev => ({ ...prev, [nozzle]: fuelType.value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/config/${selectedPump.value}`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Configuration saved successfully!');
      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setMessage('Error saving configuration');
      setOpenSnackbar(true);
    }
  };

  const fuelOptions = [
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Configure Nozzles</Typography>

      <Button variant="contained" color="success" onClick={() => setShowFuelPrices(v => !v)} sx={{ mb: 2 }}>
        {showFuelPrices ? 'Hide Fuel Prices' : 'Set Fuel Prices'}
      </Button>

      {showFuelPrices && (
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <FuelPrices />
        </Paper>
      )}

      <Box mb={3}>
        <Typography variant="subtitle1">Select Pump:</Typography>
        <Select
          options={pumps}
          value={selectedPump}
          onChange={setSelectedPump}
          placeholder="Select Pump"
          isClearable
        />
      </Box>

      {selectedPump && (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(nozzle => (
            <Grid item xs={12} sm={6} key={nozzle}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1">Nozzle {nozzle}:</Typography>
                <Select
                  options={fuelOptions}
                  value={fuelOptions.find(f => f.value === config[nozzle]) || null}
                  onChange={(e) => handleConfigChange(nozzle, e)}
                  placeholder="Select Fuel"
                  isClearable
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        disabled={!selectedPump}
        onClick={handleSave}
      >
        Save Configuration
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={message.includes('Error') ? 'error' : 'success'} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
