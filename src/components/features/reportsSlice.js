import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../constant';

export const fetchReports = createAsyncThunk('reports/fetchReports', async (batchId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }
        const response = await axios.get(`${BASE_URL}company/batches/${batchId}/report-from-logs`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("reports response", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching reports:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
}
);

const reportsSlice = createSlice({
    name: 'report',
    initialState: {
        reports: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        clearReport: (state) => {
            state.reports = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReports.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reports = action.payload;
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

    },
});

export const { clearReport } = reportsSlice.actions;
export default reportsSlice.reducer;