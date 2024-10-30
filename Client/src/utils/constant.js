export const HOST = import.meta.env.VITE_HOST;


const AUTH_ROUTE = "/api/auth";
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/sign-up`;
export const GET_USER_INFO_ROUTE = `${AUTH_ROUTE}/user-info`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;


const REPORT_ROUTE = "/api/report";
export const GET_REPORT_ROUTE = `${REPORT_ROUTE}/get-recent-report`;
export const CREATE_REPORT_ROUTE = `${REPORT_ROUTE}/create-report`;
export const GET_REPORTS_TO_COLLECT = `${REPORT_ROUTE}/get-reports`
export const UPDATE_REPORT_STATUS = `${REPORT_ROUTE}/update-report`

const COLLECT_WASTE = '/api/get-report';
export const COLLECT_WASTE_ROUTE = `${COLLECT_WASTE}/collect-waste`;


export const IMPACT_DATA_ROUTE = "/api/impact-data"

export const Gemini_Api_key = import.meta.env.VITE_GEMINI_API_KEY;
export const Location_Api = import.meta.env.VITE_LOCATION_API;
// export const location_list_Api =`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`