import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../constant";
import { fetchBatches } from "./batchSlice";


export const fetchCandidateByBatchId = createAsyncThunk('candidate/fetchCandidateByBatchId', async (batchId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await axios.get(`${BASE_URL}company/candidates?batchId=${batchId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("candidates response by batch", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching candidates:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const candidateEvidenceSlice = createSlice({
    name: 'candidateEvidence',
    initialState: {
        batches: [],
        candidates: [],
        selectedBatch: null,
        totalCandidates: 0,
        currentPage: 0,
        itemsPerPage: 10,
        isLoading: false,
        error: null,

    },
    reducers: {
        setSelectedBatch: (state, action) => {
            state.selectedBatch = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        },
        clearBatches: (state) => {
            state.batches = [];
        },
        clearCandidates: (state) => {
            state.candidates = [];
        },
        clearJobRoles: (state) => {
            state.jobRoles = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBatches.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBatches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batches = action.payload;
            })
            .addCase(fetchBatches.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch batches";
            })

            .addCase(fetchCandidateByBatchId.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCandidateByBatchId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.candidates = action.payload;
                state.totalCandidates = action.payload.length;
            })
            .addCase(fetchCandidateByBatchId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch candidates";
            })

    }
});

export const { setSelectedBatch, setCurrentPage, setItemsPerPage, clearCandidates, clearBatches, clearJobRoles } = candidateEvidenceSlice.actions;

export default candidateEvidenceSlice.reducer;