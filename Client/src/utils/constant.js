export const HOST = import.meta.env.VITE_HOST;


const AUTH_ROUTE = "/api/auth";
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/sign-up`;
export const GET_USER_INFO_ROUTE = `${AUTH_ROUTE}/user-info`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;


const REPORT_ROUTE = "/api/report";
export const GET_REPORT_ROUTE = `${REPORT_ROUTE}/get-recent-report`;
export const CREATE_REPORT_ROUTE = `${REPORT_ROUTE}/create-report`;


const COLLECT_WASTE = '/api/get-report';
export const COLLECT_WASTE_ROUTE = `${COLLECT_WASTE}/collect-waste`;


export const IMPACT_DATA_ROUTE = "/api/impact-data"