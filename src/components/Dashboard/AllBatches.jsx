import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBatches } from '../features/batchSlice';

const AllBatches = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const { batches = [], status } = useSelector((state) => state.batch); 
    const dispatch = useDispatch();
    useEffect(() => {
        if ('admin') {
            dispatch(fetchBatches());
        }
    }, [dispatch]);

    const handleStatusChange = (event) => {
        setSelectedStatus(event.value);
    };

    const filteredBatches = batches.filter(batch => {
        if (selectedStatus === '') {
            return false;
        }
        if (selectedStatus === 'All') {
            return true;
        }
        return batch.status === selectedStatus;
    });


    console.log("filteredBatches", filteredBatches);

    const statusOptions = [
        { label: 'Select Status', value: '' },
        { label: 'All', value: 'All' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Not Assigned', value: 'not-assigned' },
        { label: 'Completed', value: 'completed' },
    ];

    const batchStatusTemplate = (rowData) => {
        if (rowData.status === 'not-assigned') {
            const style = {
                color: 'red',
                boxShadow: `0 0 5px red`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>NotAssigned</div>;
        } else if (rowData.status === 'assigned') {
            const style = {
                color: 'green',
                boxShadow: `0 0 5px green`,
                padding: '2px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Assigned</div>;
        }
        else if (rowData.status === 'completed') {
            const style = {
                color: 'blue',
                boxShadow: `0 0 5px blue`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Completed</div>;
        }
        else {
            const style = {
                color: 'orange',
                boxShadow: `0 0 5px orange`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Ongoing</div>;
        }

    }

    function convertToIST(utcTimeStr) {
        const utcDate = new Date(utcTimeStr);
        const utcTime = utcDate.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(utcTime + istOffset);

        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');

        let hours = istTime.getUTCHours();
        const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = String(hours).padStart(2, '0');

        return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}`;
    }

    const startDateBodyTemplate = (rowData) => {
        return <span>{convertToIST(rowData.startDate)}</span>;
    };

    const endDateBodyTemplate = (rowData) => {
        return <span>{convertToIST(rowData.endDate)}</span>;
    };

    const SectorTemplate = (rowData) => {
        return <span>{rowData.sector.sector_short_name.toUpperCase()}</span>;
    };
    return (
        <div className="mt-4 w-full">
            <div className='flex justify-between'>
                <h1 className="text-2xl font-bold p-2">All Batches</h1>
                <span className="p-input-icon-left w-full sm:w-auto">
                    <label htmlFor="filterbatches" className='font-semibold mr-2'>Filter Batches By Status</label>
                    <Dropdown
                        value={selectedStatus}
                        options={statusOptions}
                        onChange={handleStatusChange}
                        placeholder="Select Status"
                        className=" mb-4 lg:mr-8 border border-gray-500"
                    />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search..."
                        className="p-2 mr-2 rounded-sm mb-4"
                    />
                </span>

            </div>
            <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[85rem] xl:max-w-[100%]">
                <DataTable
                    value={filteredBatches}
                    paginator rows={10}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    responsiveLayout="scroll"
                    scrollable={true}
                    globalFilter={globalFilter}
                    className="min-w-full overflow-x-auto bg-white border rounded-lg text-black"
                >
                    <Column field="no" header="Batch No" className="py-2 text-center px-4 border-b" />
                    <Column field="name" header="Batch Name" className="py-2 px-4 border-b" />
                    <Column body={batchStatusTemplate} header="Batch Status" className="py-2 px-4 text-center border-b" />
                    <Column field="assessor.name" header="Assessor" className="py-2 px-4 text-center border-b" />
                    <Column field="type" header="Batch Type" className="py-2 px-4 border-b text-center" />
                    <Column field="noOfCandidates" header="Candidates" className="py-2 px-4 border-b text-center" />
                    <Column body={startDateBodyTemplate} header="Start Date (yyyy-mm-dd)" className="py-2 px-4 border-b" style={{ width: '170px' }} />
                    <Column body={endDateBodyTemplate} header="End Date (yyyy-mm-dd)" className="py-2 px-4 border-b" style={{ width: '170px' }} />
                    <Column field="durationInMin" header="Duration" className="py-2 px-4 border-b text-center" />
                    <Column body={SectorTemplate} header="Sector" className="py-2 px-4 border-b text-center" />
                    <Column field="jobRole.name" header="Job Role" className="py-2 px-4 border-b text-center" />
                </DataTable>
            </div>
            <span className="mt-4 font-semibold p-2">Total Records: {filteredBatches.length}</span>
        </div>
    );
};

export default AllBatches;