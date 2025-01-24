import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";
import { fetchJobRolesBySector } from "./jobRoleSlice";
import { fetchSectors } from "./subAdminSlice";

export const createQuestionSet = createAsyncThunk('question/createQuestionBank', async (questionBank, { rejectWithValue }) => {
    try {
        console.log("Creating question set with payload:", questionBank);

        const response = await axios.post(`${BASE_URL}company/question-banks`, questionBank, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        console.log("Question set created successfully:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error creating question set:", error);
        toast.error(error.response?.data?.message || "Error creating question set");
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const fetchQuestionSets = createAsyncThunk('questionsets/fetchQuestionSets', async (_, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await axios.get(`${BASE_URL}company/question-banks`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("question Set response", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching question Set:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const fetchQuestionSetsBySectorJobRole = createAsyncThunk(
    'questionsets/fetchQuestionSetsBySectorJobRole',
    async ({ sectorId, jobRoleId }, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error("No token found in sessionStorage");
            }

            console.log("Fetching question sets with params:", { sectorId, jobRoleId });

            const response = await axios.get(`${BASE_URL}company/question-banks`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    sector: sectorId,
                    jobRole: jobRoleId,
                },
            });

            console.log("Question Set response", response);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching question Set:", error);
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const updateQuestionSet = createAsyncThunk('question/updateQuestionSet', async ({ _id, updatedQuestionSet }, { rejectWithValue }) => {
    try {

        const response = await axios.patch(`${BASE_URL}company/question-banks/${_id}`, updatedQuestionSet, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        if (response.status === 200) {
            toast.success("Question set updated successfully!");
        }
        console.log("Question set updated successfully:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error updating question set:", error);
        toast.error(error.response?.data?.message || "Error updating question set");
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const deleteQuestionSet = createAsyncThunk('question/deleteQuestionSet', async (questionSetId, { rejectWithValue }) => {
    try {
        await axios.delete(`${BASE_URL}company/question-banks/${questionSetId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        toast.success("Question Set deleted successfully!");
        return { _id: questionSetId };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to delete Question Set: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const lockQuestionSet = createAsyncThunk('question/lockQuestionSet', async (questionSetId, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/question-banks/${questionSetId}/lock`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        if (response.status === 200) {
            toast.success("Question set locked successfully!");
        }
        console.log("Question set locked successfully:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error locking question set:", error);
        toast.error(error.response?.data?.message || "Error locking question set");
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});


const questionSetSlice = createSlice({
    name: 'questionSet',
    initialState: {
        questionSets: [],
        sectors: [],
        jobRoles: [],
        selectedSector: null,
        selectedJobRole: null,
        totalQuestionSets: 0,
        currentPage: 1,
        itemsPerPage: 5,
        isLoading: false,
        error: null,
    },
    reducers: {
        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
        },
        setSelectedJobRole: (state, action) => {
            state.selectedJobRole = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateQuestionSet.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateQuestionSet.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.questionSets.findIndex((questionSet) => questionSet._id === action.payload?._id);
                state.questionSets[index] = action.payload;
            })
            .addCase(updateQuestionSet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteQuestionSet.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteQuestionSet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questionSets = state.questionSets.filter((questionSet) => questionSet._id !== action.payload._id);
            })
            .addCase(deleteQuestionSet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(lockQuestionSet.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(lockQuestionSet.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.questionSets.findIndex((questionSet) => questionSet._id === action.payload._id);
                state.questionSets[index] = action.payload;
            })
            .addCase(lockQuestionSet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sectors = action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchJobRolesBySector.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobRolesBySector.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobRoles = action.payload;
            })
            .addCase(fetchJobRolesBySector.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchQuestionSets.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuestionSets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.totalQuestionSets = action.payload.length;
                state.questionSets = action.payload;
            })
            .addCase(fetchQuestionSets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.totalQuestionSets = action.payload.length;
                state.questionSets = action.payload;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createQuestionSet.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createQuestionSet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questionSets.push(action.payload);
                state.totalQuestionSets += 1;
            })
            .addCase(createQuestionSet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setSelectedSector, setSelectedJobRole, setCurrentPage } = questionSetSlice.actions;

export default questionSetSlice.reducer;