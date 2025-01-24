import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";
import { fetchBatches } from "./batchSlice";

export const fetchCandidates = createAsyncThunk('candidate/fetchCandidates', async (_, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await axios.get(`${BASE_URL}company/candidates`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("candidates response", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching candidates:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

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

export const createCandidate = createAsyncThunk('candidate/createCandidate', async (candidate, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await fetch(`${BASE_URL}company/candidates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: candidate
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            toast.error(errorData.message || 'Error creating candidate');
            return rejectWithValue(errorData);
        }

        const data = await response.json();
        console.log(data);
        return data.data;
    } catch (error) {
        console.error("Error creating candidate:", error);
        toast.error(error.message || 'Unknown error occurred');
        return rejectWithValue(error.message || 'Unknown error');
    }
});

export const updateCandidate = createAsyncThunk('candidate/updateCandidate', async ({ _id, updatedCandidate }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/candidates/${_id}`, updatedCandidate, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success("candidate updated successfully!");
        return response.data.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to update Candidate details: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const deleteCandidate = createAsyncThunk('candidate/deleteCandidate', async (candidateId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/candidates/${candidateId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        toast.success("Candidate deleted successfully!");
        return { _id: candidateId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete Batch: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const candidateSlice = createSlice({
    name: 'candidate',
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
        clearCandidates: (state) => {
            state.candidates = [];
        },
        clearBatches: (state) => {
            state.batches = [];
        }
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
            .addCase(fetchCandidates.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.candidates = action.payload;
                state.totalCandidates = action.payload.length;
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch candidates";
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
            .addCase(createCandidate.fulfilled, (state, action) => {
                state.candidates.push(action.payload);
                state.totalCandidates++;
            })
            .addCase(updateCandidate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCandidate.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.candidates.findIndex(candidate => candidate._id === action.payload._id);
                if (index !== -1) {

                    state.candidates = [
                        ...state.candidates.slice(0, index),
                        action.payload,
                        ...state.candidates.slice(index + 1)
                    ];
                }
            })
            .addCase(updateCandidate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update candidate";
            })
            .addCase(deleteCandidate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCandidate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.candidates = state.candidates.filter(candidate => candidate._id !== action.payload._id);
                state.totalCandidates--;
            })
            .addCase(deleteCandidate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete candidate";
            });
    }
});

export const { setSelectedBatch, setCurrentPage, setItemsPerPage, clearBatches, clearCandidates } = candidateSlice.actions;

export default candidateSlice.reducer;