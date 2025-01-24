import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchAllCountries } from './countrySlice';

export const fetchStates = createAsyncThunk(
    'state/fetchStates',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/state?countryId=${id}`, {
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

export const createState = createAsyncThunk(
    'state/createState',
    async (newState, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/state`, newState, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.code === 11000) {
                toast.error('Duplicate state error: This state already exists.');
            } else {
                toast.error('Failed to create state: ' + error.response.data.message);
            }
            return rejectWithValue(error.response.data);
        }
    }
);

const stateSlice = createSlice({
    name: 'state',
    initialState: {
        states: [],
        countries: [],
        totalStates: 0,
        selectedCountry: null,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
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
            .addCase(fetchStates.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.states = action.payload;
                state.totalStates = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAllCountries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllCountries.fulfilled, (state, action) => {
                state.countries = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAllCountries.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createState.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createState.fulfilled, (state, action) => {
                state.states.push(action.payload);
                state.totalStates += 1;
                state.isLoading = false;
            })
            .addCase(createState.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});

export const { setSelectedCountry, setCurrentPage, setItemsPerPage } = stateSlice.actions;

export default stateSlice.reducer;