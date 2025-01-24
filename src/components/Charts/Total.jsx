
import { useEffect, useState } from 'react';
import { FaBuilding, FaCheckCircle, FaPlayCircle, FaSchool, FaUsers, FaUserTie } from 'react-icons/fa';
import { BASE_URL } from '../constant';
import DashboardCard from './DashboardCard';

const Total = () => {
    const [totalCandidateEnrolled, setTotalCandidateEnrolled] = useState(0);
    const [totalCompletedBatches, setTotalCompletedBatches] = useState(0);
    const [totalCandidateAssessed, setTotalCandidateAssessed] = useState(0);
    const [totalRegisteredAssessor, setTotalRegisteredAssessor] = useState(0);
    const [totalRegisteredTcs, setTotalRegisteredTcs] = useState(0);
    const [totalRegisteredTps, setTotalRegisteredTps] = useState(0);
    const [totalOngoingBatches, setTotalOngoingBatches] = useState(0);
    const [totalOngoingAssessments, setTotalOngoingAssessment] = useState(0);
    const [totalAssessmentCompleted, setTotalAssessmentCompleted] = useState(0);


    useEffect(() => {
        const getStatus = async () => {
            const response = await fetch(`${BASE_URL}company/get-stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            setTotalCandidateEnrolled(data.data.stats.totalCandidateEnrolled);
            setTotalCompletedBatches(data.data.stats.totalBatchCompleted);
            setTotalCandidateAssessed(data.data.stats.totalCandidateAssessed);
            setTotalRegisteredAssessor(data.data.stats.totalRegisteredAssessor);
            setTotalRegisteredTcs(data.data.stats.totalRegisteredTcs);
            setTotalRegisteredTps(data.data.stats.totalRegisteredTps);

            console.log(data);
            sessionStorage.setItem('totalCandidateEnrolled', data.data.stats.totalCandidateEnrolled);
            sessionStorage.setItem('totalCandidateAssessed', data.data.stats.totalCandidateAssessed);

        }
        getStatus();
    }, []);

    useEffect(() => {
        const getStatusToday = async () => {
            const response = await fetch(`${BASE_URL}company/get-today-stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            setTotalOngoingBatches(data.data.stats.totalOngoingBatches);
            setTotalOngoingAssessment(data.data.stats.totalOngoingAssessments);
            setTotalAssessmentCompleted(data.data.stats.totalAssessmentsCompleted);
            console.log(data);

        }
        getStatusToday();
    }, []);


    const role = sessionStorage.getItem('role');
    return (
        <div className="p-2 w-full">
           
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {role === 'superadmin' ? (
                    <DashboardCard
                        icon={FaBuilding}
                        title="Total Agencies"
                        value="100"
                        bgColor="bg-blue-600"
                    />
                ) : (
                    <>
                        <DashboardCard
                            icon={FaUsers}
                            title="Total Candidates Enrolled"
                            value={totalCandidateEnrolled}
                            bgColor="bg-blue-500"

                        />
                        <DashboardCard
                            icon={FaUsers}
                            title="Total Candidates Assessed"
                            value={totalCandidateAssessed}
                            bgColor="bg-blue-500"
                        />
                        <DashboardCard
                            icon={FaCheckCircle}
                            title="Total Completed Batches"
                            value={totalCompletedBatches}
                            bgColor="bg-green-500"
                        />

                        <DashboardCard
                            icon={FaPlayCircle}
                            title="Total Ongoing Batches"
                            value={totalOngoingBatches}
                            bgColor="bg-yellow-500"
                        />
                        <DashboardCard
                            icon={FaPlayCircle}
                            title="Total Online Candidates"
                            value={totalOngoingAssessments}
                            bgColor="bg-red-500"
                        />
                        <DashboardCard
                            icon={FaUserTie}
                            title="Registered Assessors"
                            value={totalRegisteredAssessor}
                            bgColor="bg-purple-500"
                        />
                        <DashboardCard
                            icon={FaSchool}
                            title="Registered TC/TP"
                            value={`${totalRegisteredTcs}/${totalRegisteredTps}`}
                            bgColor="bg-teal-500"
                        />
                        <DashboardCard
                            icon={FaCheckCircle}
                            title="Candidate Assessed Today"
                            value={totalAssessmentCompleted}
                            bgColor="bg-purple-500"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Total;