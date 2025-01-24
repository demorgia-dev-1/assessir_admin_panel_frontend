import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchCitiesByStateId } from './citySlice';
import { fetchAllCountries } from './countrySlice';
import { fetchStates } from './stateSlice';

export const fetchTps = createAsyncThunk(
    'tp/fetchTps',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}company/training-partners`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            console.log('tps response:', response.data.data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createTp = createAsyncThunk(
    'tp/createTp',
    async (newTp, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}company/training-partners`, newTp, {
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

export const updateTp = createAsyncThunk(
    'tp/updateTp',
    async ({ _id, updatedTp }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/training-partners/${_id}`, updatedTp, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            toast.success('TP Updated Successfully')
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.message)
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteTp = createAsyncThunk(
    'tp/deleteTp',
    async (tpId, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}company/training-partners/${tpId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return tpId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const tpSlice = createSlice({
    name: 'tp',
    initialState: {
        countries: [],
        states: [],
        cities: [],
        tps: [],

        selectedCountry: null,
        selectedState: null,
        selectedCity: null,
        currentPage: 1,
        itemsPerPage: 5,
        totalTps: 0,
        isLoading: false,
        error: null,
    },
    reducers: {
        setTotalTps: (state, action) => {
            state.totalTps = action.payload;
        },
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
            state.currentPage = 1;
        },
        setSelectedState: (state, action) => {
            state.selectedState = action.payload;
            state.currentPage = 1;
        },
        setSelectedCity: (state, action) => {
            state.selectedCity = action.payload;
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
            .addCase(fetchStates.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.states = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCitiesByStateId.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCitiesByStateId.fulfilled, (state, action) => {
                state.cities = action.payload;
                state.isLoading = false;
            })

            .addCase(fetchCitiesByStateId.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchTps.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTps.fulfilled, (state, action) => {
                state.tps = action.payload;
                state.totalTps = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchTps.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createTp.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createTp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tps.push(action.payload);
                state.totalTps += 1;

            })
            .addCase(createTp.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { setTotalTps, setSelectedCountry, setSelectedState, setSelectedCity, setCurrentPage, setItemsPerPage } = tpSlice.actions;

export default tpSlice.reducer;