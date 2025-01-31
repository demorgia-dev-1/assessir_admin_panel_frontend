import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchSectors } from './subAdminSlice';

export const fetchJobRoles = createAsyncThunk('jobRole/fetchJobRoles', async ({ sectors, itemsPerPage, currentPage }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/jobs`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token"),
            },
            params: {
                sectors: sectors,
                page: currentPage,
                resultPerPage: itemsPerPage
            }
        });
        console.log('JOBROLES', response);
        return {
            data: response.data.data,
            total: response.data.totalJobRoles
        };
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const fetchJobRolesBySector = createAsyncThunk('jobRole/fetchJobRolesBySector', async (sectorId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/jobs`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
            params: {
                sectors: sectorId
            }
        });
        console.log('jobRolesBySector response:', response);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const createJobRole = createAsyncThunk('jobRole/createJobRole', async (jobRoleData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${BASE_URL}company/jobs`, jobRoleData, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        console.log(response);
        toast.success('Job role created successfully!');
        return response.data.data;
    } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

export const lockJobRole = createAsyncThunk('jobRole/lockJobRole', async (jobRoleId, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/jobs/${jobRoleId}/lock`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        console.log(response);
        toast.success('Job role locked successfully!');
        return response.data.data;
    } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

export const unlockJobRole = createAsyncThunk('jobRole/unlockJobRole', async (jobRoleId, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/jobs/${jobRoleId}/unlock`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        console.log(response);
        toast.success('Job role unlocked successfully!');
        return response.data.data;
    } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

export const updateJobRole = createAsyncThunk(
    'jobRole/updateJobRole',
    async ({ _id, updatedJobRole }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/jobs/${_id}`, updatedJobRole, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            console.log(response);
            toast.success('Job role updated successfully!');
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message);
            return rejectWithValue(error.response.data);
        }
    });

export const deleteJobRole = createAsyncThunk('jobRole/deleteJobRole', async (jobRoleId, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${BASE_URL}company/jobs/${jobRoleId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        console.log(response);
        toast.success('Job role deleted successfully!');
        return response.data.data;
    } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

const jobRoleSlice = createSlice({
    name: 'jobRole',
    initialState: {
        sectors: [],
        jobRoles: [],
        selectedSector: null,
        totalJobRoles: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null
    },
    reducers: {
        setJobRoles: (state, action) => {
            state.jobRoles = action.payload;
        },
        setTotalJobRoles: (state, action) => {
            state.totalJobRoles = action.payload;
        },
        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedJobRole = action.payload;
                state.jobRoles = state.jobRoles?.filter(jobRole => jobRole?._id !== deletedJobRole?._id);
            })
            .addCase(deleteJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedJobRole = action.payload;
                const index = state.jobRoles?.findIndex(jobRole => jobRole?._id === updatedJobRole?._id);
                if (index !== -1) {
                    state.jobRoles[index] = updatedJobRole;
                }
            })
            .addCase(updateJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(lockJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(lockJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedJobRole = action.payload;
                const index = state.jobRoles?.findIndex(jobRole => jobRole?._id === updatedJobRole?._id);
                if (index !== -1) {
                    state.jobRoles[index].isLocked = true;
                }
            })
            .addCase(lockJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(unlockJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(unlockJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedJobRole = action.payload;
                const index = state.jobRoles?.findIndex(jobRole => jobRole?._id === updatedJobRole?._id);
                if (index !== -1) {
                    state.jobRoles[index].isLocked = false;
                }
            })
            .addCase(unlockJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchJobRoles.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobRoles.fulfilled, (state, action) => {
                state.jobRoles = action.payload.data;
                state.totalJobRoles = action.payload.total;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchJobRoles.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchJobRolesBySector.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobRolesBySector.fulfilled, (state, action) => {
                state.jobRoles = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchJobRolesBySector.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createJobRole.fulfilled, (state, action) => {
                state.jobRoles?.push(action.payload);
                state.totalJobRoles += 1;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(createJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

export const { setTotalJobRoles, setSelectedSector, setCurrentPage, setItemsPerPage, setJobRoles, updateJobRoleInState } = jobRoleSlice.actions;
export default jobRoleSlice.reducer;