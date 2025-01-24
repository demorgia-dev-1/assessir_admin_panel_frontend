import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { GrNext, GrPrevious } from "react-icons/gr";
import { MdLocationPin, MdOutlineWarning } from "react-icons/md";
import { TbDownload } from "react-icons/tb";
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../constant';

const CandidateEvidence = () => {
    const { candidateId } = useParams();
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [zoomImage, setZoomImage] = useState(null);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const itemsPerPage = 8;
    const handleImageClick = (imageUrl) => {
        setZoomImage(imageUrl);
        setDialogVisible(true);
    };
    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    return;
                }
                const response = await axios.get(`${BASE_URL}company/candidates/${candidateId}/evidences`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("evidences", response.data.data);
                setEvidence(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch evidence data', error);
                setLoading(false);
            }
        };

        fetchEvidence();
    }, [candidateId]);

    useEffect(() => {
        const fetchLocation = async () => {
            if (evidence && evidence.candidate && evidence.candidate.candidateSelfieCoordinates) {
                const { lat, long } = evidence.candidate.candidateSelfieCoordinates;
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
    }, [evidence]);

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) =>
            direction === 'next' ? prevPage + 1 : Math.max(prevPage - 1, 1)
        );
    };

    const paginatedPhotos = evidence?.randomPhotos?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const paginatedVideos = evidence?.randomVideos?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const downloadFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="card flex justify-center items-center mt-20">
                <ProgressSpinner className='h-12 w-12' />
            </div>
        );
    }

    if (!evidence) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">No evidence found for this candidate.</strong>
                    <span className="block sm:inline"> Please check back later or contact support for more information.</span>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-[23rem] my-2 md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 p-0 sm:p-2 py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <span className="text-2xl font-bold text-gray-700 p-3 rounded-md mb-10">
                Evidence of <span className=' text-green-800'>{evidence.candidate.name}</span>
            </span>
            <div className="location-info bg-gray-100 p-3 rounded-lg shadow-md mt-6">
                <h1 className='font-bold text-green-800 text-xl flex gap-2 items-center'><span><MdLocationPin /></span><span>Location</span></h1>
                <p className="text-gray-800"><strong>Address:</strong> <span className='pl-2 font-semibold'>{evidence.candidate.address || 'N/A'}</span></p>
                <p className="text-gray-800"><strong>Candidate Location:</strong> <span className='pl-2 font-semibold'>{location}</span></p>
                <h1 className='font-bold text-red-800 text-xl mt-2 flex items-center gap-2'><span><MdOutlineWarning /></span>Suspicious Activities</h1>
                <p className="text-gray-800"><strong>Face Hidden Count:</strong><span className='pl-2 font-semibold text-red-800'>{evidence.candidate.faceHiddenCount || 0}</span></p>
                <p className="text-gray-800"><strong>Multiple Face Detect Count:</strong><span className='pl-2 font-semibold text-red-800'>{evidence.candidate.multipleFaceDetectionCount || 0}</span></p>
                <p className="text-gray-800"><strong>Exit FullScreen Count:</strong><span className='pl-2 font-semibold text-red-800'>{evidence.candidate.exitFullScreenCount || 0}</span></p>
                <p className="text-gray-800"><strong>Tab Switch Count:</strong><span className='pl-2 font-semibold text-red-800'>{evidence.candidate.tabSwitchCount || 0}</span></p>
            </div>

            <div className="evidence-list my-4">

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6'>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center">
                        <img src={evidence.candidate.candidateSelfie} onClick={() => handleImageClick(evidence.candidate.candidateSelfie)} alt="selfie" className="w-full max-w-xs h-auto cursor-pointer rounded-md" />

                        <p className="text-center mt-2 text-gray-700 bg-green-50 px-1 font-semibold rounded-md">
                            Candidate Selfie<a href={evidence.candidate.candidateSelfie} rel="noopener noreferrer"><FiDownload className="inline-block h-5 w-5 ml-4 text-center text-green-700" /></a>
                        </p>



                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center mt-4 sm:mt-0">
                        <img src={evidence.candidate.adharcardPicture} onClick={() => handleImageClick(evidence.candidate.adharcardPicture)} alt="id-card" className="w-full max-w-xs h-auto rounded-md cursor-pointer" />

                        <p className="text-center mt-2 text-gray-700 bg-green-50 px-1 font-semibold rounded-md">
                            Candidate Aadhar<a href={evidence.candidate.adharcardPicture} rel="noopener noreferrer"><FiDownload className="inline-block h-5 w-5 ml-4 text-center text-green-700" /></a>
                        </p>

                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>

                    {paginatedPhotos?.map((photo, index) => (
                        <div key={index} className="evidence-item bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center">

                            <img src={photo} onClick={() => handleImageClick(photo)} alt="evidence" className="w-full max-w-xs h-auto rounded-md cursor-pointer" />

                            <p className="text-center mt-2 text-gray-700 bg-green-50 px-1 font-semibold rounded-md">
                                Photo {(currentPage - 1) * itemsPerPage + index + 1}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-6">
                {paginatedVideos?.map((video, index) => (
                    <div key={index} className="evidence-item bg-gray-100 p-4 rounded-lg shadow-md">
                        <video src={video} controls className="w-full max-w-xs h-auto rounded-md cursor-pointer"></video>
                        <div className='flex justify-center items-center gap-6'>
                            <p className="text-center mt-2 text-gray-700 bg-green-50 px-1 font-semibold rounded-md">
                                Video {(currentPage - 1) * itemsPerPage + index + 1}
                            </p>
                            <button onClick={() => downloadFile(video, `randomVideo${index + 1}.mp4`)} className="mt-2"> <TbDownload className="h-5 w-5 text-green-600 hover:text-green-800" /> </button>
                        </div>

                    </div>
                ))}
            </div>

            <div className="pagination-controls flex justify-center items-center mt-8">
                <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-blue-600 text-white rounded-md mr-4 disabled:bg-gray-400 flex items-center"
                >
                    <span className='mr-1'>
                        <GrPrevious />
                    </span>
                    <span>
                        Previous
                    </span>

                </button>
                <button
                    onClick={() => handlePageChange('next')}
                    disabled={
                        (currentPage * itemsPerPage) >= (evidence.randomPhotos?.length || 0) &&
                        (currentPage * itemsPerPage) >= (evidence.randomVideos?.length || 0)
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded-md disabled:bg-gray-400 flex items-center"
                >

                    <span className='mr-1'>
                        Next
                    </span>
                    <span>
                        <GrNext />
                    </span>

                </button>
            </div>
            <Dialog visible={isDialogVisible} style={{ width: '30vw' }} header={`${evidence.candidate.name}` || ''} onHide={() => setDialogVisible(false)} dismissableMask>
                {zoomImage && <img src={zoomImage} alt="Zoomed Assessor Group" className="w-full h-auto" />}
            </Dialog>
        </div>
    );
};

export default CandidateEvidence;
