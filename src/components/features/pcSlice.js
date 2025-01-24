import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchJobRolesBySector } from './jobRoleSlice';
import { fetchNos } from './nosSlice';
import { fetchSectors } from './subAdminSlice';


export const fetchPCs = createAsyncThunk('pc/fetchPCs', async (nos, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/pc`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token")
            },
            params: {
                nos: nos
            }
        });
        console.log(response);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
}
);

export const createPC = createAsyncThunk('pc/createPC', async (pc, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${BASE_URL}company/pc`, pc, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success('PC added successfully!');
        return response.data.data;
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updatePC = createAsyncThunk(
    'pc/updatePC',
    async ({ _id, updatedPC }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/pc/${_id}`, updatedPC, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            toast.error(error.response.data.message);
            return rejectWithValue(error.response.data);
        }
    }
);

export const deletePC = createAsyncThunk('pc/deletePC', async (pcId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/pc/${pcId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success("PC deleted successfully!");
        return { _id: pcId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete PC details: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

const pcSlice = createSlice({
    name: 'pc',
    initialState: {
        pcs: [],
        sectors: [],
        jobRoles: [],
        noses: [],
        nosElements: [],
        selectedSector: null,
        selectedJobRole: null,
        selectedNOS: null,
        selectedNOSElement: null,
        totalPCs: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null
    },
    reducers: {
        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
            state.currentPage = 1;
        },
        setSelectedJobRole: (state, action) => {
            state.selectedJobRole = action.payload;
            state.currentPage = 1;
        },
        setSelectedNOS: (state, action) => {
            state.selectedNOS = action.payload;
            state.currentPage = 1;
        },
        setSelectedNOSElement: (state, action) => {
            state.selectedNOSElement = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(updatePC.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updatePC.fulfilled, (state, action) => {
                const index = state.pcs.findIndex(pc => pc._id === action.payload._id);
                if (index !== -1) {
                    state.pcs[index] = action.payload;
                }
            })
            .addCase(updatePC.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deletePC.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deletePC.fulfilled, (state, action) => {
                state.pcs = state.pcs.filter(pc => pc._id !== action.payload._id);
                state.totalPCs -= 1;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(deletePC.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
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
            .addCase(fetchNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNos.fulfilled, (state, action) => {
                state.noses = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchNos.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchPCs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPCs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pcs = action.payload;
                state.totalPCs = action.payload.length;
            })
            .addCase(fetchPCs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createPC.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPC.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pcs?.push(action.payload);
                state.totalPCs += 1;
            })
            .addCase(createPC.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setCurrentPage, setSelectedJobRole, setSelectedSector, setSelectedNOS, setSelectedNOSElement, setItemsPerPage } = pcSlice.actions;
export default pcSlice.reducer;