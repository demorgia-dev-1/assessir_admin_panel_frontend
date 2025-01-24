import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchJobRolesBySector } from './jobRoleSlice';
import { fetchSectors } from './subAdminSlice';

export const fetchNos = createAsyncThunk('nos/fetchNos', async (jobRole, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/nos`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token")
            },
            params: {
                jobRole: jobRole
            }
        });
        console.log('nos', response);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchAllNos = createAsyncThunk('nos/fetchAllNos', async ({ currentPage, itemsPerPage }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/nos`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            },
            params: {
                page: currentPage,
                resultPerPage: itemsPerPage
            }
        });
        console.log('nos', response);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});



export const addNos = createAsyncThunk('nos/addNos', async (nos, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${BASE_URL}company/nos`, nos, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success(response.data.message || "NOS added successfully!");
        return response.data.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to add NOS: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const updateNos = createAsyncThunk('nos/updateNos', async ({ _id, updatedNos }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/nos/${_id}`, updatedNos, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success("NOS updated successfully!");
        return response.data.data;
    } catch (error) {
        const errorMessage = error.response?.data.message || error.message;
        toast.error(`Failed to update NOS details: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const deleteNos = createAsyncThunk('nos/deleteNos', async (nosId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/nos/${nosId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success("NOS deleted successfully!");
        return { _id: nosId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete NOS details: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

const nosSlice = createSlice({
    name: 'nos',
    initialState: {
        noses: [],
        sectors: [],
        jobRoles: [],
        selectedSector: null,
        selectedJobRole: null,
        selectedNOS: [],
        totalNOS: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setTotalNOS: (state, action) => {
            state.totalNOS = action.payload;
        },
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
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateNos.fulfilled, (state, action) => {
                const index = state.noses.findIndex(nos => nos._id === action.payload?._id);
                state.noses[index] = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(updateNos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteNos.fulfilled, (state, action) => {
                state.noses = state.noses.filter(nos => nos._id !== action.payload._id);
                state.totalNOS -= 1;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(deleteNos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllNos.fulfilled, (state, action) => {
                state.noses = action.payload;
                state.totalNOS = action.payload.length;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchAllNos.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
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
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNos.fulfilled, (state, action) => {
                state.noses = action.payload;
                state.totalNOS = action.payload.length;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchNos.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(addNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addNos.fulfilled, (state, action) => {
                state.noses?.push(action.payload);
                state.totalNOS += 1;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(addNos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    },
});

export const { setSelectedSector, setSelectedJobRole, setCurrentPage, setSelectedNOS, setItemsPerPage, setTotalNOS, setTotalNOSElement } = nosSlice.actions;

export default nosSlice.reducer;