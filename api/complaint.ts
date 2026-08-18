import { dataURItoBlob } from "@/utilities/imageConversion";
import apiBuilder from "./apiBuilder";
export const FORM_TYPE = {
  Complaint: "complaint",
  Contact: "contact",
};
export interface IComplaintData {
  name: string;
  phone: string;
  email?: string;
  content: string;
  form_type: string;
  image?: any;
}
export const complaintValues: IComplaintData = {
  name: "",
  phone: "",
  email: "",
  content: "",
  form_type: FORM_TYPE.Complaint || FORM_TYPE.Contact,
  image: null,
};

const submitComplaint = async (data: IComplaintData) => {
  const url = `/api/submit_contact_form`;
  const bodyParams: { [key: string]: any } = {
    name: data.name,
    phone: data.phone,
    content: data.content,
    form_type: data.form_type,
  };

  if (!!data.email) {
    bodyParams["email"] = data.email;
  }
  if (!!data.image) {
    bodyParams["image"] = dataURItoBlob(data.image);
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setBody(bodyParams)
    .call();
};

export { submitComplaint };
