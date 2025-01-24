import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchAllCountries } from './countrySlice';

export const fetchStates = createAsyncThunk(
    'city/fetchStates',
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

export const fetchCitiesByStateId = createAsyncThunk(
    'tp/fetchCities',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/city?stateId=${id}`, {
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

export const createCity = createAsyncThunk(
    'city/createCity',
    async (newCity, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/city`, newCity, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            toast.success('City created successfully!');
            return response.data.data;
        } catch (error) {
            toast.error('Failed to create city: ' + error.response.data.mesage);
            return rejectWithValue(error.response.data);
        }
    }
);

const citySlice = createSlice({
    name: 'city',
    initialState: {
        countries: [],
        states: [],
        cities: [],
        totalCities: 0,
        selectedCountry: null,
        selectedState: null,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
            state.selectedState = null;
        },
        setSelectedState: (state, action) => {
            state.selectedState = action.payload;
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
            .addCase(fetchCitiesByStateId.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCitiesByStateId.fulfilled, (state, action) => {
                state.cities = action.payload;
                state.totalCities = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchCitiesByStateId.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAllCountries.fulfilled, (state, action) => {
                state.countries = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.states = action.payload;
                state.isLoading = false;
            })

            .addCase(createCity.fulfilled, (state, action) => {
                state.cities.push(action.payload);
                state.totalCities += 1;
            })
            .addCase(fetchAllCountries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStates.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllCountries.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })

            .addCase(createCity.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setSelectedCountry, setSelectedState, setCurrentPage, setItemsPerPage } = citySlice.actions;

export default citySlice.reducer;