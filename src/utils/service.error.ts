export const createServiceError = (
  message: string = "Server side error!",
  status: number = 500
) => {
  return {
    success: false,
    message,
    status,
  };
};

export type TcreateServiceSuccess = {
  success: boolean;
  message: string;
  status?: number;
};
