import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../components/constant';

export const fetchSectors = createAsyncThunk(
    'scheme/fetchSectors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/sectors`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            console.log(response)
            return response.data.data;
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchSchemes = createAsyncThunk(
    'scheme/fetchSchemes',
    async ({ currentPage, itemsPerPage }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/schemes?page=${currentPage}&resultPerPage=${itemsPerPage}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return { schemes: response.data.data, totalSchemes: response.data.totalSchemes || 0 };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createScheme = createAsyncThunk(
    'scheme/createScheme',
    async (newScheme, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/schemes`, newScheme, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const schemeSlice = createSlice({
    name: 'scheme',
    initialState: {
        schemes: [],
        sectors: [],
        selectedSector: null,
        totalSchemes: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
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
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchSchemes.fulfilled, (state, action) => {
                state.schemes = action.payload.schemes;
                state.totalSchemes = action.payload.totalSchemes;
                state.isLoading = false;
            })
            .addCase(createScheme.fulfilled, (state, action) => {
                state.schemes.push(action.payload);
                state.totalSchemes += 1;
            })
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSchemes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchSchemes.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createScheme.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setSelectedSector, setCurrentPage, setItemsPerPage } = schemeSlice.actions;

export default schemeSlice.reducer;
