export const ROUTES = {
  // Auth Stack
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Candidate Tabs
  CANDIDATE_ROOT: 'CandidateRoot',
  CANDIDATE_JOB_FEED: 'CandidateJobFeed',
  CANDIDATE_SAVED_JOBS: 'CandidateSavedJobs',
  CANDIDATE_PROFILE: 'CandidateProfile',
  CANDIDATE_COMPLETE_PROFILE: 'CandidateCompleteProfile',

  // Recruiter Tabs
  RECRUITER_ROOT: 'RecruiterRoot',
  RECRUITER_JOB_FEED: 'RecruiterJobFeed',
  RECRUITER_POST_JOB: 'RecruiterPostJob',
  RECRUITER_PROFILE: 'RecruiterProfile',
  RECRUITER_COMPLETE_PROFILE: 'RecruiterCompleteProfile',

  // Job Operations Stack
  JOB_DETAIL: 'JobDetail',
  JOB_APPLICANTS_LIST: 'JobApplicantsList',
  APPLICANT_REVIEW: 'ApplicantReview',
} as const;
