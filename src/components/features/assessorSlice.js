import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../constant";
import { fetchCitiesByStateId, fetchStates } from "./citySlice";
import { fetchAllCountries } from "./countrySlice";
import { fetchSectors } from "./subAdminSlice";


export const fetchJobRoles = createAsyncThunk('jobRole/fetchJobRoles', async (sectors, { rejectWithValue }) => {
    try {

        console.log('Sectors array:', sectors);

        if (!Array.isArray(sectors) || sectors.length === 0) {
            throw new Error('Invalid sectors array');
        }

        const params = new URLSearchParams();
        sectors.forEach(sector => {
            if (sector && sector !== 'undefined') {
                params.append('sectors', sector);
            }
        });

        const response = await axios.get(`${BASE_URL}company/jobs`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': "Bearer " + sessionStorage.getItem("token"),
            },
            params: params
        });
        console.log("jobroles response", response);
        return response.data.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response ? error.response.data : error.message);
    }
});
export const createAssessor = createAsyncThunk('assessor/createAssessor', async (assessor, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${BASE_URL}company/assessors`, assessor, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success('Assessor created successfully');
        return response.data.data;
    } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

export const fetchAssessors = createAsyncThunk('assessor/fetchAssessors', async (sectors, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        sectors.forEach(sector => params.append('sector', sector));

        const response = await axios.get(`${BASE_URL}company/assessors`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            },
            params: params
        });
        console.log("assessor response", response);
        return response.data.data;
    } catch (error) {

        return rejectWithValue(error.response?.data);
    }
});

export const fetchAssessorsByJobRole = createAsyncThunk('assessor/fetchAssessorsByJobRole', async (jobRole, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}company/assessors`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            params: {
                jobRole: jobRole,
            }
        });
        console.log("assessor response by sector jobrole", response);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching assessors:", error);
        return rejectWithValue(error.response?.data || 'Unknown error');
    }
});

export const updateAssessors = createAsyncThunk(
    'assessor/updateAssessors',
    async ({ _id, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}company/assessors/${_id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            toast.success('Assessor updated successfully');
            return response.data.data;
        } catch (error) {
            toast.error(error.response.data.message);
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteAssessor = createAsyncThunk('assessor/deleteAssessor', async (assessorId, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${BASE_URL}company/assessors/${assessorId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token")
            }
        });
        toast.success('Assessor deleted successfully');
        return response.data.data;
    } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data);
    }
});

const assessorSlice = createSlice({
    name: 'assessor',
    initialState: {
        sectors: [],
        jobRoles: [],
        assessors: [],
        countries: [],
        states: [],
        cities: [],
        selectedSectors: null,
        selectedJobRoles: null,
        selectedCountry: null,
        selectedState: null,
        selectedCity: null,
        totalAssessors: 0,
        itemsPerPage: 10,
        isLoading: false,
        error: null,
    },
    reducers: {
        setSelectedSectors: (state, action) => {
            state.selectedSectors = action.payload;
        },
        setSelectedJobRoles: (state, action) => {
            state.selectedJobRoles = action.payload;
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
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        },
        clearAssessors: (state) => {
            state.assessors = [];
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
            .addCase(fetchSectors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
                state.isLoading = false;

            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchJobRoles.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobRoles.fulfilled, (state, action) => {
                state.jobRoles = action.payload;
                state.totalJobRoles = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchJobRoles.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAssessors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAssessors.fulfilled, (state, action) => {
                state.assessors = action.payload;
                state.totalAssessors = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchAssessors.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAssessorsByJobRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAssessorsByJobRole.fulfilled, (state, action) => {
                state.assessors = action.payload;
                state.totalAssessors = action.payload.length;
                state.isLoading = false;
            })
            .addCase(fetchAssessorsByJobRole.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(createAssessor.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createAssessor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assessors.push(action.payload);
                state.totalAssessors += 1;
            })
            .addCase(createAssessor.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateAssessors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAssessors.fulfilled, (state, action) => {
                const index = state.assessors.findIndex(assessor => assessor._id === action.payload._id);
                if (index !== -1) {
                    state.assessors[index] = action.payload;
                }
            })
            .addCase(updateAssessors.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteAssessor.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAssessor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assessors = state.assessors.filter(assessor => assessor._id !== action.payload._id);
                state.totalAssessors -= 1;
            })

    }
});

export const { setAssessors, setSelectedSectors, setSelectedJobRoles, setSelectedCountry, setSelectedState, setSelectedCity, setItemsPerPage, clearAssessors } = assessorSlice.actions;

export default assessorSlice.reducer;
