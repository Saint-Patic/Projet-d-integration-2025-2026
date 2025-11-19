import api from "./api";

export interface FieldCreateRequest {
  name: string;
  corners: any;
}

export const createField = async (payload: FieldCreateRequest) => {
  try {
    const response = await api.post("/fields", {
      name: payload.name,
      corners: payload.corners,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating field:", error);
    throw error;
  }
};

export const getFields = async () => {
  try {
    const res = await api.get("/fields");
    return res.data;
  } catch (err) {
    console.error("Error fetching fields:", err);
    throw err;
  }
};

export default { createField, getFields };
