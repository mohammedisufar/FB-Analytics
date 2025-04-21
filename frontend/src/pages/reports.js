import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { getFacebookAccounts, setSelectedAccount } from '../redux/slices/facebookSlice';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    selectedAccount, 
    loading, 
    error 
  } = useSelector((state) => state.facebook);
  
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [savedReports, setSavedReports] = useState([
    { 
      id: '1', 
      name: 'Monthly Performance Report', 
      type: 'performance', 
      createdAt: '2023-07-01', 
      lastRun: '2023-07-15',
      schedule: 'Monthly'
    },
    { 
      id: '2', 
      name: 'Campaign Comparison', 
      type: 'campaign', 
      createdAt: '2023-06-15', 
      lastRun: '2023-07-10',
      schedule: 'Weekly'
    },
    { 
      id: '3', 
      name: 'Audience Insights', 
      type: 'audience', 
      createdAt: '2023-05-20', 
      lastRun: '2023-07-05',
      schedule: 'Monthly'
    }
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportSchedule, setNewReportSchedule] = useState('none');
  
  // Fetch Facebook accounts on component mount
  useEffect(() => {
    dispatch(getFacebookAccounts());
  }, [dispatch]);
  
  // Set first ad account as selected when accounts are loaded
  useEffect(() => {
    if (selectedAccount && selectedAccount.adAccounts && selectedAccount.adAccounts.length > 0 && !selectedAdAccount) {
      setSelectedAdAccount(selectedAccount.adAccounts[0].id);
    }
  }, [selectedAccount, selectedAdAccount]);
  
  const handleAccountChange = (event) => {
    const accountId = event.target.value;
    const account = accounts.find(acc => acc.id === accountId);
    dispatch(setSelectedAccount(account));
    setSelectedAdAccount('');
  };
  
  const handleAdAccountChange = (event) => {
    setSelectedAdAccount(event.target.value);
  };
  
  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };
  
  const handleStartDateChange = (date) => {
    setDateRange({
      ...dateRange,
      startDate: date
    });
  };
  
  const handleEndDateChange = (date) => {
    setDateRange({
      ...dateRange,
      endDate: date
    });
  };
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewReportName('');
    setNewReportSchedule('none');
  };
  
  const handleSaveReport = () => {
    // In a real implementation, this would save the report configuration
    const newReport = {
      id: `${savedReports.length + 1}`,
      name: newReportName,
      type: reportType,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      lastRun: format(new Date(), 'yyyy-MM-dd'),
      schedule: newReportSchedule
    };
    
    setSavedReports([...savedReports, newReport]);
    handleCloseDialog();
  };
  
  const handleDeleteReport = (reportId) => {
    // In a real implementation, this would delete the report
    setSavedReports(savedReports.filter(report => report.id !== reportId));
  };
  
  const handleGenerateReport = () => {
    // In a real implementation, this would generate the report
    console.log('Generating report with the following parameters:');
    console.log('Ad Account:', selectedAdAccount);
    console.log('Report Type:', reportType);
    console.log('Date Range:', dateRange);
  };
  
  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'performance':
        return 'Performance Report';
      case 'campaign':
        return 'Campaign Report';
      case 'audience':
        return 'Audience Report';
      case 'conversion':
        return 'Conversion Report';
      default:
        return 'Custom Report';
    }
  };
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="facebook-account-label">Facebook Account</InputLabel>
                  <Select
                    labelId="facebook-account-label"
                    id="facebook-account"
                    value={selectedAccount ? selectedAccount.id : ''}
                    label="Facebook Account"
                    onChange={handleAccountChange}
                    disabled={loading || accounts.length === 0}
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.name || account.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="ad-account-label">Ad Account</InputLabel>
                  <Select
                    labelId="ad-account-label"
                    id="ad-account"
                    value={selectedAdAccount}
                    label="Ad Account"
                    onChange={handleAdAccountChange}
                    disabled={loading || !selectedAccount || !selectedAccount.adAccounts || selectedAccount.adAccounts.length === 0}
                  >
                    {selectedAccount && selectedAccount.adAccounts && selectedAccount.adAccounts.map((adAccount) => (
                      <MenuItem key={adAccount.id} value={adAccount.id}>
                        {adAccount.name || adAccount.facebookAdAccountId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="report-type-label">Report Type</InputLabel>
                  <Select
                    labelId="report-type-label"
                    id="report-type"
                    value={reportType}
                    label="Report Type"
                    onChange={handleReportTypeChange}
                  >
                    <MenuItem value="performance">Performance Report</MenuItem>
                    <MenuItem value="campaign">Campaign Report</MenuItem>
                    <MenuItem value="audience">Audience Report</MenuItem>
                    <MenuItem value="conversion">Conversion Report</MenuItem>
                    <MenuItem value="custom">Custom Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={handleOpenDialog}
                  startIcon={<AddIcon />}
                  disabled={!selectedAdAccount}
                >
                  Save Report
                </Button>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.endDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleGenerateReport}
                  disabled={!selectedAdAccount}
                  sx={{ mr: 2 }}
                >
                  Generate Report
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={!selectedAdAccount}
                  sx={{ mr: 2 }}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  disabled={!selectedAdAccount}
                >
                  Print
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Saved Reports
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{getReportTypeLabel(report.type)}</TableCell>
                        <TableCell>{report.createdAt}</TableCell>
                        <TableCell>{report.lastRun}</TableCell>
                        <TableCell>{report.schedule}</TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <ShareIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* Save Report Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Report Name"
              variant="outlined"
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="schedule-label">Schedule</InputLabel>
              <Select
                labelId="schedule-label"
                id="schedule"
                value={newReportSchedule}
                label="Schedule"
                onChange={(e) => setNewReportSchedule(e.target.value)}
              >
                <MenuItem value="none">No Schedule</MenuItem>
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary">
              Report Configuration:
            </Typography>
            <Typography variant="body2">
              Type: {getReportTypeLabel(reportType)}
            </Typography>
            <Typography variant="body2">
              Date Range: {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveReport}
            disabled={!newReportName}
          >
            Save Report
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default withAuth(ReportsPage, ['reports:read']);
