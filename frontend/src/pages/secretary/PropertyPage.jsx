import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, IconButton,
  Tooltip, Skeleton, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel,
  Divider
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import axiosInstance from '../../api/axiosInstance';
import { showSuccess, showError } from '../../utils/toast';

const headSx = {
  fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
  fontWeight: 700, color: '#64748b',
  letterSpacing: '0.05em', textTransform: 'uppercase',
  bgcolor: '#f8fbff', py: 1.2,
};

const cellSx = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.82rem', color: '#1e293b', py: 1.2,
};

const StatusChip = ({ status }) => {
  const map = {
    UNREGISTERED:      { label: 'Unregistered',      bgcolor: '#f1f5f9', color: '#64748b' },
    ACTIVE_WITH_OWNER: { label: 'Active — Owner',     bgcolor: '#dcfce7', color: '#166534' },
    ACTIVE_WITH_TENANT:{ label: 'Active — Tenant',    bgcolor: '#e0f2fe', color: '#0891b2' },
  };
  const s = map[status] || map.UNREGISTERED;
  return (
    <Chip label={s.label} size="small" sx={{
      bgcolor: s.bgcolor, color: s.color,
      fontWeight: 700, fontSize: '0.7rem',
      fontFamily: 'Inter, sans-serif', height: 22,
    }} />
  );
};

const ListingChip = ({ type }) => (
  <Chip label={type} size="small" sx={{
    bgcolor: type === 'RENT' ? '#f3e8ff' : '#fef3c7',
    color: type === 'RENT' ? '#7c3aed' : '#d97706',
    fontWeight: 700, fontSize: '0.7rem',
    fontFamily: 'Inter, sans-serif', height: 22,
  }} />
);

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontFamily: 'Inter, sans-serif',
    '&.Mui-focused fieldset': { borderColor: '#0891b2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
  '& .MuiInputLabel-root': { fontFamily: 'Inter, sans-serif' },
};

