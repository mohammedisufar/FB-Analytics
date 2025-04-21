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
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { 
  getFacebookAccounts, 
  setSelectedAccount, 
  syncAdAccounts, 
  getCampaigns 
} from '../redux/slices/facebookSlice';

const CampaignsPage = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    selectedAccount, 
    adAccounts, 
    campaigns, 
    loading, 
    error 
  } = useSelector((state) => state.facebook);
  
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Fetch campaigns when ad account is selected
  useEffect(() => {
    if (selectedAdAccount) {
      dispatch(getCampaigns(selectedAdAccount));
    }
  }, [dispatch, selectedAdAccount]);
  
  const handleAccountChange = (event) => {
    const accountId = event.target.value;
    const account = accounts.find(acc => acc.id === accountId);
    dispatch(setSelectedAccount(account));
    setSelectedAdAccount('');
  };
  
  const handleAdAccountChange = (event) => {
    setSelectedAdAccount(event.target.value);
  };
  
  const handleSyncAdAccounts = () => {
    if (selectedAccount) {
      dispatch(syncAdAccounts(selectedAccount.id));
    }
  };
  
  const handleStatusChange = (event) => {
    setCampaignStatus(event.target.value);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
  
  // Filter campaigns based on search term and status
  const filteredCampaigns = selectedAdAccount && campaigns[selectedAdAccount] 
    ? campaigns[selectedAdAccount].filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = campaignStatus === 'all' || campaign.status === campaignStatus;
        return matchesSearch && matchesStatus;
      })
    : [];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'DELETED':
      case 'ARCHIVED':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatBudget = (campaign) => {
    if (campaign.dailyBudget) {
      return `$${(campaign.dailyBudget / 100).toFixed(2)}/day`;
    } else if (campaign.lifetimeBudget) {
      return `$${(campaign.lifetimeBudget / 100).toFixed(2)} lifetime`;
    } else {
      return 'No budget set';
    }
  };
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Campaigns
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
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
                <Button 
                  variant="outlined" 
                  onClick={handleSyncAdAccounts}
                  disabled={loading || !selectedAccount}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Sync Ad Accounts'}
                </Button>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={loading || !selectedAdAccount}
                  fullWidth
                >
                  Create Campaign
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Campaigns"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    value={campaignStatus}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PAUSED">Paused</MenuItem>
                    <MenuItem value="DELETED">Deleted</MenuItem>
                    <MenuItem value="ARCHIVED">Archived</MenuItem>
                  </Select>
                </FormControl>
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
            </Grid>
          </CardContent>
        </Card>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredCampaigns.length > 0 ? (
              <Grid container spacing={3}>
                {filteredCampaigns.map((campaign) => (
                  <Grid item xs={12} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="div">
                              {campaign.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              ID: {campaign.id}
                            </Typography>
                            <Chip 
                              label={campaign.status} 
                              color={getStatusColor(campaign.status)} 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={campaign.objective} 
                              variant="outlined" 
                              size="small" 
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              Budget
                            </Typography>
                            <Typography variant="body1">
                              {formatBudget(campaign)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              Start Date
                            </Typography>
                            <Typography variant="body1">
                              {campaign.startTime ? format(new Date(campaign.startTime), 'MMM d, yyyy') : 'Not set'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              End Date
                            </Typography>
                            <Typography variant="body1">
                              {campaign.endTime ? format(new Date(campaign.endTime), 'MMM d, yyyy') : 'Not set'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                sx={{ mr: 1 }}
                              >
                                View Details
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                              >
                                {campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      No campaigns found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedAdAccount 
                        ? 'Try adjusting your filters or create a new campaign' 
                        : 'Please select an ad account to view campaigns'}
                    </Typography>
                    {selectedAdAccount && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                      >
                        Create Campaign
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </Layout>
  );
};

export default withAuth(CampaignsPage, ['campaigns:read']);
