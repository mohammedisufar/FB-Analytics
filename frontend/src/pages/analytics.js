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
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { 
  getFacebookAccounts, 
  setSelectedAccount, 
  getInsights 
} from '../redux/slices/facebookSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    selectedAccount, 
    insights, 
    loading, 
    error 
  } = useSelector((state) => state.facebook);
  
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [tabValue, setTabValue] = useState(0);
  const [timeFrame, setTimeFrame] = useState('day');
  
  // Sample data for when real data isn't available yet
  const samplePerformanceData = [
    { date: '2023-04-01', impressions: 4000, clicks: 240, spend: 120, ctr: 6.0 },
    { date: '2023-04-02', impressions: 3000, clicks: 198, spend: 100, ctr: 6.6 },
    { date: '2023-04-03', impressions: 2000, clicks: 98, spend: 50, ctr: 4.9 },
    { date: '2023-04-04', impressions: 2780, clicks: 208, spend: 90, ctr: 7.5 },
    { date: '2023-04-05', impressions: 1890, clicks: 148, spend: 70, ctr: 7.8 },
    { date: '2023-04-06', impressions: 2390, clicks: 198, spend: 85, ctr: 8.3 },
    { date: '2023-04-07', impressions: 3490, clicks: 301, spend: 110, ctr: 8.6 },
  ];
  
  const sampleDemographicData = [
    { name: '18-24', male: 400, female: 300 },
    { name: '25-34', male: 300, female: 400 },
    { name: '35-44', male: 200, female: 240 },
    { name: '45-54', male: 100, female: 120 },
    { name: '55+', male: 80, female: 100 },
  ];
  
  const samplePlacementData = [
    { name: 'Facebook Feed', value: 400 },
    { name: 'Instagram Feed', value: 300 },
    { name: 'Facebook Stories', value: 150 },
    { name: 'Instagram Stories', value: 200 },
    { name: 'Marketplace', value: 100 },
    { name: 'Search', value: 50 },
  ];
  
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
  
  // Fetch insights when ad account is selected
  useEffect(() => {
    if (selectedAdAccount) {
      dispatch(getInsights({
        adAccountId: selectedAdAccount,
        params: {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
          timeIncrement: timeFrame === 'day' ? 1 : timeFrame === 'week' ? 7 : 30
        }
      }));
    }
  }, [dispatch, selectedAdAccount, dateRange, timeFrame]);
  
  const handleAccountChange = (event) => {
    const accountId = event.target.value;
    const account = accounts.find(acc => acc.id === accountId);
    dispatch(setSelectedAccount(account));
    setSelectedAdAccount('');
  };
  
  const handleAdAccountChange = (event) => {
    setSelectedAdAccount(event.target.value);
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
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };
  
  // Get actual insights data or use sample data
  const performanceData = selectedAdAccount && insights[selectedAdAccount] 
    ? insights[selectedAdAccount].map(insight => ({
        date: format(new Date(insight.date), 'yyyy-MM-dd'),
        impressions: insight.impressions || 0,
        clicks: insight.clicks || 0,
        spend: insight.spend || 0,
        ctr: insight.clicks && insight.impressions ? (insight.clicks / insight.impressions * 100).toFixed(2) : 0
      }))
    : samplePerformanceData;
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics
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
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="time-frame-label">Time Frame</InputLabel>
                  <Select
                    labelId="time-frame-label"
                    id="time-frame"
                    value={timeFrame}
                    label="Time Frame"
                    onChange={handleTimeFrameChange}
                  >
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={2}>
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
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Performance" {...a11yProps(0)} />
              <Tab label="Demographics" {...a11yProps(1)} />
              <Tab label="Placements" {...a11yProps(2)} />
              <Tab label="Devices" {...a11yProps(3)} />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Impressions
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Clicks
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Spend
                      </Typography>
                      <Typography variant="h4">
                        ${performanceData.reduce((sum, item) => sum + item.spend, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        CTR
                      </Typography>
                      <Typography variant="h4">
                        {(performanceData.reduce((sum, item) => sum + item.clicks, 0) / 
                          performanceData.reduce((sum, item) => sum + item.impressions, 0) * 100).toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Over Time
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={performanceData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="impressions"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Spend Over Time
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={performanceData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="spend" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        CTR Over Time
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={performanceData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ctr" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Age and Gender Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={sampleDemographicData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="male" fill="#8884d8" name="Male" />
                          <Bar dataKey="female" fill="#82ca9d" name="Female" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Placement Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={samplePlacementData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {samplePlacementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Placement Performance
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={[
                            { name: 'Facebook Feed', impressions: 400000, clicks: 12000, ctr: 3.0 },
                            { name: 'Instagram Feed', impressions: 300000, clicks: 9000, ctr: 3.0 },
                            { name: 'Facebook Stories', impressions: 150000, clicks: 3000, ctr: 2.0 },
                            { name: 'Instagram Stories', impressions: 200000, clicks: 5000, ctr: 2.5 },
                            { name: 'Marketplace', impressions: 100000, clicks: 2000, ctr: 2.0 },
                            { name: 'Search', impressions: 50000, clicks: 1500, ctr: 3.0 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="ctr" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Device Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Mobile', value: 700 },
                              { name: 'Desktop', value: 200 },
                              { name: 'Tablet', value: 100 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Mobile', value: 700 },
                              { name: 'Desktop', value: 200 },
                              { name: 'Tablet', value: 100 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Platform Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'iOS', value: 400 },
                              { name: 'Android', value: 300 },
                              { name: 'Windows', value: 150 },
                              { name: 'Mac', value: 50 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'iOS', value: 400 },
                              { name: 'Android', value: 300 },
                              { name: 'Windows', value: 150 },
                              { name: 'Mac', value: 50 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default withAuth(AnalyticsPage, ['analytics:read']);
