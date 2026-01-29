export class ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];

  constructor(success: boolean, message: string, data?: any, errors?: any[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success(message: string, data?: any) {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, errors?: any[]) {
    return new ApiResponse(false, message, undefined, errors);
  }
}