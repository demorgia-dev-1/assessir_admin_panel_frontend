import { configureStore } from '@reduxjs/toolkit';
import assessorReducer from './components/features/assessorSlice';
import assignTestSliceReducer from './components/features/assignTestSlice';
import batchReducer from './components/features/batchSlice';
import candidateEvidenceReducer from './components/features/candidateBatchStatusSlice';
import candidateReducer from './components/features/candidateSlice';
import cityReducer from './components/features/citySlice';
import companyReducer from './components/features/companySlice';
import countryReducer from './components/features/countrySlice';
import jobRoleReducer from './components/features/jobRoleSlice';
import nosReducer from './components/features/nosSlice';
import pcReducer from './components/features/pcSlice';
import profileReducer from './components/features/profileSlice';
import questionManageReducer from './components/features/questionManageSlice';
import questionReducer from './components/features/questionSetSlice';
import reportReducer from './components/features/reportsSlice';
import sectorReducer from './components/features/sectorSlice';
import stateReducer from './components/features/stateSlice';
import subAdminReducer from './components/features/subAdminSlice';
import tcReducer from './components/features/tcSlice';
import tpReducer from './components/features/tpSlice';

const store = configureStore({
    reducer: {
        country: countryReducer,
        state: stateReducer,
        city: cityReducer,
        sector: sectorReducer,
        company: companyReducer,
        jobRole: jobRoleReducer,
        subAdmin: subAdminReducer,
        nos: nosReducer,
        pc: pcReducer,
        tp: tpReducer,
        tc: tcReducer,
        assessor: assessorReducer,
        batch: batchReducer,
        questionSet: questionReducer,
        questionManage: questionManageReducer,
        assignTest: assignTestSliceReducer,
        candidate: candidateReducer,
        report: reportReducer,
        candidateEvidence: candidateEvidenceReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