const PropertyPage = () => {
  const [tab, setTab] = useState(0);
  const [flats, setFlats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postHistory, setPostHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Flat detail modal
  const [flatDetailOpen, setFlatDetailOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);

  // Create flat modal
  const [createFlatOpen, setCreateFlatOpen] = useState(false);
  const [flatForm, setFlatForm] = useState({ flatNumber: '', wingId: '' });
  const [flatFormErrors, setFlatFormErrors] = useState({});

  // Assign owner modal
  const [assignOwnerOpen, setAssignOwnerOpen] = useState(false);
  const [assignOwnerFlatId, setAssignOwnerFlatId] = useState(null);
  const [ownerResidentId, setOwnerResidentId] = useState('');

  // Assign tenant modal
  const [assignTenantOpen, setAssignTenantOpen] = useState(false);
  const [assignTenantFlatId, setAssignTenantFlatId] = useState(null);
  const [tenantResidentId, setTenantResidentId] = useState('');

  // Create post modal
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    flatId: '', ownerName: '', contactNumber: '',
    listingType: 'RENT', furnishingStatus: 'FULLY_FURNISHED',
    availabilityDate: '',
  });
  const [postFormErrors, setPostFormErrors] = useState({});

  // Post detail modal
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const wings = [
    { id: 1, name: 'Wing A' },
    { id: 2, name: 'Wing B' },
    { id: 3, name: 'Wing C' },
    { id: 4, name: 'Wing D' },
    { id: 5, name: 'Wing E' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [flatsRes, postsRes, historyRes] = await Promise.all([
        axiosInstance.get('/api/flat/all'),
        axiosInstance.get('/api/property/post/all'),
        axiosInstance.get('/api/property/post/history'),
      ]);
      setFlats(flatsRes.data);
      setPosts(postsRes.data);
      setPostHistory(historyRes.data);
    } catch {
      showError('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Create Flat
  const handleCreateFlat = async () => {
    const e = {};
    if (!flatForm.flatNumber) e.flatNumber = 'Required';
    if (!flatForm.wingId) e.wingId = 'Select a wing';
    setFlatFormErrors(e);
    if (Object.values(e).some(v => v)) return;

    setActionLoading(true);
    try {
      await axiosInstance.post('/api/flat/create', {
        flatNumber: flatForm.flatNumber,
        wingId: Number(flatForm.wingId),
      });
      showSuccess('Flat created successfully');
      setCreateFlatOpen(false);
      setFlatForm({ flatNumber: '', wingId: '' });
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create flat');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign Owner
  const handleAssignOwner = async () => {
    if (!ownerResidentId) { showError('Enter resident ID'); return; }
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${assignOwnerFlatId}/assign-owner`, {
        residentId: Number(ownerResidentId),
      });
      showSuccess('Owner assigned successfully');
      setAssignOwnerOpen(false);
      setOwnerResidentId('');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign owner');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign Tenant
  const handleAssignTenant = async () => {
    if (!tenantResidentId) { showError('Enter resident ID'); return; }
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${assignTenantFlatId}/assign-tenant`, {
        residentId: Number(tenantResidentId),
      });
      showSuccess('Tenant assigned successfully');
      setAssignTenantOpen(false);
      setTenantResidentId('');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign tenant');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Tenant
  const handleRemoveTenant = async (flatId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${flatId}/remove-tenant`);
      showSuccess('Tenant removed successfully');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove tenant');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Post
  const handleCreatePost = async () => {
    const e = {};
    if (!postForm.flatId) e.flatId = 'Required';
    if (!postForm.ownerName) e.ownerName = 'Required';
    if (!postForm.contactNumber) e.contactNumber = 'Required';
    setPostFormErrors(e);
    if (Object.values(e).some(v => v)) return;

    setActionLoading(true);
    try {
      await axiosInstance.post('/api/property/post/create', {
        ...postForm,
        flatId: Number(postForm.flatId),
      });
      showSuccess('Property post created successfully');
      setCreatePostOpen(false);
      setPostForm({ flatId: '', ownerName: '', contactNumber: '', listingType: 'RENT', furnishingStatus: 'FULLY_FURNISHED', availabilityDate: '' });
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Rented
  const handleMarkRented = async (postId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/property/post/${postId}/mark-rented`);
      showSuccess('Marked as rented/sold');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1, borderRadius: 1.5 }} />
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ApartmentIcon sx={{ color: '#0891b2', fontSize: 20 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>
            Property Management
          </Typography>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748b' }}>
            Manage flats and property listings
          </Typography>
        </Box>
        <Button
          variant="contained" size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setCreateFlatOpen(true)}
          sx={{ bgcolor: '#0891b2', borderRadius: 2, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', px: 2, boxShadow: '0 2px 6px rgba(8,145,178,0.25)', '&:hover': { bgcolor: '#0e7490' }, mr: 1 }}
        >
          Add Flat
        </Button>
        <Button
          variant="outlined" size="small"
          startIcon={<HomeWorkIcon fontSize="small" />}
          onClick={() => setCreatePostOpen(true)}
          sx={{ borderRadius: 2, borderColor: '#0891b2', color: '#0891b2', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', px: 2 }}
        >
          Post Listing
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0f2fe', overflow: 'hidden', boxShadow: '0 2px 12px rgba(8,145,178,0.06)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            bgcolor: '#f8fbff', borderBottom: '1px solid #e0f2fe',
            '& .MuiTab-root': { fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', minHeight: 44 },
            '& .Mui-selected': { color: '#0891b2' },
            '& .MuiTabs-indicator': { bgcolor: '#0891b2' },
          }}>
          <Tab label={`All Flats (${flats.length})`} />
          <Tab label={`Active Listings (${posts.length})`} />
          <Tab label={`Listing History (${postHistory.length})`} />
        </Tabs>

        {loading ? <LoadingSkeleton /> : tab === 0 ? (
          flats.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ApartmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: '0.88rem' }}>
                No flats added yet
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Wing</TableCell>
                    <TableCell sx={headSx}>Owner</TableCell>
                    <TableCell sx={headSx}>Tenant</TableCell>
                    <TableCell sx={headSx}>Status</TableCell>
                    <TableCell sx={headSx} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flats.map((flat) => (
                    <TableRow key={flat.id} hover sx={{ '&:hover': { bgcolor: '#f8fbff' } }}>
                      <TableCell sx={cellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0f2fe', fontSize: '0.7rem', color: '#0891b2', fontWeight: 700 }}>
                            {flat.flatNumber?.split('-')[0]}
                          </Avatar>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                            {flat.flatNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}>{flat.wingName || '—'}</TableCell>
                      <TableCell sx={cellSx}>{flat.ownerName || <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Not assigned</Typography>}</TableCell>
                      <TableCell sx={cellSx}>{flat.currentTenantName || <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No tenant</Typography>}</TableCell>
                      <TableCell sx={cellSx}><StatusChip status={flat.status} /></TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => { setSelectedFlat(flat); setFlatDetailOpen(true); }}
                              sx={{ color: '#0891b2', bgcolor: '#e0f2fe', borderRadius: 1.5, width: 28, height: 28 }}>
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {!flat.ownerId && (
                            <Tooltip title="Assign Owner">
                              <IconButton size="small"
                                onClick={() => { setAssignOwnerFlatId(flat.id); setAssignOwnerOpen(true); }}
                                sx={{ color: '#059669', bgcolor: '#dcfce7', borderRadius: 1.5, width: 28, height: 28 }}>
                                <PersonAddIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {flat.ownerId && !flat.currentTenantId && (
                            <Tooltip title="Assign Tenant">
                              <IconButton size="small"
                                onClick={() => { setAssignTenantFlatId(flat.id); setAssignTenantOpen(true); }}
                                sx={{ color: '#7c3aed', bgcolor: '#f3e8ff', borderRadius: 1.5, width: 28, height: 28 }}>
                                <PersonAddIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {flat.currentTenantId && (
                            <Tooltip title="Remove Tenant">
                              <IconButton size="small"
                                onClick={() => handleRemoveTenant(flat.id)}
                                disabled={actionLoading}
                                sx={{ color: '#dc2626', bgcolor: '#fee2e2', borderRadius: 1.5, width: 28, height: 28 }}>
                                <PersonRemoveIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : tab === 1 ? (
          posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <HomeWorkIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: '0.88rem' }}>
                No active listings
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Owner</TableCell>
                    <TableCell sx={headSx}>Contact</TableCell>
                    <TableCell sx={headSx}>Type</TableCell>
                    <TableCell sx={headSx}>Furnishing</TableCell>
                    <TableCell sx={headSx}>Available From</TableCell>
                    <TableCell sx={headSx} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} hover sx={{ '&:hover': { bgcolor: '#f8fbff' } }}>
                      <TableCell sx={cellSx}>{post.flatNumber || '—'}</TableCell>
                      <TableCell sx={cellSx}>{post.ownerName}</TableCell>
                      <TableCell sx={cellSx}>{post.contactNumber}</TableCell>
                      <TableCell sx={cellSx}><ListingChip type={post.listingType} /></TableCell>
                      <TableCell sx={cellSx}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#64748b' }}>
                          {post.furnishingStatus?.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {post.availabilityDate ? new Date(post.availabilityDate).toLocaleDateString('en-IN') : '—'}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => { setSelectedPost(post); setPostDetailOpen(true); }}
                              sx={{ color: '#0891b2', bgcolor: '#e0f2fe', borderRadius: 1.5, width: 28, height: 28 }}>
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Rented/Sold">
                            <IconButton size="small" onClick={() => handleMarkRented(post.id)} disabled={actionLoading}
                              sx={{ color: '#059669', bgcolor: '#dcfce7', borderRadius: 1.5, width: 28, height: 28 }}>
                              <HomeWorkIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          postHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <HomeWorkIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: '0.88rem' }}>
                No listing history yet
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Owner</TableCell>
                    <TableCell sx={headSx}>Type</TableCell>
                    <TableCell sx={headSx}>Furnishing</TableCell>
                    <TableCell sx={headSx}>Status</TableCell>
                    <TableCell sx={headSx}>Posted On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postHistory.map((post) => (
                    <TableRow key={post.id} hover sx={{ '&:hover': { bgcolor: '#f8fbff' } }}>
                      <TableCell sx={cellSx}>{post.flatNumber || '—'}</TableCell>
                      <TableCell sx={cellSx}>{post.ownerName}</TableCell>
                      <TableCell sx={cellSx}><ListingChip type={post.listingType} /></TableCell>
                      <TableCell sx={cellSx}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#64748b' }}>
                          {post.furnishingStatus?.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={post.isActive ? 'Active' : 'Rented/Sold'} size="small" sx={{
                          bgcolor: post.isActive ? '#dcfce7' : '#fee2e2',
                          color: post.isActive ? '#166534' : '#991b1b',
                          fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', height: 22,
                        }} />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </Paper>

      {/* Flat Detail Modal */}
      <Dialog open={flatDetailOpen} onClose={() => setFlatDetailOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Flat Details
        </DialogTitle>
        {selectedFlat && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ['Flat Number', selectedFlat.flatNumber],
              ['Wing', selectedFlat.wingName || '—'],
              ['Owner', selectedFlat.ownerName || 'Not assigned'],
              ['Current Tenant', selectedFlat.currentTenantName || 'No tenant'],
              ['Status', selectedFlat.status],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => setFlatDetailOpen(false)}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Flat Modal */}
      <Dialog open={createFlatOpen} onClose={() => { setCreateFlatOpen(false); setFlatForm({ flatNumber: '', wingId: '' }); setFlatFormErrors({}); }}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Add New Flat
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" error={!!flatFormErrors.wingId} sx={fieldStyle}>
              <InputLabel sx={{ fontFamily: 'Inter, sans-serif' }}>Wing *</InputLabel>
              <Select value={flatForm.wingId} onChange={(e) => setFlatForm({ ...flatForm, wingId: e.target.value })} label="Wing *" sx={{ fontFamily: 'Inter, sans-serif' }}>
                {wings.map((w) => (
                  <MenuItem key={w.id} value={w.id} sx={{ fontFamily: 'Inter, sans-serif' }}>{w.name}</MenuItem>
                ))}
              </Select>
              {flatFormErrors.wingId && <Typography sx={{ color: '#d32f2f', fontSize: '0.72rem', mt: 0.5, ml: 1.5, fontFamily: 'Inter, sans-serif' }}>{flatFormErrors.wingId}</Typography>}
            </FormControl>
            <TextField label="Flat Number *" value={flatForm.flatNumber}
              onChange={(e) => setFlatForm({ ...flatForm, flatNumber: e.target.value })}
              size="small" fullWidth placeholder="e.g. A-201"
              error={!!flatFormErrors.flatNumber} helperText={flatFormErrors.flatNumber}
              sx={fieldStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => { setCreateFlatOpen(false); setFlatForm({ flatNumber: '', wingId: '' }); setFlatFormErrors({}); }}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFlat} disabled={actionLoading}
            sx={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', bgcolor: '#0891b2', borderRadius: 2, '&:hover': { bgcolor: '#0e7490' } }}>
            {actionLoading ? 'Creating...' : 'Create Flat'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Owner Modal */}
      <Dialog open={assignOwnerOpen} onClose={() => { setAssignOwnerOpen(false); setOwnerResidentId(''); }}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Assign Owner to Flat
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', mb: 2 }}>
            Enter the Resident ID of the owner to assign to this flat.
          </Typography>
          <TextField label="Owner Resident ID *" value={ownerResidentId}
            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOwnerResidentId(e.target.value); }}
            size="small" fullWidth sx={fieldStyle} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => { setAssignOwnerOpen(false); setOwnerResidentId(''); }}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignOwner} disabled={actionLoading || !ownerResidentId}
            sx={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', bgcolor: '#059669', borderRadius: 2, '&:hover': { bgcolor: '#047857' } }}>
            {actionLoading ? 'Assigning...' : 'Assign Owner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Tenant Modal */}
      <Dialog open={assignTenantOpen} onClose={() => { setAssignTenantOpen(false); setTenantResidentId(''); }}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Assign Tenant to Flat
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', mb: 2 }}>
            Enter the Resident ID of the tenant to assign to this flat.
          </Typography>
          <TextField label="Tenant Resident ID *" value={tenantResidentId}
            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setTenantResidentId(e.target.value); }}
            size="small" fullWidth sx={fieldStyle} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => { setAssignTenantOpen(false); setTenantResidentId(''); }}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignTenant} disabled={actionLoading || !tenantResidentId}
            sx={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', bgcolor: '#7c3aed', borderRadius: 2, '&:hover': { bgcolor: '#6d28d9' } }}>
            {actionLoading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Post Modal */}
      <Dialog open={createPostOpen} onClose={() => { setCreatePostOpen(false); setPostForm({ flatId: '', ownerName: '', contactNumber: '', listingType: 'RENT', furnishingStatus: 'FULLY_FURNISHED', availabilityDate: '' }); setPostFormErrors({}); }}
        maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Create Property Listing
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Flat ID *" value={postForm.flatId}
              onChange={(e) => { if (/^\d*$/.test(e.target.value)) setPostForm({ ...postForm, flatId: e.target.value }); }}
              size="small" fullWidth
              error={!!postFormErrors.flatId} helperText={postFormErrors.flatId || 'Enter the flat ID from Flats tab'}
              sx={fieldStyle} />
            <TextField label="Owner Name *" value={postForm.ownerName}
              onChange={(e) => { if (!/^[a-zA-Z\s]*$/.test(e.target.value)) return; setPostForm({ ...postForm, ownerName: e.target.value }); }}
              size="small" fullWidth
              error={!!postFormErrors.ownerName} helperText={postFormErrors.ownerName}
              sx={fieldStyle} />
            <TextField label="Contact Number *" value={postForm.contactNumber}
              onChange={(e) => { if (!/^\d*$/.test(e.target.value) || e.target.value.length > 10) return; setPostForm({ ...postForm, contactNumber: e.target.value }); }}
              size="small" fullWidth
              error={!!postFormErrors.contactNumber} helperText={postFormErrors.contactNumber}
              sx={fieldStyle} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <FormControl size="small" sx={fieldStyle}>
                <InputLabel sx={{ fontFamily: 'Inter, sans-serif' }}>Listing Type</InputLabel>
                <Select value={postForm.listingType} onChange={(e) => setPostForm({ ...postForm, listingType: e.target.value })} label="Listing Type" sx={{ fontFamily: 'Inter, sans-serif' }}>
                  <MenuItem value="RENT" sx={{ fontFamily: 'Inter, sans-serif' }}>Rent</MenuItem>
                  <MenuItem value="SALE" sx={{ fontFamily: 'Inter, sans-serif' }}>Sale</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={fieldStyle}>
                <InputLabel sx={{ fontFamily: 'Inter, sans-serif' }}>Furnishing</InputLabel>
                <Select value={postForm.furnishingStatus} onChange={(e) => setPostForm({ ...postForm, furnishingStatus: e.target.value })} label="Furnishing" sx={{ fontFamily: 'Inter, sans-serif' }}>
                  <MenuItem value="FULLY_FURNISHED" sx={{ fontFamily: 'Inter, sans-serif' }}>Fully Furnished</MenuItem>
                  <MenuItem value="SEMI_FURNISHED" sx={{ fontFamily: 'Inter, sans-serif' }}>Semi Furnished</MenuItem>
                  <MenuItem value="NON_FURNISHED" sx={{ fontFamily: 'Inter, sans-serif' }}>Non Furnished</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField label="Availability Date" value={postForm.availabilityDate}
              onChange={(e) => setPostForm({ ...postForm, availabilityDate: e.target.value })}
              size="small" fullWidth type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => { setCreatePostOpen(false); setPostForm({ flatId: '', ownerName: '', contactNumber: '', listingType: 'RENT', furnishingStatus: 'FULLY_FURNISHED', availabilityDate: '' }); setPostFormErrors({}); }}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePost} disabled={actionLoading}
            sx={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', bgcolor: '#0891b2', borderRadius: 2, '&:hover': { bgcolor: '#0e7490' } }}>
            {actionLoading ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post Detail Modal */}
      <Dialog open={postDetailOpen} onClose={() => setPostDetailOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e0f2fe', py: 2 }}>
          Listing Details
        </DialogTitle>
        {selectedPost && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ['Flat Number', selectedPost.flatNumber || '—'],
              ['Owner Name', selectedPost.ownerName],
              ['Contact', selectedPost.contactNumber],
              ['Listing Type', selectedPost.listingType],
              ['Furnishing', selectedPost.furnishingStatus?.replace('_', ' ')],
              ['Available From', selectedPost.availabilityDate ? new Date(selectedPost.availabilityDate).toLocaleDateString('en-IN') : '—'],
              ['Status', selectedPost.isActive ? 'Active' : 'Rented/Sold'],
              ['Posted On', selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleDateString('en-IN') : '—'],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>{value}</Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0f2fe' }}>
          <Button onClick={() => setPostDetailOpen(false)}
            sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PropertyPage;