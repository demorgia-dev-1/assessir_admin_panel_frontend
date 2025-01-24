import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';

export const fetchCountries = createAsyncThunk(
    'country/fetchCountries',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/country`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });

            return {
                data: response.data.data,
                total: response.data.totalCountries
            };
        } catch (error) {
            toast.error('Failed to fetch countries: ' + error.response.data.message);
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchAllCountries = createAsyncThunk(
    'country/fetchAllCountries',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/country`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createCountry = createAsyncThunk(
    'country/createCountry',
    async (newCountry, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/country`, newCountry, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            toast.success('Country created successfully!');
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.code === 11000) {
                toast.error('Duplicate country error: This country already exists.');
            } else {
                toast.error('Failed to create country: ' + error.response.data.message);
            }
            return rejectWithValue(error.response.data);
        }
    }
);

const countrySlice = createSlice({
    name: 'country',
    initialState: {
        countries: [],
        totalCountries: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setTotalCountries: (state, action) => {
            state.totalCountries = action.payload;
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
            .addCase(fetchAllCountries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllCountries.fulfilled, (state, action) => {
                state.countries = action.payload;
                state.totalCountries = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchAllCountries.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCountries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCountries.fulfilled, (state, action) => {
                state.countries = action.payload.data;
                state.totalCountries = action.payload.total;
                state.isLoading = false;
            })
            .addCase(fetchCountries.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createCountry.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createCountry.fulfilled, (state, action) => {
                state.countries.push(action.payload);
                state.totalCountries += 1;
                state.isLoading = false;
            })
            .addCase(createCountry.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});

export const { setTotalCountries, setCurrentPage, setItemsPerPage } = countrySlice.actions;

export default countrySlice.reducer;