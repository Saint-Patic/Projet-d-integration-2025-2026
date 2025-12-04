import apiClient from "./apiClient";

export interface FieldCreateRequest {
  name: string;
  corners: any;
}

export const createField = async (payload: FieldCreateRequest) => {
  try {
    const response = await apiClient.post("/fields", {
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
    const res = await apiClient.get("/fields");
    return res.data;
  } catch (err) {
    console.error("Error fetching fields:", err);
    throw err;
  }
};

export const deleteField = async (nameOrId: string | number) => {
  try {
    // Prefer deletion by name: call the server route /fields/name/:name
    // If caller passes a number, convert to string
    const asString = String(nameOrId);
    const res = await apiClient.delete(`/fields/name/${encodeURIComponent(asString)}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting field:", err);
    throw err;
  }
};

export default { createField, getFields, deleteField };
