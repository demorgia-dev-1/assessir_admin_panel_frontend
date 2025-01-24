import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";
import { fetchAssessorsByJobRole, fetchBatchesBySectorJobRole } from "./batchSlice";
import { fetchCitiesByStateId } from "./citySlice";
import { fetchAllCountries } from "./countrySlice";
import { fetchJobRolesBySector } from "./jobRoleSlice";
import { fetchQuestionSetsBySectorJobRole } from "./questionSetSlice";
import { fetchStates } from "./stateSlice";
import { fetchSectors } from "./subAdminSlice";
import { fetchTcs } from "./tcSlice";

export const assignTestToAssessor = createAsyncThunk(
    'assign/assignTestToAssessor',
    async ({ batchId, payload }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/batches/${batchId}/assign-batch`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`
                }
            });

            console.log(response);
            toast.success('Test assigned successfully');
            return response.data.data || {};
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
            console.error('Error in request:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const assignTestSlice = createSlice({
    name: 'assignTest',
    initialState: {
        countries: [],
        states: [],
        cities: [],
        batches: [],
        assessors: [],
        jobRoles: [],
        sectors: [],
        questionSets: [],
        theoryQuestionSets: [],
        practicalQuestionSets: [],
        vivaQuestionSets: [],
        tcs: [],
        selectedTc: null,
        selectedCountry: null,
        selectedState: null,
        selectedCity: null,
        selectedTheoryQuestionSet: null,
        selectedPracticalQuestionSet: null,
        selectedVivaQuestionSet: null,
        selectedBatch: null,
        selectedAssessor: null,
        selectedJobRole: null,
        selectedSector: null,
        selectedQuestionSet: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearAssignTestState: (state) => {
            state.isLoading = false;
            state.error = null;
        },
        setSelectedTcs: (state, action) => {
            state.selectedTc = action.payload;
        },
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
        },
        setSelectedState: (state, action) => {
            state.selectedState = action.payload;
        },
        setSelectedCity: (state, action) => {
            state.selectedCity = action.payload;
        },
        setSelectedBatch: (state, action) => {
            state.selectedBatch = action.payload;
        },
        setSelectedAssessor: (state, action) => {
            state.selectedAssessor = action.payload;
        },
        setSelectedJobRole: (state, action) => {
            state.selectedJobRole = action.payload;
        },
        setSelectedSector: (state, action) => {
            state.selectedSector = action.payload;
        },
        setSelectedQuestionSet: (state, action) => {
            state.selectedQuestionSet = action.payload;
        },
        setSelectedTheoryQuestionSet: (state, action) => {
            state.selectedTheoryQuestionSet = action.payload;
        },
        setSelectedPracticalQuestionSet: (state, action) => {
            state.selectedPracticalQuestionSet = action.payload;
        },
        setSelectedVivaQuestionSet: (state, action) => {
            state.selectedVivaQuestionSet = action.payload;
        },
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
            .addCase(fetchBatchesBySectorJobRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBatchesBySectorJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batches = action.payload;
            })
            .addCase(fetchBatchesBySectorJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchAssessorsByJobRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssessorsByJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assessors = action.payload;
            })
            .addCase(fetchAssessorsByJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchJobRolesBySector.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobRolesBySector.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobRoles = action.payload;
            })
            .addCase(fetchJobRolesBySector.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sectors = action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questionSets = action.payload;
            })
            .addCase(fetchQuestionSetsBySectorJobRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchTcs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTcs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tcs = action.payload;
            })
            .addCase(assignTestToAssessor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(assignTestToAssessor.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log('Assign test fulfilled with data:', action.payload);

                if (action.payload && Array.isArray(action.payload)) {
                    state.batches = [...state.batches, ...action.payload];
                } else if (action.payload) {
                    state.batches = [...state.batches, action.payload];
                }
            })
            .addCase(assignTestToAssessor.rejected, (state, action) => {
                state.isLoading = false;
                console.error('Assign test failed:', action.payload);
                state.error = action.payload;
            });
    }
});

export const { setSelectedBatch, setSelectedAssessor, setSelectedJobRole, setSelectedSector, setSelectedQuestionSet, setSelectedTheoryQuestionSet, setSelectedPracticalQuestionSet, setSelectedVivaQuestionSet, setSelectedProjectQuestionSet, setSelectedCountry, setSelectedState, setSelectedCity, setSelectedTcs } = assignTestSlice.actions;

export default assignTestSlice.reducer;
