import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constant';

export const fetchCompanies = createAsyncThunk(
    'country/fetchCompanies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}super/company`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            return response.data.data;
        } catch (error) {
            toast.error('Failed to fetch companies: ' + error.response.data.message);
            return rejectWithValue(error.response.data);
        }
    }
);

export const createCompany = createAsyncThunk(
    'country/createCompany',
    async (newCompany, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}super/company`, newCompany, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });
            toast.success('Company created successfully!');
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.code === 11000) {
                toast.error('Duplicate email error: This email is already in use.');
            } else {
                toast.error('Failed to create company: ' + error.response.data.message);
            }
            return rejectWithValue(error.response.data);
        }
    }
);


const companySlice = createSlice({
    name: 'company',
    initialState: {
        companies: [],
        totalCompanies: 0,
        currentPage: 0,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setTotalCompanies: (state, action) => {
            state.totalCompanies = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanies.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.companies = action.payload;
                state.totalCompanies = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchCompanies.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createCompany.fulfilled, (state, action) => {
                state.companies.push(action.payload);
                state.totalCompanies += 1;
            })

            .addCase(createCompany.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setTotalCompanies, setItemsPerPage } = companySlice.actions;

export default companySlice.reducer;
