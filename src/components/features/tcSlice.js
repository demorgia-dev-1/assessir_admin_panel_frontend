import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';
import { fetchCitiesByStateId } from './citySlice';
import { fetchAllCountries } from './countrySlice';
import { fetchStates } from './stateSlice';

export const fetchTcs = createAsyncThunk(
    'tc/fetchTcs',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}company/training-centers?cityId=${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            console.log('tcs response:', response.data.data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createTc = createAsyncThunk(
    'tc/createTc',
    async ({ newTc, tpId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}company/training-partners/${tpId}/training-centers`, newTc, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },

            });
            toast.success('Training Center Added Successfully')
            return response.data.data;

        } catch (error) {
            toast.error(error?.response?.data?.message)
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateTc = createAsyncThunk(
    'tc/updateTc',
    async ({ _id, updatedTc }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/training-partners/${_id}`, updatedTc, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            toast.success('Training Center updated successfully');
            return response.data.data;

        } catch (error) {
            toast.error(error.response?.data?.message);
            return rejectWithValue(error.response.data);

        }
    }
);

export const deleteTc = createAsyncThunk(
    'tc/deleteTc',
    async (tcId, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}company/training-partners/${tcId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return tcId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const tcSlice = createSlice({
    name: 'tc',
    initialState: {
        countries: [],
        states: [],
        cities: [],
        tps: [],
        tcs: [],
        selectedCountry: null,
        selectedState: null,
        selectedCity: null,
        selectedTc: null,
        selectedTp: null,
        itemsPerPage: 10,
        totalTcs: 0,
        isLoading: false,
        error: null,
    },
    reducers: {

        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
        },
        setSelectedState: (state, action) => {
            state.selectedState = action.payload;

        },
        setSelectedCity: (state, action) => {
            state.selectedCity = action.payload;
        },
        setSelectedTp: (state, action) => {
            state.selectedTp = action.payload;
        },
        setSelectedTc: (state, action) => {
            state.selectedTc = action.payload;
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
            .addCase(fetchTcs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTcs.fulfilled, (state, action) => {
                state.tcs = action.payload;
                state.totalTcs = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchTcs.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createTc.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createTc.fulfilled, (state, action) => {
                state.tcs.push(action.payload);
                state.totalTps += 1;
                state.isLoading = false;
            })
            .addCase(createTc.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(updateTc.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateTc.fulfilled, (state, action) => {
                const index = state.tcs.findIndex((tc) => tc._id === action.payload._id);
                state.tcs[index] = action.payload;
                state.isLoading = false;
            })
            .addCase(updateTc.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(deleteTc.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteTc.fulfilled, (state, action) => {
                state.tcs = state.tcs.filter((tc) => tc._id !== action.payload);
                state.totalTcs -= 1;
                state.isLoading = false;
            })
            .addCase(deleteTc.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });

    }
});

export const { setSelectedCountry, setSelectedState, setSelectedCity, setCurrentPage, setItemsPerPage, setSelectedTc, setSelectedTp } = tcSlice.actions;

export default tcSlice.reducer;