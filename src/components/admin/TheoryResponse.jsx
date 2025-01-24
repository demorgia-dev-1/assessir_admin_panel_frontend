
const TheoryResponse = ({ response }) => {
    const { actualQuestion, givenAnswer, actualAnswer, marks, maximumMarks, isCorrect, nosDetails, jobRoleDetails } = response;

    console.log('response', response);

    return (
        <div className="theory-response border p-4 mb-4 rounded-lg shadow-md">
            <p><strong>Question:</strong> {actualQuestion}</p>
            <p><strong>Given Answer:</strong> {givenAnswer}</p>
            <p><strong>Actual Answer:</strong> {actualAnswer}</p>
            <p><strong>Marks:</strong> {marks} / {maximumMarks}</p>
            <p><strong>Correct:</strong> {isCorrect ? 'Yes' : 'No'}</p>
            <div className="nos-details mt-2">
                <h5 className="font-semibold">NOS Details</h5>
                <p><strong>Code:</strong> {nosDetails?.nosCode || 'N/A'}</p>
                <p><strong>Name:</strong> {nosDetails?.nosName || 'N/A'}</p>
                <p><strong>Type:</strong> {nosDetails?.nosType || 'N/A'}</p>
                <p><strong>Total Marks:</strong> {nosDetails?.totalMarks || 'N/A'}</p>
                <p><strong>Theory Marks:</strong> {nosDetails?.totalMarksInTheory || 'N/A'}</p>
                <p><strong>Practical Marks:</strong> {nosDetails?.totalMarksInPractical || 'N/A'}</p>
                <p><strong>Viva Marks:</strong> {nosDetails?.totalMarksInViva || 'N/A'}</p>
            </div>
            <div className="job-role-details mt-2">
                <h5 className="font-semibold">Job Role Details</h5>
                <p><strong>QP Code:</strong> {jobRoleDetails?.qpCode || 'N/A'}</p>
                <p><strong>Total Marks:</strong> {jobRoleDetails?.totalMarks || 'N/A'}</p>
                <p><strong>Theory Marks:</strong> {jobRoleDetails?.totalMarksInTheory || 'N/A'}</p>
                <p><strong>Practical Marks:</strong> {jobRoleDetails?.totalMarksInPractical || 'N/A'}</p>
                <p><strong>Viva Marks:</strong> {jobRoleDetails?.totalMarksInViva || 'N/A'}</p>
                <p><strong>Passing Percentage:</strong> {jobRoleDetails?.passingPercentage || 'N/A'}%</p>
            </div>
        </div>
    );
};

export default TheoryResponse;