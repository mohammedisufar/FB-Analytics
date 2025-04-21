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
  Alert,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import withAuth from '../utils/withAuth';
import { searchAdLibrary, getAdDetails } from '../redux/slices/facebookSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`adlibrary-tabpanel-${index}`}
      aria-labelledby={`adlibrary-tab-${index}`}
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
    id: `adlibrary-tab-${index}`,
    'aria-controls': `adlibrary-tabpanel-${index}`,
  };
}

const AdLibraryPage = () => {
  const dispatch = useDispatch();
  const { adLibraryResults, adDetails, loading, error } = useSelector((state) => state.facebook);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [adType, setAdType] = useState('POLITICAL_AND_ISSUE_ADS');
  const [country, setCountry] = useState('US');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [tabValue, setTabValue] = useState(0);
  const [selectedAd, setSelectedAd] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collections, setCollections] = useState([
    { id: '1', name: 'Competitor Ads', description: 'Ads from our main competitors', count: 12 },
    { id: '2', name: 'Inspiration', description: 'Great ads for inspiration', count: 8 },
    { id: '3', name: 'Best Performers', description: 'Ads with high CTR', count: 5 }
  ]);
  
  // Sample data for when real data isn't available yet
  const sampleAdResults = [
    {
      id: 'ad1',
      pageId: 'page1',
      pageName: 'Brand A',
      content: {
        title: 'Summer Sale',
        body: 'Get 50% off on all products this summer!',
        imageUrl: 'https://via.placeholder.com/300x200',
        linkUrl: 'https://example.com/summer-sale'
      },
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'ACTIVE'
    },
    {
      id: 'ad2',
      pageId: 'page2',
      pageName: 'Brand B',
      content: {
        title: 'New Product Launch',
        body: 'Introducing our revolutionary new product. Try it today!',
        imageUrl: 'https://via.placeholder.com/300x200',
        linkUrl: 'https://example.com/new-product'
      },
      startDate: '2023-07-15',
      endDate: null,
      status: 'ACTIVE'
    },
    {
      id: 'ad3',
      pageId: 'page3',
      pageName: 'Brand C',
      content: {
        title: 'Limited Time Offer',
        body: 'Buy one, get one free. Limited time only!',
        imageUrl: 'https://via.placeholder.com/300x200',
        linkUrl: 'https://example.com/limited-offer'
      },
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      status: 'INACTIVE'
    }
  ];
  
  const handleSearch = () => {
    dispatch(searchAdLibrary({
      query: searchQuery,
      adType,
      country,
      dateRange
    }));
  };
  
  const handleAdTypeChange = (event) => {
    setAdType(event.target.value);
  };
  
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };
  
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    dispatch(getAdDetails(ad.id));
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleSaveToCollection = (collectionId) => {
    // In a real implementation, this would save the ad to the collection
    console.log(`Saving ad ${selectedAd.id} to collection ${collectionId}`);
    setDialogOpen(false);
  };
  
  // Use sample data if no real data is available
  const displayResults = adLibraryResults.length > 0 ? adLibraryResults : sampleAdResults;
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ad Library
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Search" {...a11yProps(0)} />
            <Tab label="Collections" {...a11yProps(1)} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Search Ad Library"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter keywords, brand names, etc."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel id="ad-type-label">Ad Type</InputLabel>
                      <Select
                        labelId="ad-type-label"
                        id="ad-type"
                        value={adType}
                        label="Ad Type"
                        onChange={handleAdTypeChange}
                      >
                        <MenuItem value="POLITICAL_AND_ISSUE_ADS">Political & Issue Ads</MenuItem>
                        <MenuItem value="HOUSING_ADS">Housing Ads</MenuItem>
                        <MenuItem value="EMPLOYMENT_ADS">Employment Ads</MenuItem>
                        <MenuItem value="CREDIT_ADS">Credit Ads</MenuItem>
                        <MenuItem value="ALL">All Ads</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel id="country-label">Country</InputLabel>
                      <Select
                        labelId="country-label"
                        id="country"
                        value={country}
                        label="Country"
                        onChange={handleCountryChange}
                      >
                        <MenuItem value="US">United States</MenuItem>
                        <MenuItem value="CA">Canada</MenuItem>
                        <MenuItem value="GB">United Kingdom</MenuItem>
                        <MenuItem value="AU">Australia</MenuItem>
                        <MenuItem value="DE">Germany</MenuItem>
                        <MenuItem value="FR">France</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel id="date-range-label">Date Range</InputLabel>
                      <Select
                        labelId="date-range-label"
                        id="date-range"
                        value={dateRange}
                        label="Date Range"
                        onChange={handleDateRangeChange}
                      >
                        <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                        <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                        <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                        <MenuItem value="last_year">Last Year</MenuItem>
                        <MenuItem value="all_time">All Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={handleSearch}
                      startIcon={<SearchIcon />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {displayResults.map((ad) => (
                  <Grid item xs={12} md={4} key={ad.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ position: 'relative' }}>
                        <img 
                          src={ad.content.imageUrl || 'https://via.placeholder.com/300x200'} 
                          alt={ad.content.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                        <IconButton 
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                          onClick={() => setSelectedAd(ad)}
                        >
                          <BookmarkBorderIcon />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="div" gutterBottom>
                          {ad.pageName}
                        </Typography>
                        <Typography variant="h6" component="div" gutterBottom>
                          {ad.content.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {ad.content.body}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Chip 
                            label={ad.status} 
                            color={ad.status === 'ACTIVE' ? 'success' : 'default'} 
                            size="small" 
                          />
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleAdClick(ad)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Your Collections
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
              >
                Create Collection
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {collections.map((collection) => (
                <Grid item xs={12} md={4} key={collection.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <FolderIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          {collection.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {collection.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Chip 
                          label={`${collection.count} ads`} 
                          size="small" 
                        />
                        <Button 
                          variant="outlined" 
                          size="small"
                        >
                          View Collection
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Ad Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAd && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedAd.content.title}</Typography>
                <IconButton onClick={handleCloseDialog}>
                  <BookmarkIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img 
                    src={selectedAd.content.imageUrl || 'https://via.placeholder.com/500x300'} 
                    alt={selectedAd.content.title}
                    style={{ width: '100%', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedAd.pageName}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedAd.content.body}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1">
                        {selectedAd.status}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedAd.startDate || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedAd.endDate || 'Ongoing'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ad ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedAd.id}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Save to Collection
                  </Typography>
                  <List dense>
                    {collections.map((collection) => (
                      <ListItem 
                        key={collection.id}
                        button
                        onClick={() => handleSaveToCollection(collection.id)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <FolderIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={collection.name} 
                          secondary={`${collection.count} ads`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                href={selectedAd.content.linkUrl}
                target="_blank"
              >
                Visit Ad URL
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default withAuth(AdLibraryPage, ['adLibrary:read']);
