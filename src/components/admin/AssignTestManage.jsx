/* eslint-disable no-unused-vars */
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import { IoMdAdd } from "react-icons/io";
import { VscClearAll } from "react-icons/vsc";
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { assignTestToAssessor, setSelectedAssessor, setSelectedBatch, setSelectedCity, setSelectedCountry, setSelectedJobRole, setSelectedPracticalQuestionSet, setSelectedSector, setSelectedState, setSelectedTcs, setSelectedTheoryQuestionSet, setSelectedVivaQuestionSet } from '../features/assignTestSlice';
import { fetchAssessorsByJobRole, fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { fetchCitiesByStateId } from '../features/citySlice';
import { fetchAllCountries } from '../features/countrySlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchQuestionSetsBySectorJobRole } from '../features/questionSetSlice';
import { fetchStates } from '../features/stateSlice';
import { fetchSectors } from '../features/subAdminSlice';
import { fetchTcs } from '../features/tcSlice';
import QuestionSetSelector from './QuestionSetSelector';


const ManageAssignTest = () => {
    const [submitted, setSubmitted] = useState(false);
    const [assessorDetails, setAssessorDetails] = useState();
    const [tcDetails, setTcDetails] = useState();
    const [isCandidatePhotosRequired, setIsCandidatePhotosRequired] = useState(true);
    const [isCandidateVideoRequired, setIsCandidateVideoRequired] = useState(true);
    const [isCandidateLocationRequired, setIsCandidateLocationRequired] = useState(true);
    const [isCandidateAdharRequired, setisCandidateAdharRequired] = useState(true);
    const [isCandidateSelfieRequired, setIsCandidateSelfieRequired] = useState(true);
    const [showNotTranslatedModal, setShowNotTranslatedModal] = useState(false);
    const [notTranslatedTypes, setNotTranslatedTypes] = useState([]);
    const [isRandomizeQuestionsRequired, setIsRandomizeQuestionsRequired] = useState(true);
    const [isAiRequired, setIsAiRequired] = useState(true);


    const handleCreateTC = () => {
        window.location.href = '/manageTC';
    };

    const handleCreateAssessor = () => {
        window.location.href = '/manageAssessor';
    };


    const {
        batches, assessors, jobRoles, sectors, questionSets,
        selectedBatch, selectedAssessor, selectedJobRole,
        selectedSector, selectedTheoryQuestionSet, selectedPracticalQuestionSet,
        selectedVivaQuestionSet, selectedCountry, selectedState, selectedCity, countries, states, cities, tcs, selectedTc
    } = useSelector(state => state.assignTest);


    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();


    const saveFormData = () => {
        const formData = {
            selectedSector, selectedJobRole, selectedBatch, selectedAssessor,
            selectedTc, selectedTheoryQuestionSet, selectedPracticalQuestionSet,
            selectedVivaQuestionSet, selectedCountry, selectedState, selectedCity,
            assessorDetails, tcDetails, isCandidatePhotosRequired, isCandidateVideoRequired,
            isCandidateLocationRequired, isCandidateAdharRequired, isCandidateSelfieRequired,
            isAiRequired
        };
        sessionStorage.setItem('assignTestFormData', JSON.stringify(formData));
    };
    const loadFormData = () => {
        const formData = JSON.parse(sessionStorage.getItem('assignTestFormData'));
        if (formData) {
            dispatch(setSelectedSector(formData.selectedSector));
            dispatch(setSelectedJobRole(formData.selectedJobRole));
            dispatch(setSelectedBatch(formData.selectedBatch));
            dispatch(setSelectedAssessor(formData.selectedAssessor));
            dispatch(setSelectedTcs(formData.selectedTc));
            dispatch(setSelectedTheoryQuestionSet(formData.selectedTheoryQuestionSet));
            dispatch(setSelectedPracticalQuestionSet(formData.selectedPracticalQuestionSet));
            dispatch(setSelectedVivaQuestionSet(formData.selectedVivaQuestionSet));
            dispatch(setSelectedCountry(formData.selectedCountry));
            dispatch(setSelectedState(formData.selectedState));
            dispatch(setSelectedCity(formData.selectedCity));
            setAssessorDetails(formData.assessorDetails);
            setTcDetails(formData.tcDetails);
            setIsCandidatePhotosRequired(formData.isCandidatePhotosRequired);
            setIsCandidateVideoRequired(formData.isCandidateVideoRequired);
            setIsCandidateLocationRequired(formData.isCandidateLocationRequired);
            setisCandidateAdharRequired(formData.isCandidateAdharRequired);
            setIsCandidateSelfieRequired(formData.isCandidateSelfieRequired);
            setIsAiRequired(formData.isAiRequired);
        }
    };

    useEffect(() => {
        loadFormData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const getParamAndDispatch = (param, setter, items) => {
            const id = params.get(param);
            if (id) {
                const item = items.find(i => i._id === id);
                if (item) dispatch(setter(item));
            }
        };

        getParamAndDispatch('sector', setSelectedSector, sectors);
        getParamAndDispatch('jobRole', setSelectedJobRole, jobRoles);
        getParamAndDispatch('batch', setSelectedBatch, batches);
        getParamAndDispatch('assessor', setSelectedAssessor, assessors);
        getParamAndDispatch('tc', setSelectedTcs, tcs);
        getParamAndDispatch('theoryQuestionSet', setSelectedTheoryQuestionSet, questionSets);
        getParamAndDispatch('practicalQuestionSet', setSelectedPracticalQuestionSet, questionSets);
        getParamAndDispatch('vivaQuestionSet', setSelectedVivaQuestionSet, questionSets);
        getParamAndDispatch('country', setSelectedCountry, countries);
        getParamAndDispatch('state', setSelectedState, states);
        getParamAndDispatch('city', setSelectedCity, cities);
    }, [location.search, sectors, jobRoles, batches, assessors, tcs, questionSets, countries, states, cities, dispatch]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedSector) params.set('sector', selectedSector._id);
        if (selectedJobRole) params.set('jobRole', selectedJobRole._id);
        if (selectedBatch) params.set('batch', selectedBatch._id);
        if (selectedAssessor) params.set('assessor', selectedAssessor._id);
        if (selectedTc) params.set('tc', selectedTc._id);
        if (selectedTheoryQuestionSet) params.set('theoryQuestionSet', selectedTheoryQuestionSet._id);
        if (selectedPracticalQuestionSet) params.set('practicalQuestionSet', selectedPracticalQuestionSet._id);
        if (selectedVivaQuestionSet) params.set('vivaQuestionSet', selectedVivaQuestionSet._id);
        if (selectedCountry) params.set('country', selectedCountry._id);
        if (selectedState) params.set('state', selectedState._id);
        if (selectedCity) params.set('city', selectedCity._id);
        navigate({ search: params.toString() }, { replace: true });
        saveFormData();
    }, [
        selectedSector, selectedJobRole, selectedBatch, selectedAssessor,
        selectedTc, selectedTheoryQuestionSet, selectedPracticalQuestionSet,
        selectedVivaQuestionSet, selectedCountry, selectedState, selectedCity, navigate
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSector) {
            // toast.error("Please select a sector before assigning the batch.");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a sector before assigning the batch.</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }

        if (!selectedJobRole) {
            // toast.error("Please select a job role before assigning the batch.");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a job role before assigning the batch.</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }

        if (!selectedBatch) {
            // toast.error("Please select a batch before assigning the batch.");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a batch before assigning the batch.</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        const notTranslated = [];
        if (selectedTheoryQuestionSet && !selectedTheoryQuestionSet.isTranslated) {
            notTranslated.push('Theory');
        }
        if (selectedPracticalQuestionSet && !selectedPracticalQuestionSet.isTranslated) {
            notTranslated.push('Practical');
        }
        if (selectedVivaQuestionSet && !selectedVivaQuestionSet.isTranslated) {
            notTranslated.push('Viva');
        }
        if (!selectedAssessor) {
            // toast.error("please select assessir first");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select assessir first</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }

        if (notTranslated.length > 0) {
            setNotTranslatedTypes(notTranslated);
            setShowNotTranslatedModal(true);
            return;
        }

        const payload = {
            assessor: selectedAssessor._id,
            city: selectedCity._id,
            tc: selectedTc._id,
            ...(selectedTheoryQuestionSet && { theoryQuestionBank: selectedTheoryQuestionSet._id }),
            ...(selectedPracticalQuestionSet && { practicalQuestionBank: selectedPracticalQuestionSet._id }),
            ...(selectedVivaQuestionSet && { vivaQuestionBank: selectedVivaQuestionSet._id }),
            isCandidatePhotosRequired: isCandidatePhotosRequired,
            isCandidateSelfieRequired: isCandidateSelfieRequired,
            isCandidateVideoRequired: isCandidateVideoRequired,
            isCandidateLocationRequired: isCandidateLocationRequired,
            isCandidateAdharRequired: isCandidateAdharRequired,
            randomizeQuestions: isRandomizeQuestionsRequired,
            isSuspiciousActivityDetectionRequired: isAiRequired,

        };

        await dispatch(assignTestToAssessor({ batchId: selectedBatch._id, payload })).unwrap();

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 1000);
        handleClear();

    };

    const handleProceed = async () => {
        setShowNotTranslatedModal(false);

        const payload = {
            assessor: selectedAssessor._id,
            city: selectedCity._id,
            tc: selectedTc._id,
            ...(selectedTheoryQuestionSet && { theoryQuestionBank: selectedTheoryQuestionSet._id }),
            ...(selectedPracticalQuestionSet && { practicalQuestionBank: selectedPracticalQuestionSet._id }),
            ...(selectedVivaQuestionSet && { vivaQuestionBank: selectedVivaQuestionSet._id }),
            isCandidatePhotosRequired: isCandidatePhotosRequired,
            isCandidateSelfieRequired: isCandidateSelfieRequired,
            isCandidateVideoRequired: isCandidateVideoRequired,
            isCandidateLocationRequired: isCandidateLocationRequired,
            isCandidateAdharRequired: isCandidateAdharRequired,
            randomizeQuestions: isRandomizeQuestionsRequired,
            isSuspiciousActivityDetectionRequired: isAiRequired,
        };

        await dispatch(assignTestToAssessor({ batchId: selectedBatch._id, payload })).unwrap();

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 1000);
        handleClear();
    };

    useEffect(() => {
        dispatch(fetchSectors());
    }, [dispatch]);

    useEffect(() => {
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
    }, [selectedSector, dispatch]);
    useEffect(() => {
        if (selectedSector && selectedJobRole) {
            dispatch(fetchAssessorsByJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
            dispatch(fetchQuestionSetsBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
        }
    }, [selectedSector, selectedJobRole, dispatch]);

    useEffect(() => {
        dispatch(fetchAllCountries());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCountry) {
            dispatch(fetchStates(selectedCountry._id));
        }
    }, [selectedCountry, dispatch]);

    useEffect(() => {
        if (selectedState) {
            dispatch(fetchCitiesByStateId(selectedState._id));
        }
    }, [selectedState, dispatch]);

    useEffect(() => {
        if (selectedCity) {
            dispatch(fetchTcs(selectedCity._id));
        }
    }, [selectedCity, dispatch]);


    const handleClear = () => {
        dispatch(setSelectedSector(null));
        dispatch(setSelectedJobRole(null));
        dispatch(setSelectedAssessor(null));
        dispatch(setSelectedTcs(null));
        dispatch(setSelectedBatch(null));
        dispatch(setSelectedTheoryQuestionSet(null));
        dispatch(setSelectedPracticalQuestionSet(null));
        dispatch(setSelectedVivaQuestionSet(null));
        setAssessorDetails('');
        setTcDetails('');
        dispatch(setSelectedState(null));
        dispatch(setSelectedCity(null));
        sessionStorage.removeItem('assignTestFormData');

    };

    const handleCountryChange = (selectedOption) => {
        const country = selectedOption ? countries.find(c => c._id === selectedOption.value) : null;
        dispatch(setSelectedCountry(country));
    };

    const handleStateChange = (selectedOption) => {
        const state = selectedOption ? states.find(s => s._id === selectedOption.value) : null;
        dispatch(setSelectedState(state));
    };

    const handleCityChange = (selectedOption) => {
        const city = selectedOption ? cities.find(c => c._id === selectedOption.value) : null;
        dispatch(setSelectedCity(city));
    };
    const handleSectorChange = (selectedOption) => {
        dispatch(setSelectedSector(selectedOption));
        if (selectedOption) {
            dispatch(fetchJobRolesBySector(selectedOption._id));
        }
    };

    const handleJobRoleChange = (selectedOption) => {
        dispatch(setSelectedJobRole(selectedOption));
    };

    const handleBatchChange = (selectedOption) => {
        const batch = selectedOption;
        dispatch(setSelectedBatch(batch));

        if (batch) {
            dispatch(setSelectedTheoryQuestionSet(batch.theoryQuestionBank));
            dispatch(setSelectedPracticalQuestionSet(batch.practicalQuestionBank));
            dispatch(setSelectedVivaQuestionSet(batch.vivaQuestionBank));

        }
    };

    const handleTCSChange = (e) => {
        const tcId = e.target.value;
        const tc = tcs.find(c => c._id === tcId);
        dispatch(setSelectedTcs(tc));
    };


    const handleAssessorChange = (e) => {
        const assessorId = e.target.value;
        const assessor = assessors.find(c => c._id === assessorId);
        dispatch(setSelectedAssessor(assessor || null));
    };

    const handleQuestionSetChange = (selectedOption, type) => {
        const questionSet = selectedOption ? questionSets.find(c => c._id === selectedOption.value) : null;
        switch (type) {
            case 'theory':
                dispatch(setSelectedTheoryQuestionSet(questionSet));
                break;
            case 'practical':
                dispatch(setSelectedPracticalQuestionSet(questionSet));
                break;
            case 'viva':
                dispatch(setSelectedVivaQuestionSet(questionSet));
                break;
            default:
                break;
        }
    };

    const filterQuestionSetsByType = (type) => {
        return questionSets.filter(qs => qs.type === type);
    };

    useEffect(() => {
        const india = countries.find(c => c.name === 'india');
        if (india) {
            dispatch(setSelectedCountry(india));
        }
    }, [countries, dispatch]);


    return (
        <div className="max-w-full mx-auto mt-14 sm:mt-8 p-6 py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold ml-1 mb-3">Assign Batch</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="country" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Select Country</label>
                        <Select
                            id="country"
                            value={selectedCountry ? { value: selectedCountry._id, label: selectedCountry.name.toUpperCase() } : null}
                            options={countries.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCountryChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                            placeholder="Select Country"
                            isClearable

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="state" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select State</label>
                        <Select
                            id="state"
                            value={selectedState ? { value: selectedState._id, label: selectedState.name.toUpperCase() } : null}
                            options={states.map(s => ({ value: s._id, label: s.name.toUpperCase() }))}
                            onChange={handleStateChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-40"
                            placeholder="Select State"
                            isClearable

                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="city" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select City</label>
                        <Select
                            id="city"
                            value={selectedCity ? { value: selectedCity._id, label: selectedCity.name.toUpperCase() } : null}
                            options={cities.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCityChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-30"
                            placeholder="Select City"
                            isClearable

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="sector" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select Sector</label>
                        <Select
                            id="sector"
                            value={selectedSector}
                            options={sectors}
                            onChange={handleSectorChange}
                            getOptionLabel={(option) => `${option.name.toUpperCase()}(${option.sector_short_name.toUpperCase()})`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Sector"
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-20"

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="jobrole" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select Job Role</label>
                        <Select
                            id="jobrole"
                            value={selectedJobRole}
                            options={jobRoles}
                            onChange={handleJobRoleChange}
                            getOptionLabel={(option) => `${option.name}-V${option.version}`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Job Role"
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-10"

                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="batch" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select Batch</label>
                        <Dropdown
                            id="batch"
                            value={selectedBatch}
                            options={batches}
                            onChange={(e) => handleBatchChange(e.value)}
                            optionLabel="no"
                            filter
                            showClear
                            filterInputAutoFocus
                            placeholder="Select Batch"
                            className="w-full text-sm border-2 border-gray-600  rounded-md z-auto"

                        />
                    </div>

                    <div className="flex flex-col flex-1">
                        <QuestionSetSelector
                            id="theoryQuestionset"
                            label="Select Theory Question Set"
                            value={selectedTheoryQuestionSet}
                            options={filterQuestionSetsByType('theory')}
                            onChange={(selectedOption) => handleQuestionSetChange(selectedOption, 'theory')}
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <QuestionSetSelector
                            id="practicalQuestionset"
                            label="Select Practical Question Set"
                            value={selectedPracticalQuestionSet}
                            options={filterQuestionSetsByType('practical')}
                            onChange={(selectedOption) => handleQuestionSetChange(selectedOption, 'practical')}

                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <QuestionSetSelector
                            id="vivaQuestionset"
                            label="Select Viva Question Set"
                            value={selectedVivaQuestionSet}
                            options={filterQuestionSetsByType('viva')}
                            onChange={(selectedOption) => handleQuestionSetChange(selectedOption, 'viva')}

                        />
                    </div>

                    <div className="flex flex-col flex-1">
                        <label htmlFor="tcs" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select Training Center</label>
                        <div className="flex flex-col gap-4 sm:flex-row item-start sm:items-center">
                            <Dropdown
                                id="tcs"
                                value={selectedTc ? selectedTc._id : null}
                                options={tcs.filter(c => c.tcId).map(c => ({ label: `${c.tcId}(${c.name})`, value: c._id }))}
                                onChange={handleTCSChange}
                                className="w-full text-sm border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Select Training Center"
                                showClear
                                filter
                                filterInputAutoFocus
                            />
                            <button
                                type='button'
                                onClick={handleCreateTC}
                                className="ml-2 w-24 flex px-2 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-blue-600 transition"
                            >
                                <span className='pr-1'><IoMdAdd className='w-5 h-5' /></span>  Create
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1">
                        <label htmlFor="assessor" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select Assessor</label>
                        <div className="flex items-center">
                            <Dropdown
                                id="assessor"
                                value={selectedAssessor ? selectedAssessor._id : null}
                                options={assessors.map(c => ({ label: `${c.name}- ${c.sipUserId}`, value: c._id }))}
                                onChange={handleAssessorChange}
                                className="w-full text-sm border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Select Assessor"
                                disabled={!selectedJobRole}
                                showClear
                                filter
                                filterInputAutoFocus
                            />
                            <button
                                type='button'
                                onClick={handleCreateAssessor}
                                className="ml-2 flex px-2 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-blue-800 transition"

                            >
                                <span className='pr-1'><IoMdAdd className='w-5 h-5' /></span>  Create
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-5">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-6">Randomize Questions</span>

                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isRandomizeQuestionsRequired}
                                onChange={(e) => setIsRandomizeQuestionsRequired(e.target.checked)}
                            />

                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isRandomizeQuestionsRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isRandomizeQuestionsRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>

                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-6">AI Required</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isAiRequired}
                                onChange={(e) => setIsAiRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isAiRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isAiRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                    {/* Candidate Selfie */}
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-6">Candidate Selfie</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isCandidateSelfieRequired}
                                onChange={(e) => setIsCandidateSelfieRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isCandidateSelfieRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isCandidateSelfieRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                    {/* Candidate Aadhar */}
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-6">Candidate Aadhar</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isCandidateAdharRequired}
                                onChange={(e) => setisCandidateAdharRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isCandidateAdharRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isCandidateAdharRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-6">Candidate Location</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isCandidateLocationRequired}
                                onChange={(e) => setIsCandidateLocationRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isCandidateLocationRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isCandidateLocationRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-1">Candidate Random Photos</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isCandidatePhotosRequired}
                                onChange={(e) => setIsCandidatePhotosRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isCandidatePhotosRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isCandidatePhotosRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center relative w-max cursor-pointer select-none">
                            <span className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1 mr-1">Candidate Random Videos</span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isCandidateVideoRequired}
                                onChange={(e) => setIsCandidateVideoRequired(e.target.checked)}
                            />
                            <div
                                className={`w-14 h-7 rounded-md relative transition-colors ${isCandidateVideoRequired ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isCandidateVideoRequired ? 'translate-x-7' : ''
                                        }`}
                                />
                            </div>
                            <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                            <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                        </label>
                    </div>

                </div>

                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br  shadow-lg shadow-purple-500/50  font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex justify-center items-center">
                        <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>
                        <span>Add</span>
                    </button>
                    <button type="button" onClick={handleClear} className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex justify-center items-center">
                        <span className='pr-2'><VscClearAll className='w-5 h-5' /></span>
                        <span>Clear</span>
                    </button>
                </div>
            </form>

            <Dialog
                header="Question Set Not Translated"
                visible={showNotTranslatedModal}
                style={{ width: '50vw' }}
                modal
                onHide={() => setShowNotTranslatedModal(false)}
            >
                <p className="mb-4">The following question sets are not translated:</p>
                <ul className="mb-4">
                    {notTranslatedTypes.map((type, index) => (
                        <li key={index} className="text-red-500">{type}</li>
                    ))}
                </ul>
                <p className="mb-4">Do You Really Want to Proceed?</p>
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowNotTranslatedModal(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleProceed}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Proceed
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default ManageAssignTest;
