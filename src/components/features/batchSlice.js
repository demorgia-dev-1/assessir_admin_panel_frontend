import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../constant";
import { fetchJobRolesBySector } from "./jobRoleSlice";
import { fetchSectors } from "./subAdminSlice";

import toast from "react-hot-toast";

export const createBatch = createAsyncThunk('batch/createBatch', async (batch, { rejectWithValue }) => {
    try {
        const response = await fetch(`${BASE_URL}company/batches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify(batch)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            toast.error(errorData.message || 'Error creating batch');
            return rejectWithValue(errorData);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request was aborted');
            toast.error('Request was aborted');
        } else {
            console.error('Error message:', error.message);
            toast.error(error.message || 'Unknown error occurred');
        }
        console.log("Error", error);
        return rejectWithValue('Unknown error');
    }
});

export const fetchBatches = createAsyncThunk('batch/fetchBatches', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/batches`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            }
        });
        console.log("Batch response", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching batches:", error);
        return rejectWithValue(error.response?.data || 'Unknown error');
    }
});

export const fetchBatchesBySectorJobRole = createAsyncThunk('batch/fetchBatchesBySectorJobRole', async ({ sectorId, jobRoleId }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/batches`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            params: {
                sector: sectorId,
                jobRole: jobRoleId
            }
        });
        console.log("Batch response BY sector", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching batches:", error);
        return rejectWithValue(error.response?.data || 'Unknown error');
    }
});



export const fetchAssessorsByJobRole = createAsyncThunk('assessor/fetchAssessorsByJobRole', async ({ jobRoleId, sectorId }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/assessors`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            params: {
                jobRole: jobRoleId,
                sector: sectorId,
            }
        });
        console.log("assessor response by sector jobrole", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching assessors:", error);
        return rejectWithValue(error.response?.data || 'Unknown error');
    }
});

export const extendEndDate = createAsyncThunk('batch/extendEndDate', async ({ batchId, endDate }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/batches/${batchId}/extend-end-date`, { endDate }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            }
        });
        console.log("Extend end date response", response);
        toast.success(response.data.message || 'End date extended successfully');
        return response.data.data;
    } catch (error) {
        console.error("Error extending end date:", error);
        toast.error(error.response?.data?.message || 'Unknown error occurred. Please try again.');
        return rejectWithValue(error.response?.data || 'Unknown error');
    }
});

export const updateBatch = createAsyncThunk(
    'batch/updateBatch',
    async (batch, { rejectWithValue }) => {

        const { _id, ...batchData } = batch;
        try {
            const response = await axios.patch(`${BASE_URL}company/batches/${_id}`, batchData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            toast.success("Batch updated successfully!");

            console.log("Update batch response", response);
            return response.data.data;
        } catch (error) {

            const errorMessage = error.response?.data?.message || 'Unknown error occurred. Please try again.';

            toast.error(`Failed to update batch: ${errorMessage}`);
            console.error("Error updating batch:", error);
            return rejectWithValue(error.response?.data || errorMessage);
        }
    }
);

export const deleteBatch = createAsyncThunk('batch/deleteBatch', async (batchId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/batches/${batchId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        toast.success("Batch deleted successfully!");
        return { _id: batchId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete Batch: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const deleteCandidateFromBatch = createAsyncThunk('batch/deleteCandidateFromBatch', async (batchId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/batches/${batchId}/candidates`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        toast.success("Candidate deleted successfully!");
        return { batchId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete candidate: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const clearBatchResponses = createAsyncThunk('batch/clearBatchResponses', async (batchId,{rejectWithValue}) => {  
    try {
        await axios.delete(`${BASE_URL}company/batches/${batchId}/candidates/clear-responses`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success("Responses cleared successfully!");
        return { batchId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to clear responses: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});



const batchSlice = createSlice({
    name: 'batch',
    initialState: {
        sectors: [],
        jobRoles: [],
        assessors: [],
        batches: [],
        selectedSector: null,
        selectedJobRole: null,
        selectedAssessor: null,
        totalBatches: 0,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {

        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
        },
        setSelectedJobRole: (state, action) => {
            state.selectedJobRole = action.payload;
            state.currentPage = 1;
        },
        setSelectedAssessor: (state, action) => {
            state.selectedAssessor = action.payload;
        },

    },
    extraReducers: (builder) => {
        builder

            .addCase(updateBatch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.batches.findIndex((batch) => batch._id === action.payload._id);
                state.batches[index] = action.payload;
            })
            .addCase(updateBatch.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteBatch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batches = state.batches.filter((batch) => batch._id !== action.payload._id);
            })
            .addCase(deleteBatch.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchBatches.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBatches.fulfilled, (state, action) => {
                state.batches = action.payload;
                state.totalBatches = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchBatches.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })

            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchJobRolesBySector.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobRolesBySector.fulfilled, (state, action) => {
                state.jobRoles = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchJobRolesBySector.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchAssessorsByJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAssessorsByJobRole.fulfilled, (state, action) => {
                state.assessors = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAssessorsByJobRole.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchBatchesBySectorJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBatchesBySectorJobRole.fulfilled, (state, action) => {
                state.batches = action.payload;
                state.totalBatches = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchBatchesBySectorJobRole.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createBatch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batches.push(action.payload);
                state.totalBatches += 1;
            })
            .addCase(createBatch.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(extendEndDate.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(extendEndDate.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.batches.findIndex((batch) => batch?._id === action?.payload?._id);
                state.batches[index] = action.payload;
            })
            .addCase(extendEndDate.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteCandidateFromBatch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCandidateFromBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batches = state.batches.filter((batch) => batch._id !== action.payload.batchId);
            })
            .addCase(deleteCandidateFromBatch.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(clearBatchResponses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(clearBatchResponses.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.batches.findIndex((batch) => batch._id === action.payload.batchId);
                state.batches[index] = action.payload;
            })
            .addCase(clearBatchResponses.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { setSelectedSector, setSelectedJobRole, setSelectedAssessor } = batchSlice.actions;

export default batchSlice.reducer;