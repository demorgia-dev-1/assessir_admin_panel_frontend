import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../constant';

export const fetchSectors = createAsyncThunk(
    'sector/fetchSectors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/sectors`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },

            });
            console.log(response);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createSector = createAsyncThunk(
    'sector/createSector',
    async (newSector, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/sectors`, newSector, {
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

const sectorSlice = createSlice({
    name: 'sector',
    initialState: {
        sectors: [],
        totalSectors: 0,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setTotalSectors: (state, action) => {
            state.totalSectors = action.payload;
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

            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            }
            )
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
                state.totalSectors = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createSector.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSector.fulfilled, (state, action) => {
                state.sectors.push(action.payload);
                state.totalSectors += 1;
                state.isLoading = false;
            })
            .addCase(createSector.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});

export const { setTotalSectors, setCurrentPage, setItemsPerPage } = sectorSlice.actions;

export default sectorSlice.reducer;