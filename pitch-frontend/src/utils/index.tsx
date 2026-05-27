import { APISuccessResponseInterface } from "@/interface/api";
import { AxiosResponse } from "axios";

export const requestHandler = async (
  api: () => Promise<AxiosResponse<APISuccessResponseInterface, any>>,
  setLoading: ((loading: boolean) => void) | null,
  onSuccess: (data: APISuccessResponseInterface) => void,
  onError: (error: string) => void
) => {

    setLoading && setLoading(true);
  try {
    
    const response = await api();
    const { data } = response;
    if (data?.success) {
      onSuccess(data);
    }
  } catch (error: any) {
      console.warn(error);
    if ([401, 403].includes(error?.response?.status)) {
      localStorage.clear(); 
      window.location.href = "/login"; 
    }
    onError(error?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading && setLoading(false);
  }
};
