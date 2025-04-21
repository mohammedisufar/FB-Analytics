import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { 
  getFacebookAccounts, 
  setSelectedAccount, 
  getInsights 
} from '../redux/slices/facebookSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Styled components for drag and drop functionality
const DashboardItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
}));

const WidgetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    selectedAccount, 
    insights, 
    loading, 
    error 
  } = useSelector((state) => state.facebook);
  
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [widgetType, setWidgetType] = useState('performance');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [dashboards, setDashboards] = useState([
    { id: 'default', name: 'Main Dashboard', isDefault: true },
    { id: 'performance', name: 'Performance Dashboard', isDefault: false },
    { id: 'audience', name: 'Audience Dashboard', isDefault: false }
  ]);
  const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  
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
  
  const sampleConversionData = [
    { date: '2023-04-01', conversions: 40, cost: 120, cpa: 3.0 },
    { date: '2023-04-02', conversions: 30, cost: 100, cpa: 3.3 },
    { date: '2023-04-03', conversions: 20, cost: 50, cpa: 2.5 },
    { date: '2023-04-04', conversions: 27, cost: 90, cpa: 3.3 },
    { date: '2023-04-05', conversions: 18, cost: 70, cpa: 3.9 },
    { date: '2023-04-06', conversions: 23, cost: 85, cpa: 3.7 },
    { date: '2023-04-07', conversions: 34, cost: 110, cpa: 3.2 },
  ];
  
  // Dashboard widgets configuration
  const [widgets, setWidgets] = useState([
    {
      id: 'widget1',
      title: 'Performance Overview',
      type: 'performance',
      size: 'full',
      chartType: 'line',
      metrics: ['impressions', 'clicks'],
      dashboardId: 'default'
    },
    {
      id: 'widget2',
      title: 'Spend by Day',
      type: 'spend',
      size: 'half',
      chartType: 'bar',
      metrics: ['spend'],
      dashboardId: 'default'
    },
    {
      id: 'widget3',
      title: 'CTR Trend',
      type: 'ctr',
      size: 'half',
      chartType: 'line',
      metrics: ['ctr'],
      dashboardId: 'default'
    },
    {
      id: 'widget4',
      title: 'Audience Demographics',
      type: 'demographics',
      size: 'half',
      chartType: 'bar',
      metrics: ['male', 'female'],
      dashboardId: 'default'
    },
    {
      id: 'widget5',
      title: 'Placement Distribution',
      type: 'placement',
      size: 'half',
      chartType: 'pie',
      metrics: ['value'],
      dashboardId: 'default'
    },
    {
      id: 'widget6',
      title: 'Conversion Trend',
      type: 'conversion',
      size: 'full',
      chartType: 'area',
      metrics: ['conversions', 'cpa'],
      dashboardId: 'default'
    }
  ]);
  
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
          startDate: '2023-04-01',
          endDate: '2023-04-07',
          timeIncrement: 1
        }
      }));
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
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleOpenWidgetDialog = () => {
    setWidgetDialogOpen(true);
    handleMenuClose();
  };
  
  const handleCloseWidgetDialog = () => {
    setWidgetDialogOpen(false);
    setWidgetType('performance');
    setWidgetTitle('');
  };
  
  const handleAddWidget = () => {
    const newWidget = {
      id: `widget${widgets.length + 1}`,
      title: widgetTitle,
      type: widgetType,
      size: 'half',
      chartType: getDefaultChartType(widgetType),
      metrics: getDefaultMetrics(widgetType),
      dashboardId: dashboards[tabValue].id
    };
    
    setWidgets([...widgets, newWidget]);
    handleCloseWidgetDialog();
  };
  
  const handleOpenDashboardDialog = () => {
    setDashboardDialogOpen(true);
    handleMenuClose();
  };
  
  const handleCloseDashboardDialog = () => {
    setDashboardDialogOpen(false);
    setNewDashboardName('');
  };
  
  const handleAddDashboard = () => {
    const newDashboard = {
      id: `dashboard${dashboards.length + 1}`,
      name: newDashboardName,
      isDefault: false
    };
    
    setDashboards([...dashboards, newDashboard]);
    setTabValue(dashboards.length);
    handleCloseDashboardDialog();
  };
  
  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };
  
  const getDefaultChartType = (type) => {
    switch (type) {
      case 'performance':
        return 'line';
      case 'spend':
        return 'bar';
      case 'ctr':
        return 'line';
      case 'demographics':
        return 'bar';
      case 'placement':
        return 'pie';
      case 'conversion':
        return 'area';
      default:
        return 'line';
    }
  };
  
  const getDefaultMetrics = (type) => {
    switch (type) {
      case 'performance':
        return ['impressions', 'clicks'];
      case 'spend':
        return ['spend'];
      case 'ctr':
        return ['ctr'];
      case 'demographics':
        return ['male', 'female'];
      case 'placement':
        return ['value'];
      case 'conversion':
        return ['conversions', 'cpa'];
      default:
        return ['impressions'];
    }
  };
  
  const getWidgetData = (widget) => {
    switch (widget.type) {
      case 'performance':
      case 'spend':
      case 'ctr':
        return selectedAdAccount && insights[selectedAdAccount] 
          ? insights[selectedAdAccount]
          : samplePerformanceData;
      case 'demographics':
        return sampleDemographicData;
      case 'placement':
        return samplePlacementData;
      case 'conversion':
        return sampleConversionData;
      default:
        return [];
    }
  };
  
  const renderChart = (widget) => {
    const data = getWidgetData(widget);
    
    switch (widget.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={widget.type === 'demographics' ? 'name' : 'date'} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {widget.metrics.map((metric, index) => (
                <Line 
                  key={metric}
                  type="monotone" 
                  dataKey={metric} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={widget.type === 'demographics' ? 'name' : 'date'} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {widget.metrics.map((metric, index) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey={widget.metrics[0]}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
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
              <RechartsTooltip />
              <Legend />
              {widget.metrics.map((metric, index) => (
                <Area 
                  key={metric}
                  type="monotone" 
                  dataKey={metric} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={COLORS[index % COLORS.length]} 
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  // Filter widgets for current dashboard
  const currentDashboardWidgets = widgets.filter(
    widget => widget.dashboardId === (dashboards[tabValue] ? dashboards[tabValue].id : 'default')
  );
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              sx={{ mr: 2 }}
              onClick={() => {
                if (selectedAdAccount) {
                  dispatch(getInsights({
                    adAccountId: selectedAdAccount,
                    params: {
                      startDate: '2023-04-01',
                      endDate: '2023-04-07',
                      timeIncrement: 1
                    }
                  }));
                }
              }}
            >
              Refresh Data
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<MoreVertIcon />}
              onClick={handleMenuClick}
            >
              Actions
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenWidgetDialog}>Add Widget</MenuItem>
              <MenuItem onClick={handleOpenDashboardDialog}>Create Dashboard</MenuItem>
              <MenuItem onClick={handleMenuClose}>Export Dashboard</MenuItem>
              <MenuItem onClick={handleMenuClose}>Print Dashboard</MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
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
              
              <Grid item xs={12} md={4}>
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
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SettingsIcon />}
                    sx={{ mr: 2 }}
                  >
                    Dashboard Settings
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<FullscreenIcon />}
                  >
                    Full Screen
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Paper sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {dashboards.map((dashboard, index) => (
              <Tab key={dashboard.id} label={dashboard.name} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {dashboards.map((dashboard, index) => (
              <TabPanel key={dashboard.id} value={tabValue} index={index}>
                <Grid container spacing={3}>
                  {currentDashboardWidgets.map((widget) => (
                    <Grid 
                      item 
                      xs={12} 
                      md={widget.size === 'full' ? 12 : 6} 
                      key={widget.id}
                    >
                      <DashboardItem elevation={3}>
                        <WidgetHeader>
                          <Typography variant="h6">{widget.title}</Typography>
                          <Box>
                            <Tooltip title="Widget Settings">
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <SettingsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Widget">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteWidget(widget.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </WidgetHeader>
                        {renderChart(widget)}
                      </DashboardItem>
                    </Grid>
                  ))}
                  
                  <Grid item xs={12} md={6}>
                    <DashboardItem 
                      elevation={1} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                        border: '2px dashed #ccc',
                        backgroundColor: 'rgba(0,0,0,0.02)'
                      }}
                      onClick={handleOpenWidgetDialog}
                    >
                      <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Add Widget
                      </Typography>
                    </DashboardItem>
                  </Grid>
                </Grid>
              </TabPanel>
            ))}
          </>
        )}
      </Box>
      
      {/* Add Widget Dialog */}
      <Dialog
        open={widgetDialogOpen}
        onClose={handleCloseWidgetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Widget Title"
              variant="outlined"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="widget-type-label">Widget Type</InputLabel>
              <Select
                labelId="widget-type-label"
                id="widget-type"
                value={widgetType}
                label="Widget Type"
                onChange={(e) => setWidgetType(e.target.value)}
              >
                <MenuItem value="performance">Performance Overview</MenuItem>
                <MenuItem value="spend">Spend Analysis</MenuItem>
                <MenuItem value="ctr">CTR Analysis</MenuItem>
                <MenuItem value="demographics">Demographics</MenuItem>
                <MenuItem value="placement">Placement Distribution</MenuItem>
                <MenuItem value="conversion">Conversion Tracking</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWidgetDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddWidget}
            disabled={!widgetTitle}
          >
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Dashboard Dialog */}
      <Dialog
        open={dashboardDialogOpen}
        onClose={handleCloseDashboardDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Dashboard</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Dashboard Name"
              variant="outlined"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDashboardDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddDashboard}
            disabled={!newDashboardName}
          >
            Create Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default withAuth(DashboardPage, ['analytics:read']);
