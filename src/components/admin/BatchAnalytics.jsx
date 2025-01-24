import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BarChart from "../../Charts/BarChart";
import { BASE_URL } from "../../constant";

function BatchAnalytics() {
  console.log("batch analytics");
  const [matrics, setMatrics] = React.useState();
  console.log("matrics = ", matrics);
  const params = useParams();
  const prepareMatrics = (report) => {
    const matrics = {
      batchNo: report.batchNo,
      overAllScore: 0,
    };
    const nosWiseAttempts = {};
    const nosWisePassFailCandidates = {};
    const overallPassFailAbsentPresentCandidates = {
      passCandidates: 0,
      failCandidates: 0,
      absentCandidates: 0,
      presentCandidates: 0,
    };
    let score = 0;
    report.nosWiseReport.forEach((r) => {
      let currStudentScore = 0;
      for (const [nos, value] of Object.entries(r.report)) {
        score += value.currMarks;
        currStudentScore += value.currMarks;
        if (nosWiseAttempts[nos]) {
          nosWiseAttempts[nos]["totalAttempts"] += value.totalAttempts;
          nosWiseAttempts[nos]["correctAttempts"] += value.correctAttempts;
          nosWiseAttempts[nos]["incorrectAttempts"] += value.incorrectAttempts;
          nosWiseAttempts[nos]["currMarks"] += value.currMarks;
        } else {
          nosWiseAttempts[nos] = {
            totalAttempts: value.totalAttempts,
            correctAttempts: value.correctAttempts,
            incorrectAttempts: value.incorrectAttempts,
            currMarks: value.currMarks,
          };
        }
        if (nosWisePassFailCandidates[nos]) {
          if (
            (value.currMarks / value.maxMarks) * 100 >=
            value.passingPercentage
          ) {
            nosWisePassFailCandidates[nos]["passCandidates"] += 1;
          } else {
            nosWisePassFailCandidates[nos]["failCandidates"] += 1;
          }
        } else {
          nosWisePassFailCandidates[nos] = {
            passCandidates: 0,
            failCandidates: 0,
          };
          if (
            (value.currMarks / value.maxMarks) * 100 >=
            value.passingPercentage
          ) {
            nosWisePassFailCandidates[nos]["passCandidates"] += 1;
          } else {
            nosWisePassFailCandidates[nos]["failCandidates"] += 1;
          }
        }
      }

      if (
        (currStudentScore / report.batchTotalMarks) * 100 >=
          report.batchPassingPercentage &&
        r.isPresent
      ) {
        overallPassFailAbsentPresentCandidates["passCandidates"] += 1;
      } else if (r.isPresent) {
        overallPassFailAbsentPresentCandidates["failCandidates"] += 1;
      }
      if (r.isPresent) {
        overallPassFailAbsentPresentCandidates["presentCandidates"] += 1;
      } else {
        overallPassFailAbsentPresentCandidates["absentCandidates"] += 1;
      }
      matrics.overAllScore = score;
    });

    matrics.nosWiseAttempts = nosWiseAttempts;
    matrics.nosWisePassFailCandidates = nosWisePassFailCandidates;
    matrics.overallPassFailAbsentPresentCandidates =
      overallPassFailAbsentPresentCandidates;
    matrics.overallPassFailAbsentPresentCandidates.totalEnrolledCandidate =
      matrics.overallPassFailAbsentPresentCandidates.presentCandidates +
      matrics.overallPassFailAbsentPresentCandidates.absentCandidates;
    return matrics;
  };
  const [overallBatchPerformanceData, setOverallBatchPerformanceData] =
    useState({
      labels: ["loading..."],
      datasets: [
        {
          label: "-------",
          data: [0, 0, 0],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  const [overallBatchPerformanceOptions, setOverallBatchPerformanceOptions] =
    useState({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Overall Batch Score",
        },
      },
    });
  const [noswiseBatchPerformanceData, setNoswiseBatchPerformanceData] =
    useState({
      labels: ["loading..."],
      datasets: [
        {
          label: "-------",
          data: [0, 0, 0],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  const [noswiseBatchPerformanceOptions, setNoswiseBatchPerformanceOptions] =
    useState({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "NOS WISE BATCH PERFORMANCE",
        },
      },
    });
  const [noswisePassFailData, setNoswisePassFailData] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [noswisePassFailOptions, setNoswisePassFailOptions] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "NOS WISE PASS/FAIL CANDIDATES",
      },
    },
  });

  const [
    overallPassFailAbsentPresentCandidates,
    setOverallPassFailAbsentPresentCandidates,
  ] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [
    overallPassFailAbsentPresentCandidatesOptions,
    setOverallPassFailAbsentPresentCandidatesOptions,
  ] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Overall Pass/Fail Candidates",
      },
    },
  });
  const [noswiseAttempts, setNoswiseAttempts] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [noswiseAttemptsOptions, setNoswiseAttemptsOptions] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "NOS WISE ATTEMPTS",
      },
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${BASE_URL}company/batch-analytics/${params.link}`
      );
      const data = await response.json();
      console.log(data);
      const reports = data.data;
      console.log(reports[0]);
      console.log(reports[0].nosWiseReport);
      const mat = [];
      for (let i = 0; i < reports.length; i++) {
        mat.push(prepareMatrics(reports[i]));
      }
      setMatrics(mat);
      setOverallBatchPerformanceData({
        labels: mat?.map((batch) => batch.batchNo),
        datasets: [
          {
            label: "Overall Score",
            data: mat?.map((batch) => batch.overAllScore),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
      setOverallBatchPerformanceOptions({
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Overall Batch Score",
          },
        },
      });
      setNoswiseBatchPerformanceData({
        labels: Object.keys(mat[0].nosWiseAttempts),
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: Object.values(batch.nosWiseAttempts).map(
                (attempt) => attempt.currMarks
              ),
              backgroundColor: randomColor,
            };
          }),
        ],
      });
      setNoswiseBatchPerformanceOptions({
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "NOS WISE BATCH PERFORMANCE",
          },
        },
      });
      setNoswisePassFailData({
        labels: Object.keys(mat[0].nosWisePassFailCandidates),
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: Object.values(batch.nosWisePassFailCandidates).map(
                (attempt) => attempt.passCandidates
              ),
              backgroundColor: randomColor,
            };
          }),
        ],
      });
      setOverallPassFailAbsentPresentCandidates({
        labels: [
          "TOTAL ENROLLED CANDIDATES",
          "PRESENT CANDIDATES",
          "ABSENT CANDIDATES",
          "PASSES CANDIDATES",
          "FAIL CANDIDATES",
        ],
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: [
                batch.overallPassFailAbsentPresentCandidates
                  .totalEnrolledCandidate,
                batch.overallPassFailAbsentPresentCandidates.presentCandidates,
                batch.overallPassFailAbsentPresentCandidates.absentCandidates,
                batch.overallPassFailAbsentPresentCandidates.passCandidates,
                batch.overallPassFailAbsentPresentCandidates.failCandidates,
              ],
              backgroundColor: randomColor,
            };
          }),
        ],
      });
      setNoswiseAttempts({
        labels: Object.keys(mat[0].nosWiseAttempts),
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: Object.values(batch.nosWiseAttempts),
              backgroundColor: randomColor,
            };
          }),
        ],
      });
    };
    fetchData();
  }, []);

  return (
    <div className="p-5 flex-col items-center justify-center gap-5">
      <div
        id="chart"
        className="batch-analytics flex w-screen  items-center justify-between gap-5"
      >
        <div className="w-[45%]">
          <BarChart
            options={overallBatchPerformanceOptions}
            data={overallBatchPerformanceData}
          />
        </div>
        <div className="w-[45%]">
          <BarChart
            options={noswiseBatchPerformanceOptions}
            data={noswiseBatchPerformanceData}
          />
        </div>
      </div>
      <div className=" w-screen flex items-center justify-between gap-5">
        <div className="w-[45%]">
          <BarChart
            options={noswisePassFailOptions}
            data={noswisePassFailData}
          />
        </div>
        <div className="w-[45%]">
          <BarChart
            options={overallPassFailAbsentPresentCandidatesOptions}
            data={overallPassFailAbsentPresentCandidates}
          />
        </div>
      </div>
      <BarChart options={noswiseAttemptsOptions} data={noswiseAttempts} />
    </div>
  );
}

export default BatchAnalytics;
