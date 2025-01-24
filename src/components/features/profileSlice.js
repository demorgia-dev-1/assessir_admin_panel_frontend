import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";

export const fetchAdminProfile = createAsyncThunk('profile/fetchAdminProfile', async (adminId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return rejectWithValue('Invalid token');
        }
        const response = await axios.get(`${BASE_URL}company/admin/${adminId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);

    }
});

export const fetchAssessorProfile = createAsyncThunk('profile/fetchAssessorProfile', async (assessorId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return rejectWithValue('Invalid token');
        }
        const response = await axios.get(`${BASE_URL}/assessor/${assessorId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

export const fetchCandidateProfile = createAsyncThunk('profile/fetchCandidateProfile', async (candidateId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return rejectWithValue('Invalid token');
        }
        const response = await axios.get(`${BASE_URL}/candidate/${candidateId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});


export const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        adminProfile: {},
        assessorProfile: {},
        candidateProfile: {},
        loading: false,
        error: null
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.adminProfile = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAssessorProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAssessorProfile.fulfilled, (state, action) => {
                state.assessorProfile = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAssessorProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCandidateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCandidateProfile.fulfilled, (state, action) => {
                state.candidateProfile = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchCandidateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default profileSlice.reducer;
