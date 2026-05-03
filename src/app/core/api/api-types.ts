export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface SuccessResponse {
    success: boolean;
    message?: string;
}
