
import { useState } from 'react';
import Swal from 'sweetalert2';
import ChartOne from '../Charts/ChartOne';
import ChartTwo from '../Charts/ChartTwo';
import Total from '../Charts/Total';
import { BASE_URL } from '../constant';
import AllBatches from './AllBatches';


const Dashboard = () => {

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleSummary = async() => {
        const url = new URL(`${BASE_URL}company/request-summary-report`);
        url.searchParams.append('from', fromDate);
        url.searchParams.append('to', toDate);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
           
        });

        const data = await response.json();
        if(response.status === 200){
            // toast.success(data.message);
             Swal.fire({
                            html:`<div class="custon-error-container">
                                          <div class="custom-swal-icon-wrapper">
                                          <i class="fa fa-check-circle custom-success-icon"></i>
                                          </div>
                                          <hr class="custom-error-divider" />
                                          <div class="custom-error-message capitalize">${data.message}</div>
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
        }
       
    }


    return (
        <>
            {('admin') && (
                <>
                    <Total />
                    <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5 p-2">
                        <ChartOne />
                        <ChartTwo />
                    </div>
                    <div className='flex justify-start gap-4 my-8'> 
                        <div>
                        <label htmlFor="from" className='p-3 font-bold text-lg'>From</label>
                        <input type="date" className="mt-4 rounded-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                       
                       <div>
                       <label htmlFor="to" className='p-3 font-bold text-lg'>To</label>
                        <input type="date" className="mt-4 rounded-sm" value={toDate} onChange={(e)=>setToDate(e.target.value)} />

                       </div>
                      
                        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSummary}>
                            Request Summary Report
                        </button>
                    </div>
                    <div>
                        <AllBatches />
                    </div>
                </>
            )}
        </>
    );
};

export default Dashboard;