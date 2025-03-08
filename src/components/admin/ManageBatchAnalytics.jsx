import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { BASE_URL } from '../constant';
import { setSelectedBatch, setSelectedJobRole, setSelectedSector } from '../features/assignTestSlice';
import { fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';

function ManageBatchAnalytics() {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [resData, setResData] = useState()
    const navigate = useNavigate();

    const {
        batches, jobRoles, sectors,
        selectedBatch, selectedJobRole,
        selectedSector
    } = useSelector(state => state.assignTest);

    const handleSectorChange = (selectedOption) => {
        dispatch(setSelectedSector(selectedOption));
        if (selectedOption) {
            dispatch(fetchJobRolesBySector(selectedOption._id));
        }
    };

    const handleJobRoleChange = (selectedOption) => {
        dispatch(setSelectedJobRole(selectedOption));
    };

    const handleBatchChange = (selectedOptions) => {
        dispatch(setSelectedBatch(selectedOptions));
    };

    const handleResDataChange = (selectedOption) => {
        window.open(`/batch-analytics/${selectedOption._id}`, '_blank');
    };


    const batchOptions = Array.isArray(batches) ? batches.map(batch => ({
        _id: batch._id,
        name: `${batch.no}`
    })) : [];

    useEffect(() => {
        dispatch(fetchSectors());
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
        if (selectedSector && selectedJobRole) {
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
        }
    }, [dispatch, selectedSector, selectedJobRole]);

    useEffect(() => {
        fetchData();
    },[])

        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}company/batch-analytics`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Batch analytics data:', response);

               setResData(response.data.data)
              
            } catch (error) {
                console.error('Error fetching batch analytics data:', error);
            }
        };

    const generateBatchAnalyticsLink = async () => {
        try {
            const token = sessionStorage.getItem('token');
            console.log('Selected Batches:', selectedBatch); 
            const response = await axios.post(`${BASE_URL}company/batch-analytics/generate-link`, {
                batches: selectedBatch,
                expiresAt: expiresAt,
                title: title
            },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if(response.data.success) {
                toast.success('Link generated successfully');
            console.log('Link generated:', response.data);
            fetchData();
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error generating link:', error);
        }
    };

    return (

        <div>
            <h1 className="text-xl font-bold text-gray-800 m-4 mt-14 sm:mt-5">Batch Analytics</h1>
   
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-md relative overflow-visible">
             
            <div className="flex-1 min-w-[200px]">
                <label htmlFor="sector" className="block mb-1 font-semibold text-md">Select Sector</label>
                <Select
                    id="sector"
                    value={selectedSector}
                    options={sectors}
                    onChange={handleSectorChange}
                    getOptionLabel={(option) => `${option.name.toUpperCase()}(${option.sector_short_name.toUpperCase()})`}
                    getOptionValue={(option) => option._id}
                    isClearable
                    placeholder="Select Sector"
                    className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <label htmlFor="jobrole" className="block mb-1 font-semibold text-md">Select Job Role</label>
                <Select
                    id="jobrole"
                    value={selectedJobRole}
                    options={jobRoles}
                    onChange={handleJobRoleChange}
                    getOptionLabel={(option) => `${option.name}-V${option.version}`}
                    getOptionValue={(option) => option._id}
                    isClearable
                    placeholder="Select Job Role"
                    className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <label htmlFor="batch" className="block mb-1 font-semibold text-md">Select Batch</label>
                <MultiSelect
                    id="batch"
                    value={selectedBatch}
                    options={batchOptions}
                    onChange={(e) => handleBatchChange(e.value)}
                    display="chip"
                    optionLabel="name"
                    optionValue="_id"
                    placeholder="Select Batch"
                    className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                    panelStyle={{ zIndex: 9999 }}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <label htmlFor="expireDate" className="block mb-1 font-semibold text-md">Select Link Expire Date</label>
                <input type="datetime-local" id="expireDate" onChange={(e)=> setExpiresAt(e.target.value)} className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50" />
            </div>

            <div className="flex-1 min-w-[200px]">
                <label htmlFor="title" className="block mb-1 font-semibold text-md">Title</label>
                <input type="text" id="title" placeholder='Enter Title' onChange={(e) => setTitle(e.target.value)} className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50" />
            </div>

            <div className=" min-w-[200px] flex items-end">
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-md" onClick={generateBatchAnalyticsLink}>Generate Link</button>
            </div>

            <div className="mt-4">
                <label htmlFor="resData" className="block mb-1 font-semibold text-md">Select Batch Analytics</label>
                <Select
                    id="resData"
                    value={null} 
                    options={resData}
                    onChange={handleResDataChange}
                    getOptionLabel={(option) => option.title}
                    getOptionValue={(option) => option._id}
                    placeholder="Select Batch Analytics"
                    className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            
            </div>

            <style>
                {`
                    .p-multiselect {
                        max-width: 300px; /* Set a maximum width for the MultiSelect component */
                    }
                    .p-multiselect .p-multiselect-label-container {
                        max-width: 100%; /* Ensure the label container does not exceed the maximum width */
                    }
                    .p-multiselect .p-multiselect-label {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis; /* Add ellipsis for overflow text */
                    }
                `}
            </style>
        </div>
        </div>
    );
}

export default ManageBatchAnalytics;