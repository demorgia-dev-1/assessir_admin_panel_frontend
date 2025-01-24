import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';

export const fetchSubAdmins = createAsyncThunk(
    'subAdmin/fetchSubAdmins',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}company/sub-admins`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            console.log(response);
            return response.data.data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const fetchSectors = createAsyncThunk(
    'sector/fetchSectors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}company/sectors`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            console.log(response);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const createSubAdmin = createAsyncThunk(
    'subAdmin/createSubAdmin',
    async (newSubAdmin, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}company/sub-admins`, newSubAdmin, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.code === 11000) {
                return rejectWithValue({ message: 'Email already exists. Please use a different email.' });
            }
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const updateSubAdmin = createAsyncThunk(
    'subAdmin/updateSubAdmin',
    async ({ payload, subAdminId }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                `${BASE_URL}company/sub-admins/${subAdminId}/sectors`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }
            );

            toast.success('Sub-admin updated successfully');
            return response.data.data;
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.message
                : error.message;
            toast.error(errorMessage);
            return rejectWithValue(
                error.response ? error.response.data : error.message
            );
        }
    }
);


const subAdminSlice = createSlice({
    name: 'subAdmin',
    initialState: {
        sectors: [],
        subAdmins: [],
        totalSubAdmins: 0,
        selectedSectors: [],
        isLoading: false,
        error: null,
        currentPage: 1,
        itemsPerPage: 10,
    },
    reducers: {

        setSelectedSectors: (state, action) => {
            state.selectedSectors = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubAdmins.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSubAdmins.fulfilled, (state, action) => {
                state.subAdmins = action.payload;
                state.totalSubAdmins = action.payload.length;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchSubAdmins.rejected, (state, action) => {
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
            .addCase(createSubAdmin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSubAdmin.fulfilled, (state, action) => {
                state.subAdmins.push(action.payload);
                state.totalSubAdmins += 1;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(createSubAdmin.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(updateSubAdmin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateSubAdmin.fulfilled, (state, action) => {
                const index = state.subAdmins.findIndex(subAdmin => subAdmin._id === action.payload._id);
                state.subAdmins[index] = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(updateSubAdmin.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});

export const { setSelectedSectors, setCurrentPage } = subAdminSlice.actions;

export default subAdminSlice.reducer;