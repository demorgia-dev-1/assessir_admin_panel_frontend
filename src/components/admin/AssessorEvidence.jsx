import axios from 'axios';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Rating } from 'primereact/rating';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { BASE_URL } from '../constant';
import { setSelectedBatch, setSelectedJobRole, setSelectedSector } from '../features/assignTestSlice';
import { fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';


const AssessorEvidence = () => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState('');
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [isDialogVisible2, setDialogVisible2] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [ratings, setRatings] = useState({});
    const [newQuestion, setNewQuestion] = useState('');
    const dispatch = useDispatch();

    const {
        batches, jobRoles, sectors,
        selectedBatch, selectedJobRole,
        selectedSector
    } = useSelector(state => state.assignTest);

    const handleImageClick = (imageUrl) => {
        setZoomImage(imageUrl);
        setDialogVisible(true);
    };
    useEffect(() => {
        const fetchLocation = async () => {
            if (selectedBatch && selectedBatch.assessorCoordinates) {
                const { lat, long } = selectedBatch.assessorCoordinates;
                try {
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
                    const { data } = response;
                    if (data && data.display_name) {
                        setLocation(data.display_name);
                    } else {
                        setLocation('Location not found');
                    }
                } catch (error) {
                    console.error('Error fetching location:', error);
                    setLocation('Error fetching location');
                }
            } else {
                setLocation('Coordinates not available');
            }
        };

        fetchLocation();
    }, [selectedBatch]);
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
        dispatch(setSelectedBatch(selectedOption));
    };

    useEffect(() => {
        dispatch(fetchSectors());
    }, [dispatch]);

    useEffect(() => {
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
    }, [dispatch, selectedSector]);

    useEffect(() => {
        if (selectedSector && selectedJobRole) {

            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }))
                .then(response => {
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [dispatch, selectedSector, selectedJobRole]);

    const handleAddQuestion = async () => {
        if (newQuestion.trim() === '') {
            toast.error('Question cannot be empty.');
            return;
        }

        const newQuestionObj = {
            question: newQuestion.trim()
        };

        try {
            const response = await axios.post(`${BASE_URL}company/assessors/ratings/questions`, newQuestionObj, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                setQuestions([...questions, { id: questions.length + 1, text: newQuestion.trim() }]);
                setNewQuestion('');
                toast.success('Question added successfully!');
            } else {
                toast.error('Failed to add question.');
            }
        } catch (error) {
            console.error('Error adding question:', error);
            toast.error('Error adding question.');
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`${BASE_URL}company/assessors/ratings/questions`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                const fetchedQuestions = response.data?.data?.map(q => ({
                    id: q._id,
                    text: q.question
                }));
                setQuestions(fetchedQuestions);
                setDialogVisible2(true);
            } else {
                toast.error('Failed to fetch questions.');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Error fetching questions.');
        }
    };
    const handleRatingChange = (questionId, value) => {
        setRatings(prevRatings => ({
            ...prevRatings,
            [questionId]: value
        }));
    };

    const handleSubmitRatings = async () => {
        if (!selectedBatch) {
            toast.error('Please select a batch.');
            return;
        }

        const payload = {

            ratings: questions.map(question => ({
                question: question.id,
                rating: ratings[question.id] || 0,
                batch: selectedBatch._id,
            }))
        };

        try {
            const response = await axios.post(`${BASE_URL}company/assessors/ratings/questions/bulk-ratings`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                toast.success('Ratings submitted successfully!');
                setRatings({});
            } else {
                toast.error('Failed to submit ratings.');
            }
        } catch (error) {
            console.error('Error submitting ratings:', error);
            toast.error('Error submitting ratings.');
        }
    };


    if (loading) {
        return (
            <div className="card flex justify-center items-center mt-20">
                <ProgressSpinner className='h-12 w-12' />
            </div>
        );
    }
    return (
        <div className="w-full mx-auto mt-5 p-0 sm:p-2 py-4 bg-white border-2 border-white/10 items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0">
            <div className="flex flex-col space-y-4 my-3">
                <span className="text-xl font-bold mb-2 ml-1 p-2 text-center sm:text-left">Assessor Evidence</span>
                <div className="grid p-2 grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
                    <div className="flex flex-col">
                        <label htmlFor="sector" className="mb-1 font-semibold text-md ml-1">Select Sector</label>
                        <Select
                            id="sector"
                            value={selectedSector}
                            options={sectors}
                            onChange={handleSectorChange}
                            getOptionLabel={(option) => `${option.name.toUpperCase()}(${option.sector_short_name.toUpperCase()})`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Sector"
                            className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                menu: base => ({ ...base, zIndex: 9999 })
                            }}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="jobrole" className="mb-1 font-semibold text-md ml-1">Select Job Role</label>
                        <Select
                            id="jobrole"
                            value={selectedJobRole}
                            options={jobRoles}
                            onChange={handleJobRoleChange}
                            getOptionLabel={(option) => `${option.name}-V${option.version}`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Job Role"
                            className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-30"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                menu: base => ({ ...base, zIndex: 9999 })
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="batch" className="mb-1 font-semibold text-md ml-1">Select Batch</label>
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
                            className="w-full text-sm border border-gray-300 rounded-md z-20"
                        />
                    </div>
                </div>
                <div className="mt-5">
                    {selectedBatch ? (
                        <div className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <p><strong>Assessor Name: </strong> {selectedBatch.assessor?.name || 'N/A'}</p>
                                <p><strong>Assessor Email: </strong> {selectedBatch.assessor?.email || 'N/A'}</p>
                                <p><strong>Assessor Phone: </strong> {selectedBatch.assessor?.phone || 'N/A'}</p>
                                <p><strong>SIP User Id: </strong> {selectedBatch.assessor?.sipUserId || 'N/A'}</p>
                                <p><strong>Assessor Reached Location: </strong>{location}</p>
                                <p><strong>Assessor Reached Time:</strong> {selectedBatch.assessorReachedAt ? new Date(selectedBatch.assessorReachedAt).toLocaleString() : 'N/A'}</p>
                                <div className="flex items-center mb-2">
                                    <p className="mr-2"><strong>Assessor Group Photo:</strong> {selectedBatch.assessorGroupPhoto ? <a href={selectedBatch.assessorGroupPhoto} target="_blank" rel="noopener noreferrer"><FiDownload className="inline-block h-5 w-5 ml-4 text-center text-green-700" /></a> : 'N/A'}</p>

                                </div>
                            </div>
                            <div>
                                {selectedBatch.assessorGroupPhoto && <img src={selectedBatch.assessorGroupPhoto} alt="Assessor Group" className="mt-2 rounded-lg shadow-md cursor-pointer" onClick={() => handleImageClick(selectedBatch.assessorGroupPhoto)} />}
                            </div>

                        </div>
                    ) : (
                        <p>No batch selected.</p>
                    )}
                </div>
                <div className="mt-5 space-x-4 hidden">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Add a new question"
                        className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <Button label="Add" icon="pi pi-plus" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs" onClick={handleAddQuestion} />
                </div>
                {selectedBatch && <div className="mt-5">
                    <Button label="Rate Assessor" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs" icon="pi pi-star" onClick={fetchQuestions} />
                </div>}
                <Dialog
                    visible={isDialogVisible2}
                    style={{ width: '50vw' }}
                    header={<h2 className="text-lg font-bold text-gray-800">Rate Assessor</h2>}
                    onHide={() => setDialogVisible2(false)} dismissableMask
                    className="p-dialog-custom"
                >
                    {questions?.length > 0 ? (
                        <div className="space-y-3">
                            {questions.map((question) => (
                                <div
                                    key={question.id}
                                    className="flex items-center justify-between bg-gray-100 p-3 rounded-md shadow-sm"
                                >
                                    <p className="font-medium text-gray-800 text-sm sm:text-base lg:text-md">{question.text}</p>
                                    <Rating
                                        value={ratings[question.id] || 0}
                                        onChange={(e) => handleRatingChange(question.id, e.value)}
                                        cancel={false}
                                        className="text-sm sm:text-base lg:text-sm rating-custom"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-sm mt-6">
                            <p>No questions available.</p>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <Button
                            label="Submit Ratings"
                            icon="pi pi-check"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md text-sm transition duration-150 ease-in-out"
                            onClick={handleSubmitRatings}
                        />
                    </div>
                </Dialog>

            </div>
            <Dialog visible={isDialogVisible} style={{ width: '30vw' }} header={`${selectedBatch?.assessor?.name}` || ''} onHide={() => setDialogVisible(false)}>
                {zoomImage && <img src={zoomImage} alt="Zoomed Assessor Group" className="w-full h-auto" />}
            </Dialog>
        </div>
    );
};

export default AssessorEvidence;