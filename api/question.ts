import apiBuilder from "./apiBuilder";

export interface IQuestionData {
  name: string;
  phone: string;
  email?: string | undefined;
  content: string;
}
export const questionValues: IQuestionData = {
  name: "",
  phone: "",
  email: "",
  content: "",
};

const submitQuestion = async (data: IQuestionData) => {
  const url = `/api/submit_faq_form`;
  const params: { [key: string]: any } = {
    name: data.name,
    phone: data.name,
    content: data.content,
  };
  if (!!data.email) {
    params["email"] = data.email;
  }
  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { submitQuestion };
