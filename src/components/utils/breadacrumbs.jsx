
export const belongsTo = (pathname) => {
    const adminRoutes = ["/manageJobRole", "/manageNOSDetails", "/managePC", "/manageTP", "/manageAssessor"];
    if (adminRoutes.includes(pathname))
      return "";
  
    const superAdminRoutes = ["/manageSector", "/manageScheme", "/manageCountry", "/manageState", "/manageCity"];
    if (superAdminRoutes.includes(pathname))
      return "";
  
    const BatchRoutes = ["/manageBatch", "/manageCandidate", "/assignBatch"];
  
    if (BatchRoutes.includes(pathname))
      return "";
  
    const reportsRoutes = ["/batchReport", "/batchResult"];
    if (reportsRoutes.includes(pathname))
      return "";

    const UserRoutes = ["/manageSubAdmin"];
  
    if (UserRoutes.includes(pathname))
      return "";
    const QuestionRoutes = ["/manageQuestionSet", "/manageQuestion", "/addBulkQuestion"];
  
    if (QuestionRoutes.includes(pathname))
      return "";
  
    const EvidenceRoutes = ["/batchEvidence", "/batchEvidence/candidate/:candidateId"];
    if (EvidenceRoutes.includes(pathname))
      return "";
  
  
    const CreditManagementRoutes = ["/requestCredit"];
  
    if (CreditManagementRoutes.includes(pathname))
      return "";

    const BatchesRoutes = ["/assignedBatches", "/completedBatches", "/ongoingBatches"];
  
    if (BatchesRoutes.includes(pathname))
      return "";
  }