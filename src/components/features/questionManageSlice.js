import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";
import { fetchJobRolesBySector } from "./jobRoleSlice";
import { fetchNos } from "./nosSlice";
import { fetchPCs } from "./pcSlice";
import { fetchQuestionSets, fetchQuestionSetsBySectorJobRole } from "./questionSetSlice";
import { fetchSectors } from "./subAdminSlice";

export const fetchQuestions = createAsyncThunk('question/fetchQuestions', async (_, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await axios.get(`${BASE_URL}company/questions`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("questions response", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const fetchQuestionsByQuestionSet = createAsyncThunk('question/fetchQuestionsByQuestionSet', async (questionSetId, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("No token found in sessionStorage");
        }

        const response = await axios.get(`${BASE_URL}company/questions?questionBank=${questionSetId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (error) {
        console.error("Error fetching questions by question set:", error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});

export const createQuestion = createAsyncThunk(
    'question/createQuestion',
    async (question, { rejectWithValue }) => {
        try {
            console.log("Creating question with payload:", question);

            const response = await axios.post(`${BASE_URL}company/questions`, question, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + sessionStorage.getItem("token"),
                },
            });

            toast.success("Question created successfully!");
            console.log("Question created successfully:", response.data.data);

            return response.data.data;
        } catch (error) {

            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

            toast.error(`Failed to create question: ${errorMessage}`);
            console.error("Error creating question:", error);

            return rejectWithValue(error.response ? error.response.data.message : errorMessage);
        }
    })

export const deleteQuestion = createAsyncThunk('question/deleteQuestion', async (questionId, { rejectWithValue }) => {
    try {
        console.log("Deleting question with id:", questionId);

        const response = await axios.delete(`${BASE_URL}company/questions/${questionId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        console.log("Question deleted successfully:", response.data.data);
        toast.success("Question deleted successfully!");
        return questionId;
    } catch (error) {
        console.error("Error deleting question:", error);
        toast.error(error.response ? error.response.data?.message : error.message);
        return rejectWithValue(error.response ? error.response.data?.message : error.message);
    }
});

export const updateQuestion = createAsyncThunk('question/updateQuestion', async ({ _id, updatedQuestion }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${BASE_URL}company/questions/${_id}`, updatedQuestion, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });

        console.log("Question updated successfully:", response.data.data);
        toast.success("Question updated successfully!");
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to update question details: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});


const questionManageSlice = createSlice({
    name: 'questionManage',
    initialState: {
        sectors: [],
        jobRoles: [],
        noses: [],
        pcNames: [],
        paperSets: [],
        questions: [],
        selectedSector: null,
        selectedJobRole: null,
        selectedNOS: null,
        selectedPcName: null,
        selectedPaperSet: null,
        totalQuestions: 0,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
        },
        setSelectedJobRole: (state, action) => {
            state.selectedJobRole = action.payload;
        },
        setSelectedNOS: (state, action) => {
            state.selectedNOS = action.payload;
        },
        setSelectedPcName: (state, action) => {
            state.selectedPcName = action.payload;
        },
        setSelectedPaperSet: (state, action) => {
            state.selectedPaperSet = action.payload;
        },
        setQuestions: (state, action) => {
            state.questions = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sectors = action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch sectors";
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
                state.error = action.payload || "Failed to fetch job roles";
            })
            .addCase(fetchNos.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.noses = action.payload;
            })
            .addCase(fetchNos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch NOS codes";
            })

            .addCase(fetchPCs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPCs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pcNames = action.payload;
            })
            .addCase(fetchPCs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch PC names";
            })
            .addCase(fetchQuestionSets.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuestionSets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.paperSets = action.payload;
            })
            .addCase(fetchQuestionSets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch paper sets";
            })
            .addCase(fetchQuestions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questions = action.payload;
                state.totalQuestions = action.payload.length;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch questions";
            })
            .addCase(fetchQuestionSetsBySectorJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.paperSets = action.payload;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch paper sets";
            })
            .addCase(createQuestion.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createQuestion.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questions.push(action.payload);
                state.totalQuestions += 1;
            })
            .addCase(createQuestion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to create question";
            })
            .addCase(deleteQuestion.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questions = state.questions.filter(question => question.id !== action.payload);
                state.totalQuestions -= 1;
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete question";
            })
            .addCase(updateQuestion.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                const index = state.questions.findIndex(question => question._id === action.payload._id);
                if (index !== -1) {
                    state.questions[index] = action.payload;
                }
            })
            .addCase(updateQuestion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update question";
            })
            .addCase(fetchQuestionsByQuestionSet.pending, (state) => {
                state.isLoading = true;
            }
            )
            .addCase(fetchQuestionsByQuestionSet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questions = action.payload;
                state.totalQuestions = action.payload.length;
            })
            .addCase(fetchQuestionsByQuestionSet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch questions by question set";
            })
    }
});

export const { setCurrentPage, setSelectedSector, setSelectedJobRole, setSelectedNOS, setSelectedNOSElement, setSelectedPcName, setSelectedPaperSet, setQuestions, setItemsPerPage } = questionManageSlice.actions;
export default questionManageSlice.reducer;